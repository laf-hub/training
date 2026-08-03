// Course progress tracking, stored client-side in localStorage.
// Gates module order and exam access. Enforced here (not just by hiding
// links) so direct URL access to a locked module or the exam is also
// redirected - see the guard block below, which runs synchronously in
// <head> before the rest of the page renders.
//
// Also implements an internal review mode (see the REVIEW MODE section)
// for checking module content without going through normal learner
// gating. Review mode never reads or writes the learner progress store.
(function (global) {
  var STORAGE_KEY = "fhsc-progress-v1";
  var TOTAL_MODULES = 10;

  function readCompleted() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(function (n) { return Number.isInteger(n) && n >= 1 && n <= TOTAL_MODULES; }) : [];
    } catch (e) {
      return [];
    }
  }

  function writeCompleted(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      // localStorage unavailable (private browsing limits, etc.) - progress just won't persist.
    }
  }

  function getCompleted() {
    return readCompleted().slice().sort(function (a, b) { return a - b; });
  }

  function isModuleComplete(n) {
    return readCompleted().indexOf(n) !== -1;
  }

  function markModuleComplete(n) {
    if (global.FHSCReview && global.FHSCReview.active) return; // never alter real progress in review mode
    var completed = readCompleted();
    if (completed.indexOf(n) === -1) {
      completed.push(n);
      writeCompleted(completed);
    }
  }

  function isModuleUnlocked(n) {
    if (n <= 1) return true;
    return isModuleComplete(n - 1);
  }

  function allModulesComplete() {
    return getCompleted().length >= TOTAL_MODULES;
  }

  var api = {
    TOTAL_MODULES: TOTAL_MODULES,
    getCompleted: getCompleted,
    isModuleComplete: isModuleComplete,
    markModuleComplete: markModuleComplete,
    isModuleUnlocked: isModuleUnlocked,
    allModulesComplete: allModulesComplete,
  };
  global.FHSCProgress = api;

  // --- REVIEW MODE ------------------------------------------------------
  // Activates only when the URL contains ?review=1 AND the passphrase is
  // entered correctly. Auth is cached in sessionStorage under a key that
  // is entirely separate from the learner progress store above, and is
  // scoped to the browser tab session (not persisted like localStorage).
  var REVIEW_AUTH_KEY = "fhsc-review-auth";
  var REVIEW_PASSPHRASE = "ada";
  var MODULE_FILES = {
    1: "01-legislation.html",
    2: "02-hazards-contamination.html",
    3: "03-bacteriology.html",
    4: "04-personal-hygiene.html",
    5: "05-temperature-control.html",
    6: "06-cleaning-pest-control.html",
    7: "07-haccp.html",
    8: "08-allergens.html",
    9: "09-kitchen-specific.html",
    10: "10-retail-bar-specific.html",
  };

  function reviewRequested() {
    return new URLSearchParams(window.location.search).get("review") === "1";
  }

  function reviewAuthed() {
    try {
      return sessionStorage.getItem(REVIEW_AUTH_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setReviewAuthed() {
    try {
      sessionStorage.setItem(REVIEW_AUTH_KEY, "1");
    } catch (e) {
      // sessionStorage unavailable - review mode will just re-prompt each time.
    }
  }

  var reviewActive = false;
  if (reviewRequested()) {
    if (reviewAuthed()) {
      reviewActive = true;
    } else {
      var entered = window.prompt("Review mode passphrase:");
      if (entered !== null && entered.trim().toLowerCase() === REVIEW_PASSPHRASE) {
        setReviewAuthed();
        reviewActive = true;
      }
      // Wrong or cancelled: fall through as a normal learner session.
    }
  }
  global.FHSCReview = { active: reviewActive };

  // --- Site root path, used both by the access guard's redirect target
  // and by the review nav panel's links. ---
  function siteRoot() {
    var p = window.location.pathname;
    if (p.indexOf("/modules/") !== -1 || p.indexOf("/exam/") !== -1) return "../";
    return "";
  }

  // --- Access guard: runs immediately (this script is loaded, unminified,
  // synchronously in <head>) so a locked page redirects before it renders.
  // Skipped entirely in review mode. ---
  if (!reviewActive) {
    var moduleMeta = document.querySelector('meta[name="fhsc-module"]');
    if (moduleMeta) {
      var moduleNum = parseInt(moduleMeta.getAttribute("content"), 10);
      if (moduleNum && !isModuleUnlocked(moduleNum)) {
        window.location.replace("../index.html?locked=" + moduleNum);
      }
    }
    var examGuard = document.querySelector('meta[name="fhsc-require-all"]');
    if (examGuard && !allModulesComplete()) {
      window.location.replace("../index.html?examLocked=1");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    // --- Reveal exam links once unlocked, and show progress on the homepage. ---
    var unlocked = allModulesComplete();
    var links = document.querySelectorAll("[data-exam-link]");
    Array.prototype.forEach.call(links, function (el) {
      el.style.display = (unlocked || reviewActive) ? "" : "none";
    });

    var summary = document.querySelector("[data-progress-summary]");
    if (summary) {
      var count = getCompleted().length;
      summary.textContent = count + " of " + TOTAL_MODULES + " modules completed";
    }

    var cards = document.querySelectorAll("[data-module-card]");
    Array.prototype.forEach.call(cards, function (card) {
      var n = parseInt(card.getAttribute("data-module-card"), 10);
      if (!n) return;
      var complete = isModuleComplete(n);
      var locked = !isModuleUnlocked(n);
      card.classList.toggle("mod-card--complete", complete);
      card.classList.toggle("mod-card--locked", locked);
      var status = card.querySelector(".mod-status");
      if (status) {
        status.textContent = complete ? "Completed" : locked ? "Locked" : "";
      }
      if (locked && !reviewActive) {
        card.addEventListener("click", function (e) {
          e.preventDefault();
        });
      }
    });

    var params = new URLSearchParams(window.location.search);
    var banner = document.querySelector("[data-progress-banner]");
    if (banner) {
      if (params.has("examLocked")) {
        banner.textContent = "Complete all 10 modules before you can take the exam.";
        banner.style.display = "block";
      } else if (params.has("locked")) {
        var lockedNum = parseInt(params.get("locked"), 10);
        if (lockedNum > 1) {
          banner.textContent = "Complete Module " + (lockedNum - 1) + " before starting Module " + lockedNum + ".";
          banner.style.display = "block";
        }
      }
    }

    // --- Review mode UI: banner + floating nav panel. ---
    if (reviewActive) {
      var root = siteRoot();

      var reviewBanner = document.createElement("div");
      reviewBanner.className = "review-banner";
      reviewBanner.textContent = "REVIEW MODE — timers and progress gating are bypassed. Nothing here is recorded as real learner progress.";
      document.body.insertBefore(reviewBanner, document.body.firstChild);

      var panel = document.createElement("div");
      panel.className = "review-panel";

      var title = document.createElement("div");
      title.className = "review-panel-title";
      title.textContent = "Review navigation";
      panel.appendChild(title);

      var linkWrap = document.createElement("div");
      linkWrap.className = "review-panel-links";
      for (var i = 1; i <= TOTAL_MODULES; i++) {
        var a = document.createElement("a");
        a.href = root + "modules/" + MODULE_FILES[i] + "?review=1";
        a.textContent = "M" + i;
        linkWrap.appendChild(a);
      }
      var examLink = document.createElement("a");
      examLink.href = root + "exam/index.html?review=1";
      examLink.textContent = "Exam";
      linkWrap.appendChild(examLink);
      var homeLink = document.createElement("a");
      homeLink.href = root + "index.html?review=1";
      homeLink.textContent = "Home";
      linkWrap.appendChild(homeLink);
      panel.appendChild(linkWrap);

      var actionWrap = document.createElement("div");
      actionWrap.className = "review-panel-actions";

      var expandBtn = document.createElement("button");
      expandBtn.type = "button";
      expandBtn.textContent = "Expand all checks";
      expandBtn.addEventListener("click", function () {
        document.querySelectorAll("details.check").forEach(function (d) { d.open = true; });
      });
      actionWrap.appendChild(expandBtn);

      var exitLink = document.createElement("a");
      exitLink.className = "review-panel-exit";
      exitLink.href = window.location.pathname;
      exitLink.textContent = "Exit review mode";
      actionWrap.appendChild(exitLink);

      panel.appendChild(actionWrap);
      document.body.appendChild(panel);
    }
  });
})(window);
