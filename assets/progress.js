// Course progress tracking, stored client-side in localStorage.
// Gates module order and exam access. Enforced here (not just by hiding
// links) so direct URL access to a locked module or the exam is also
// redirected - see the guard block at the bottom of this file, which runs
// synchronously in <head> before the rest of the page renders.
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

  // --- Access guard: runs immediately (this script is loaded, unminified,
  // synchronously in <head>) so a locked page redirects before it renders. ---
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

  // --- Reveal exam links once unlocked, and show progress on the homepage. ---
  document.addEventListener("DOMContentLoaded", function () {
    var unlocked = allModulesComplete();
    var links = document.querySelectorAll("[data-exam-link]");
    Array.prototype.forEach.call(links, function (el) {
      el.style.display = unlocked ? "" : "none";
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
      if (locked) {
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
  });
})(window);
