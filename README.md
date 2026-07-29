# Food Hygiene and Safety Course (Level 2 Equivalent)

A free, self-contained online course covering food hygiene and safety at a Level 2-equivalent standard, for retail, bar and kitchen staff, with a digital exam and pass-mark certificate.

## What this is (and isn't)

This covers the same syllabus as commercial "Level 2 Food Safety and Hygiene for Catering" courses (legislation, hazards, bacteriology, personal hygiene, temperature control, cleaning/pest control, HACCP, allergens, plus kitchen- and retail/bar-specific practice), and is structured in line with CPD good-practice principles (clear learning outcomes, defined study time, an end assessment).

It is **not** a regulated qualification: only an Ofqual-recognised awarding body can issue an actual "Level 2 Award." It has also **not yet been submitted to a formal CPD accreditation body** (CPD Certification Service, CPD Standards Office, etc. all charge from ~£300 and take 6-10 weeks). That's a deliberate next step once the content has been reviewed, not an oversight.

## How it's built

Plain HTML5 / CSS3 / vanilla JavaScript: no framework, no build step, no external dependencies. Everything runs from static files, so it's free to host forever (e.g. GitHub Pages) and works offline by just opening `index.html` in a browser.

- `index.html`: course landing page and module index
- `modules/01-...html` through `10-...html`: each module is a slide deck (prev/next navigation, keyboard arrows, progress dots), built with the shared engine in `assets/slides.js`. The first slide of each module is statically visible even with JavaScript disabled; prev/next navigation between the rest of a module's slides requires JS. Each module opens with a "What this module covers" preview slide (an advance organiser, listing what's ahead) with a duration estimate badge in the top-right corner, and closes with a "Summary" recap slide plus a self-check.
- `assets/style.css`: shared styling, light/dark aware
- `assets/icons/*.svg`: small original icon set used across slides
- `exam/index.html` + `exam/questions.js` + `exam/exam.js`: the 40-question bank, randomly drawn down to a 30-question exam per attempt

## Exam design

- 40 questions in the bank (4 per module); each attempt randomly draws 3 per module (30 total), with question and answer-option order shuffled, so repeated attempts don't see the exact same paper.
- Pass mark: **70%**.
- Correct answers are stored as **SHA-256 hashes** (`questionId|normalizedAnswerText`), not plain text, so casually viewing page source doesn't reveal the answer key. The learner's selected answer is hashed the same way and compared. This is a deterrent proportionate to internal compliance training, not a defence against a determined attacker. There's no server, so nothing stronger is possible without adding a backend.
- It's unproctored and doesn't verify identity. That's stated plainly on the exam page itself, not just in this README.
- On passing, the learner can generate a downloadable PNG certificate (name, score, date, and a reference ID) via an HTML canvas; no server or external service involved. The certificate text includes an honest disclaimer that it isn't a regulated qualification or formally CPD-accredited (yet).

See `AUDIT.md` for a full independent audit of this course (factual accuracy, exam quality, accessibility, practical failure points) and exactly what was fixed versus deliberately left as an open gap.

## Keeping it off search engines

- `robots.txt` at the repo root disallows all crawling.
- Every page has `<meta name="robots" content="noindex, nofollow, noarchive">`.
- The site is still **not access-controlled**: anyone with the direct link can view it and sit the exam, which is intentional for staff onboarding (no login friction). It just won't turn up in search results or be discoverable without the link.

## Hosting for free

Enable GitHub Pages on this repository (Settings → Pages), serving from this branch, root folder. The repo needs to stay public for Pages to be free. With the site files at the repo root, it's served at `https://lafromagerie.github.io/food-safety-training/` with no extra path segment.

## Possible next steps

- Submit to a CPD accreditation body once you're happy with the content (see cost/timeline note above).
- If stronger exam integrity is ever needed, move grading to a free-tier serverless function (e.g. Cloudflare Workers) so answers never reach the browser at all.
- Add more question variants per module if you want a larger question pool to draw from per attempt.
