(function () {
  const PASS_MARK = 70; // percent
  const QUESTIONS_PER_MODULE = 3; // drawn at random from each module's pool each attempt
  const COURSE_TITLE = "Food Hygiene and Safety Course (Level 2 Equivalent)";

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function sha256Hex(str) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function normalize(text) {
    return text.trim().toLowerCase();
  }

  function pickQuestionSet() {
    const byModule = {};
    EXAM_QUESTIONS.forEach((q) => {
      (byModule[q.module] = byModule[q.module] || []).push(q);
    });
    let picked = [];
    Object.keys(byModule).forEach((mod) => {
      picked = picked.concat(shuffle(byModule[mod]).slice(0, QUESTIONS_PER_MODULE));
    });
    return shuffle(picked);
  }

  let sessionQuestions = [];

  function renderExam() {
    const form = document.getElementById("exam-form");
    document.getElementById("exam-error-banner").style.display = "none";
    sessionQuestions = pickQuestionSet().map((q) => ({
      ...q,
      shuffledOptions: shuffle(q.options),
    }));

    form.innerHTML = "";
    sessionQuestions.forEach((q, idx) => {
      const block = document.createElement("div");
      block.className = "q-block";
      block.dataset.qid = q.id;
      block.setAttribute("role", "radiogroup");
      block.setAttribute("aria-labelledby", "qtext-" + q.id);

      const legend = document.createElement("p");
      legend.className = "q-text";
      legend.id = "qtext-" + q.id;
      legend.textContent = (idx + 1) + ". " + q.text;
      block.appendChild(legend);

      q.shuffledOptions.forEach((opt, oi) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = q.id;
        input.value = opt;
        input.style.marginRight = "0.6rem";
        label.appendChild(input);
        label.appendChild(document.createTextNode(opt));
        block.appendChild(label);
      });

      form.appendChild(block);
    });
  }

  async function gradeExam() {
    const unanswered = [];
    const results = await Promise.all(
      sessionQuestions.map(async (q) => {
        const selected = document.querySelector('input[name="' + q.id + '"]:checked');
        const block = document.querySelector('.q-block[data-qid="' + q.id + '"]');
        if (!selected) {
          unanswered.push(q.id);
          block.classList.add("unanswered");
          return { id: q.id, correct: false, answered: false };
        }
        block.classList.remove("unanswered");
        const candidateHash = await sha256Hex(q.id + "|" + normalize(selected.value));
        return { id: q.id, correct: candidateHash === q.hash, answered: true };
      })
    );

    if (unanswered.length > 0) {
      const banner = document.getElementById("exam-error-banner");
      banner.textContent =
        "You have " + unanswered.length + " unanswered question" + (unanswered.length === 1 ? "" : "s") +
        " (highlighted in red below). Answer all questions before submitting.";
      banner.style.display = "block";
      const first = document.querySelector('.q-block[data-qid="' + unanswered[0] + '"]');
      first.scrollIntoView({ behavior: "smooth", block: "center" });
      return null;
    }
    document.getElementById("exam-error-banner").style.display = "none";

    const correctCount = results.filter((r) => r.correct).length;
    const pct = Math.round((correctCount / results.length) * 100);
    return { correctCount, total: results.length, pct, pass: pct >= PASS_MARK };
  }

  function showResult(result) {
    document.getElementById("exam-form-wrap").style.display = "none";
    const resultEl = document.getElementById("exam-result");
    resultEl.style.display = "block";

    const scoreClass = result.pass ? "pass" : "fail";
    resultEl.innerHTML =
      '<div class="score ' + scoreClass + '">' + result.pct + "%</div>" +
      "<p>" + result.correctCount + " out of " + result.total + " correct.</p>" +
      "<p><strong>" + (result.pass ? "Pass" : "Not a pass") + "</strong> &mdash; the pass mark is " + PASS_MARK + "%.</p>" +
      (result.pass
        ? '<div id="cert-section"></div>'
        : '<p>Review the modules and try again when ready.</p><button id="retry-btn" type="button" class="cta">Retry the exam</button>');

    if (result.pass) {
      renderCertificateForm(result);
    } else {
      document.getElementById("retry-btn").addEventListener("click", () => {
        resultEl.style.display = "none";
        document.getElementById("exam-form-wrap").style.display = "block";
        renderExam();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  function renderCertificateForm(result) {
    const section = document.getElementById("cert-section");
    section.innerHTML =
      '<div class="cert-preview">' +
      "<p>Enter your name to generate your certificate:</p>" +
      '<input id="learner-name" type="text" placeholder="Full name" autocomplete="name">' +
      '<div><button id="gen-cert-btn" type="button" class="cta">Generate certificate</button></div>' +
      '<canvas id="cert-canvas" width="1200" height="850" style="display:none; max-width:100%; height:auto; margin-top:1rem; border-radius:8px;"></canvas>' +
      '<div id="cert-actions" style="display:none; margin-top:0.8rem;">' +
      '<button id="download-cert-btn" type="button" class="cta">Download certificate (PNG)</button>' +
      "</div>" +
      "</div>";

    document.getElementById("gen-cert-btn").addEventListener("click", async () => {
      const name = document.getElementById("learner-name").value.trim() || "Course Participant";
      await drawCertificate(name, result.pct);
      document.getElementById("cert-canvas").style.display = "block";
      document.getElementById("cert-actions").style.display = "block";
    });
  }

  async function drawCertificate(name, pct) {
    const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const refId = (await sha256Hex(name + "|" + pct + "|" + dateStr + "|" + Date.now())).slice(0, 10).toUpperCase();
    const canvas = document.getElementById("cert-canvas");
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;

    ctx.fillStyle = "#f7f5f0";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#8a1f11";
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, w - 60, h - 60);
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, w - 100, h - 100);

    ctx.fillStyle = "#8a1f11";
    ctx.textAlign = "center";
    ctx.font = "bold 30px Georgia, serif";
    ctx.fillText("CERTIFICATE OF COMPLETION", w / 2, 150);

    ctx.fillStyle = "#1e1e1e";
    ctx.font = "22px Georgia, serif";
    ctx.fillText("This certifies that", w / 2, 230);

    ctx.font = "bold 46px Georgia, serif";
    ctx.fillStyle = "#8a1f11";
    ctx.fillText(name, w / 2, 300);

    ctx.fillStyle = "#1e1e1e";
    ctx.font = "22px Georgia, serif";
    wrapText(ctx, "has completed the " + COURSE_TITLE + ",", w / 2, 360, w - 200, 30);
    wrapText(ctx, "covering retail, bar and kitchen food safety practice,", w / 2, 395, w - 200, 30);
    wrapText(ctx, "achieving a score of " + pct + "%.", w / 2, 430, w - 200, 30);

    ctx.font = "20px Georgia, serif";
    ctx.fillText("Date completed: " + dateStr, w / 2, 500);
    ctx.font = "14px Georgia, serif";
    ctx.fillStyle = "#5a5a5a";
    ctx.fillText("Certificate reference: " + refId, w / 2, 525);

    ctx.font = "italic 15px Georgia, serif";
    ctx.fillStyle = "#5a5a5a";
    wrapText(ctx, "This course is structured in line with CPD good-practice principles. It is an internal training", w / 2, 620, w - 240, 22);
    wrapText(ctx, "resource and has not been submitted to a formal CPD accreditation body.", w / 2, 645, w - 240, 22);
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let curY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n] + " ";
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderExam();
    document.getElementById("submit-exam-btn").addEventListener("click", async () => {
      const btn = document.getElementById("submit-exam-btn");
      btn.disabled = true;
      btn.textContent = "Grading...";
      const result = await gradeExam();
      btn.disabled = false;
      btn.textContent = "Submit exam";
      if (result) showResult(result);
    });

    document.body.addEventListener("click", (e) => {
      if (e.target && e.target.id === "download-cert-btn") {
        const canvas = document.getElementById("cert-canvas");
        const link = document.createElement("a");
        link.download = "food-hygiene-certificate.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    });
  });
})();
