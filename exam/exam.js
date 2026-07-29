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

  const CERT_COLORS = {
    background: "#fbf8f2",
    bronze: "#7a5a32",
    bronzeDark: "#4f3922",
    gold: "#b89552",
    text: "#1c1a17",
    textMuted: "#5f584f",
  };

  const SIGNATORIES = [
    {
      image: "../assets/signature-michael-sparrow.png",
      name: "Michael Sparrow",
      titles: ["Quality & Technical Manager", "Course Author / Technical Lead"],
    },
    {
      image: "../assets/signature-patricia-michelson.png",
      name: "Patricia Michelson",
      titles: ["Founder / Director", "Authorising Signatory"],
    },
  ];

  function fillGoldText(ctx, text, x, y, fontSizePx) {
    const gradient = ctx.createLinearGradient(0, y - fontSizePx * 0.8, 0, y + fontSizePx * 0.25);
    gradient.addColorStop(0, "#f0dca0");
    gradient.addColorStop(0.5, "#c8a13a");
    gradient.addColorStop(1, "#8a6a24");
    ctx.save();
    ctx.shadowColor = "rgba(74, 55, 20, 0.25)";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = gradient;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function drawCertificate(name, pct) {
    const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const refId = (await sha256Hex(name + "|" + pct + "|" + dateStr + "|" + Date.now())).slice(0, 10).toUpperCase();
    const canvas = document.getElementById("cert-canvas");
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    const c = CERT_COLORS;

    const [logoImg, ...sigImgs] = await Promise.all([
      loadImage("../assets/la-fromagerie-logo.jpg"),
      ...SIGNATORIES.map((s) => loadImage(s.image)),
    ]);

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = c.background;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = c.bronzeDark;
    ctx.lineWidth = 10;
    ctx.strokeRect(24, 24, w - 48, h - 48);
    ctx.strokeStyle = c.gold;
    ctx.lineWidth = 3;
    ctx.strokeRect(44, 44, w - 88, h - 88);

    const logoW = 300;
    const logoH = logoW * (logoImg.height / logoImg.width);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(logoImg, w / 2 - logoW / 2, 68, logoW, logoH);
    ctx.globalCompositeOperation = "source-over";

    ctx.textAlign = "center";
    ctx.fillStyle = c.bronzeDark;
    ctx.font = "15px Georgia, serif";
    ctx.fillText("ISSUED BY LA FROMAGERIE LTD", w / 2, 68 + logoH + 30);

    ctx.strokeStyle = c.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 90, 68 + logoH + 44);
    ctx.lineTo(w / 2 + 90, 68 + logoH + 44);
    ctx.stroke();

    ctx.font = "bold 30px Georgia, serif";
    fillGoldText(ctx, "CERTIFICATE OF COMPLETION", w / 2, 68 + logoH + 90, 30);

    ctx.fillStyle = c.text;
    ctx.font = "22px Georgia, serif";
    ctx.fillText("This certifies that", w / 2, 68 + logoH + 140);

    ctx.font = "bold 44px Georgia, serif";
    fillGoldText(ctx, name, w / 2, 68 + logoH + 202, 44);

    ctx.fillStyle = c.text;
    ctx.font = "22px Georgia, serif";
    const bodyTop = 68 + logoH + 250;
    wrapText(ctx, "has completed the " + COURSE_TITLE + ",", w / 2, bodyTop, w - 200, 30);
    wrapText(ctx, "covering retail, bar and kitchen food safety practice,", w / 2, bodyTop + 35, w - 200, 30);
    wrapText(ctx, "achieving a score of " + pct + "%.", w / 2, bodyTop + 70, w - 200, 30);

    ctx.font = "20px Georgia, serif";
    ctx.fillStyle = c.text;
    ctx.fillText("Date completed: " + dateStr, w / 2, bodyTop + 130);
    ctx.font = "14px Georgia, serif";
    ctx.fillStyle = c.textMuted;
    ctx.fillText("Certificate reference: " + refId, w / 2, bodyTop + 155);

    ctx.font = "italic 14px Georgia, serif";
    ctx.fillStyle = c.textMuted;
    wrapText(ctx, "This course is structured in line with CPD good-practice principles. It is an internal training", w / 2, bodyTop + 195, w - 260, 20);
    wrapText(ctx, "resource and has not been submitted to a formal CPD accreditation body.", w / 2, bodyTop + 217, w - 260, 20);

    const sigLineY = h - 118;
    const sigCenters = [w * 0.28, w * 0.72];
    SIGNATORIES.forEach((sig, i) => {
      const img = sigImgs[i];
      const sigH = 46;
      const sigW = sigH * (img.width / img.height);
      const cx = sigCenters[i];
      ctx.drawImage(img, cx - sigW / 2, sigLineY - sigH - 6, sigW, sigH);

      ctx.strokeStyle = c.gold;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 130, sigLineY);
      ctx.lineTo(cx + 130, sigLineY);
      ctx.stroke();

      ctx.fillStyle = c.bronzeDark;
      ctx.font = "bold 16px Georgia, serif";
      ctx.fillText(sig.name, cx, sigLineY + 24);

      ctx.fillStyle = c.textMuted;
      ctx.font = "13px Georgia, serif";
      sig.titles.forEach((line, li) => {
        ctx.fillText(line, cx, sigLineY + 42 + li * 17);
      });
    });
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
