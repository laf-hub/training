// Minimal slide-deck controller. Expects:
// <div class="deck">
//   <section class="slide">...</section>  (repeated)
//   <div class="deck-controls">
//     <button data-action="prev">Back</button>
//     <div class="deck-progress"><span class="deck-count"></span><span class="deck-dots"></span></div>
//     <button data-action="next">Next</button>
//   </div>
// </div>
(function () {
  function initDeck(deck) {
    var slides = Array.prototype.slice.call(deck.querySelectorAll(".slide"));
    var prevBtn = deck.querySelector('[data-action="prev"]');
    var nextBtn = deck.querySelector('[data-action="next"]');
    var countEl = deck.querySelector(".deck-count");
    var dotsEl = deck.querySelector(".deck-dots");
    var current = 0;

    if (dotsEl) {
      slides.forEach(function () {
        var d = document.createElement("span");
        dotsEl.appendChild(d);
      });
    }

    function render() {
      slides.forEach(function (s, i) {
        s.classList.toggle("active", i === current);
      });
      if (countEl) countEl.textContent = "Slide " + (current + 1) + " of " + slides.length;
      if (dotsEl) {
        Array.prototype.forEach.call(dotsEl.children, function (d, i) {
          d.classList.toggle("on", i === current);
        });
      }
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.textContent = current === slides.length - 1 ? "Finish" : "Next";
      }
    }

    function go(delta) {
      var target = current + delta;
      if (target < 0) return;
      if (target >= slides.length) {
        var end = deck.getAttribute("data-end-href");
        if (end) window.location.href = end;
        return;
      }
      current = target;
      render();
      deck.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { go(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { go(1); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".deck").forEach(initDeck);
  });
})();
