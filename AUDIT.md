# Independent Audit — Food Hygiene and Safety Course

> **Status: findings below were acted on.** See "Fixes applied" at the end of
> this document for what changed and what was deliberately left as a
> documented, unresolved gap. The findings themselves are left as originally
> written — this is an audit trail, not a changelog, so don't edit the
> findings above to match the fixes.

Conducted from four adversarial perspectives: an external Level 2 trainer, an
examiner, a first-time learner, and an EHO reviewing this as evidence of
staff competence. Findings are ranked by severity. Every finding below was
verified against the actual files (grep/computed contrast ratios/cross-file
comparison), not asserted from memory.

Severity key: **CRITICAL** (breaks the core promise — competence isn't
actually measured, or content is invisible/wrong) · **HIGH** (real
factual/practical defect a trainer or EHO would fail this on) · **MEDIUM**
(gap or weak simplification, non-blocking) · **LOW** (polish).

---

## CRITICAL

### C1. The exam does not reliably measure competence — it measures the ability to spot a joke answer
**Persona: Examiner.** Of the 30 questions, roughly half use absurd,
non-plausible distractors that no trained *or untrained* person would pick:
"Ignore the question" (Q24), "Hand hygiene isn't necessary behind a till"
(Q30), "Regular gym-goers" (Q9), "Only if a customer complains" (Q27),
"Banning nuts from all kitchens" (Q23). A test-taker who has never opened
a single module can pass many of these by elimination alone. Combined with
zero scenario/application questions beyond two or three, this exam tests
recall-of-slogan and common sense, not demonstrated ability to act safely
under real conditions. This is the single biggest gap relative to what was
asked of this course.

### C2. Exam question Q14 contradicts the course's own teaching
**Persona: Examiner + Learner.** Module 5 explicitly teaches: *"Cook food
to a core temperature of at least 75°C (or 70°C held for 2 minutes)"* —
both are taught as correct. Exam Q14 asks *"What core temperature should
food generally be cooked to?"* with options 63/70/75/100°C and only hashes
**75°C** as correct. A learner who correctly remembers the module's own
70°C-for-2-minutes equivalence is marked wrong. This is not a simplification,
it's an internal contradiction between the teaching material and its own
assessment — indefensible in front of an examiner or a learner who complains.

### C3. Module content is invisible with JavaScript disabled or blocked
**Persona: Learner + EHO (auditing staff access).** Verified by grep: no
`.slide` in any of the 10 modules carries the `active` class in the static
HTML. The CSS rule is `.slide { display: none }` / `.slide.active { display:
block }`. If `slides.js` fails to load (blocked by a locked-down work PC's
content filter, an ad-blocker, a corporate proxy stripping scripts, or simply
a bad network request), the learner sees an empty box with prev/next buttons
and **zero visible content** — not a degraded experience, a *blank* one. For
a course whose whole selling point is "no cost, easy access for retail/bar
staff," this is the most likely real-world failure mode to actually occur,
and it fails silently with no error message.

### C4. Same fixed 30-question pool on every retry, with no attempt limit
**Persona: Examiner + EHO.** Every attempt draws from the exact same 30
questions (shuffled order only). There's no cooldown, no attempt cap, no
larger bank to draw a subset from. Combined with C1's weak distractors, nothing
stops a learner failing, immediately retrying, and converging on the answer
key through repeated elimination — "pass by attrition" rather than
demonstrated knowledge. An EHO treating a "pass" certificate as evidence of
trained competence would be right to question its reliability.

---

## HIGH

### H1. Hot-holding rule is oversimplified to the point of being wrong
**Persona: Trainer + EHO.** Module 5 states food can be held below 63°C for
"a maximum of two hours... and only once in that food's life." Real UK FSA
guidance is the **2-hour/4-hour rule**: under 2 hours out of temperature
control, food can go back into the fridge or hot-holding; between 2–4 hours
it can still be served but can never be returned to temperature control or
re-chilled; over 4 hours it must be thrown away. The course collapses this
into a single "two hours" figure and drops the 4-hour serve-but-don't-return
tier entirely — a working kitchen following this course's version would be
either overly restrictive or, worse, could misapply "only once" reasoning in
a way the real rule doesn't require.

### H2. No mention of safe thawing/defrosting
**Persona: Trainer + Learner.** Confirmed by grep: the word "defrost"/"thaw"
does not appear anywhere in Module 5 (Temperature Control) or anywhere else
in the course. Thawing food at room temperature is one of the most common
real-world causes of the danger-zone violations this course is trying to
prevent, and it's a standard, expected topic in every commercial Level 2
course. This is a straightforward missing-topic gap, not a simplification.

### H3. No mention of spore-forming bacteria or heat-stable toxins
**Persona: Trainer.** Clostridium perfringens and Bacillus cereus are both
named, but the course never explains *why* they're dangerous specifically in
cooling scenarios: both form heat-resistant spores that survive cooking and
germinate during slow cooling — which is the actual mechanism the "cool
within 90 minutes" rule (Module 5) is protecting against, but Module 5 and
Module 3 never connect these two ideas. Separately, Staphylococcus aureus
produces a **heat-stable toxin** — reheating contaminated food to 75°C does
**not** neutralise it. The course says the bacterium "produces a heat-resistant
toxin" but never draws the practical conclusion ("so reheating won't save
contaminated food") — a learner could reasonably conclude reheating fixes
everything, which is false and dangerous.

### H4. No mention of norovirus, despite the course relying on it
**Persona: Trainer.** Module 4 justifies the 48-hour exclusion rule by
naming norovirus, but Module 3 ("Bacteriology & Food Poisoning") — the
module that should own this — only discusses bacteria and never mentions
viruses as a hazard category at all, despite Module 2 listing "viruses" as
a microbiological hazard in passing. A learner is told the *rule* without
ever being told *what it's defending against or why it spreads so easily*
(low infective dose, person-to-person and surface transmission).

### H5. 48-hour illness exclusion is presented as an unqualified universal rule
**Persona: EHO.** Real public health guidance treats food handlers as a
"moderate risk" group requiring 48 hours symptom-free — but certain
confirmed pathogens (E. coli O157, typhoid/paratyphoid) can trigger
longer exclusion and a formal clearance requirement from public health
authorities. The course states 48 hours as a flat, unqualified rule with no
"and there are exceptions your manager/environmental health may need to
handle" caveat. Not wrong for the common case, but an EHO reviewing this
training would flag the absence of the exception.

### H6. Exam has no accessible grouping for questions
**Persona: EHO/accessibility reviewer + Learner using a screen reader.**
Confirmed by grep: zero `<fieldset>`/`<legend>` elements anywhere in the
exam. Each question is a `<div class="q-block">` with a `<p>` and bare
`<label>`-wrapped radios. Screen reader users navigating by form controls
won't reliably hear which question a given radio button belongs to —
this is a legally-relevant accessibility gap (WCAG 1.3.1, 3.3.2) for a course
explicitly intended for retail/bar/kitchen staff, a workforce with no reason
to be assumed sighted or non-disabled.

### H7. Submitting an incomplete exam gives no visible feedback
**Persona: Learner.** Verified in `exam.js`: when questions are unanswered,
the code adds a CSS class (a red left-border) to the relevant blocks and
silently scrolls to the first one — there is no banner, message, or count
telling the learner *why* nothing happened when they clicked Submit. On a
30-question page, a learner who misses one question buried in the middle
and doesn't notice the subtle border change could be stuck clicking Submit
with no idea what's wrong.

### H8. Heading hierarchy skips a level on every single page
**Persona: EHO/accessibility reviewer.** Confirmed by grep: every module
page goes from `<h1>` straight to `<h3>` with zero `<h2>` elements. This
breaks screen-reader heading navigation (users jumping by heading level
land nowhere logical) and fails WCAG 2.4.6/1.3.1. This is a mechanical fix
(rename slide headings to `<h2>`) but was simply never done.

### H9. Certificates have no tamper-evidence and no identity check
**Persona: EHO.** The certificate accepts any typed name with no
verification, generates a plain PNG with a client-side date (trivially
editable in any image editor), and has no unique ID, hash, or verification
link. As a record an EHO could rely on during an inspection, it currently
proves nothing about who actually sat the exam or when. The course README
already flags the exam's lack of proctoring, but the certificate itself
gives no visual signal of this limitation and could be presented as if it
were a robust credential.

### H10. "Level 2 equivalent" and the non-accreditation disclaimer are not equally prominent
**Persona: EHO.** The landing page headline and every module page badge say
"Level 2 equivalent" prominently. The fact that it is *not* a regulated
qualification and has *not* been submitted for CPD accreditation is present,
but as a single sentence, several lines down, in normal body text — easy to
skim past. Anyone relying on this for a compliance record should see the
limitation at the same visual weight as the headline claim.

---

## MEDIUM

### M1. Almost no scenario-based questions
**Persona: Examiner.** Beyond the point made in C1, structurally: 27 of 30
questions are direct "what is/what does X mean" recall. A genuine Level 2
competence check leans heavily on "you are doing X, what do you do next"
framing. This course barely has that.

### M2. No distinction drawn between food allergy, intolerance, and coeliac disease
**Persona: Trainer.** Module 8 treats "allergen" as a single undifferentiated
concept. Real courses (and real customer conversations) require staff to
understand that a reaction can range from a mild intolerance to a
life-threatening allergy to coeliac disease (an autoimmune condition, not an
allergy, with its own strict cross-contact tolerance) — because the
appropriate level of care differs.

### M3. No mention of "may contain" precautionary allergen labelling
**Persona: Trainer + Retail context.** Given the retail/PPDS focus, staff
should know that "may contain traces of nuts"-style advisory labelling
exists and what it does (and doesn't) mean for customer safety conversations.

### M4. Colour-coding only covers chopping boards, not cloths/utensils generally
Minor extension of an already-covered idea (Module 2), inconsistently applied.

### M5. Food Hygiene Rating Scheme display rules aren't explained
**Persona: EHO.** Module 1 mentions the 0–5 rating scheme but doesn't
mention that displaying it is a **legal requirement in Wales and Northern
Ireland** and voluntary in England — a nuance staff in different UK nations
would actually need.

### M6. Beer-line cleaning frequency presented without qualifying it as industry practice, not law
Module 10 states lines are cleaned "on a set schedule (commonly every 7
days)" — accurate as widely recommended practice, but phrased close enough
to the surrounding legal material that a learner could mistake it for a
legal requirement rather than an industry standard.

### M7. Only one self-check per module, always via a spoiler `<details>` reveal
**Persona: Learner.** Seven low-stakes recall checks (one per module) is a
thin formative-assessment layer for a course of this scope; most commercial
equivalents check understanding several times per module, not once.

### M8. Course depth/worked examples are thinner than typical commercial equivalents
**Persona: Trainer.** Topic *coverage* is right, but there's no worked
example anywhere (e.g. a walked-through HACCP hazard-analysis table for one
dish, a worked "is this food safe to serve" scenario). Total study time
(likely 45–90 minutes) is within the range some commercial L2 courses quote,
so this is a depth complaint, not a length complaint.

---

## LOW

- `lang="en"` instead of `lang="en-GB"` on every page (minor, correct language family but not locale).
- No "skip to content" link for keyboard users navigating the header nav on every page.
- Arrow-key slide navigation is a global `document` listener with no focus scoping — harmless today (no other arrow-sensitive controls exist on module pages) but fragile if the page ever gains one.
- No aria-live region announcing slide changes to screen reader users as they navigate the deck.
- No running "X of 30 answered" indicator while filling in the exam.
- Cellar temperature and beer-line intervals are stated as single figures without a range/source caveat.

---

## What was checked and found to be *fine* (reported so this isn't one-sided)

- Colour contrast: computed via the WCAG relative-luminance formula for every
  themed foreground/background pairing used in the CSS, light and dark. All
  pairs clear 4.5:1 (lowest was 5.09:1). Not a defect.
- HTML entity/ampersand escaping: no unescaped bare `&` found anywhere in the
  ten modules or the two other HTML pages.
- The one quote-style hash mismatch that existed (Q28, single vs double
  quotes producing a non-matching SHA-256) was caught and fixed during
  build-time verification, not left in — confirmed by re-running the hash
  checker (0 issues across all 30 questions) and a full pass-path browser
  test (100%, correct certificate render).
- The three legislation citations given (Food Safety Act 1990, Food Hygiene
  (England) Regulations 2006, retained Regulation (EC) 852/2004) and the 14
  listed allergens and Natasha's Law summary are all factually correct as
  stated, if incomplete (see H10, M2, M3).

---

## Fixes applied

**Fixed — critical:**
- C2 (Q14 contradiction): question rewritten so both 75°C and the 70°C/2-min
  equivalent are bundled into a single correct option.
- C3 (no-JS blank page): first `.slide` in every module now ships with the
  `active` class statically, so content is visible without JavaScript.
  Caveat: only the *first* topic within each module is reachable without JS —
  prev/next navigation still requires it. Full no-JS slide-by-slide
  navigation was not built (would need a `:target`/anchor-based redesign).
- C1/C4 (guessable exam, fixed 30-question pool enabling pass-by-attrition):
  question bank expanded from 30 to 40 (4 per module), weak/joke distractors
  rewritten to be plausible, most modules gained a scenario-based question,
  and each attempt now draws 3-of-4 per module at random rather than the
  same fixed 30 every time. This reduces, but does not eliminate, the
  attrition risk — the pool is still small enough that memorising all 40
  through repeated attempts remains possible. A materially larger bank would
  need more authoring effort than this pass covered.

**Fixed — high:**
- H1 (hot-holding oversimplification): Module 5 now teaches the actual
  2-hour/4-hour rule instead of a flattened "two hours, once only" version.
- H2 (no thawing guidance): new slide added to Module 5.
- H3 (spores/heat-stable toxins never explained): new slide added to Module 3
  connecting spore-forming bacteria to the cooling-speed rule, and toxin
  heat-stability to why reheating doesn't fix contaminated food.
- H4 (norovirus never named in the bacteriology module): new slide added.
- H5 (48-hour rule stated as absolute): caveat added to Module 4 about
  confirmed-pathogen exceptions and following medical/supervisor guidance.
- H6 (no fieldset/legend grouping): exam questions now render as
  `<fieldset>`/`<legend>` instead of bare `<div>`/`<p>`.
- H7 (silent failure on incomplete submission): a visible, `role="alert"`
  banner now states how many questions are unanswered.
- H8 (heading hierarchy skipped h2): all module slide headings changed from
  `<h3>` to `<h2>`.
- H9 (no certificate tamper-evidence): a certificate reference ID (hash of
  name+score+date+timestamp) is now printed on the certificate, and the exam
  page now states plainly that it's unproctored and identity-unverified.
  This is still not independently verifiable without a server — flagged as a
  real limitation, not solved.
- H10 (disclaimer not prominent): landing page now carries a bordered,
  same-visual-weight disclaimer box immediately under the headline, not just
  a sentence of body text.

**Fixed — medium (the cheap, high-value ones):**
- M2 (allergy/intolerance/coeliac conflated): new slide in Module 8.
- M3 ("may contain" labelling never covered): new slide in Module 8.
- M4 (cloths not included in colour-coding): folded into the existing
  Module 2 slide, with a note that colour schemes vary by kitchen.
- M5 (FHRS display-mandatory nuance): added to Module 1.
- M6 (beer-line cleaning stated close to legal-sounding language): reworded
  to explicitly flag it as industry guidance, not a legal minimum.

**Not fixed — left as documented follow-ups:**
- M1/M7/M8 (still recall-heavy overall; only one formative check per module;
  no worked HACCP example) — the new scenario questions help but this wasn't
  a full redesign of the assessment model.
- LOW items other than the two picked up (aria-live on slide progress,
  `lang="en-GB"`): no skip-link, no running "X of 30 answered" counter, no
  focus-scoping on the arrow-key deck navigation.
- The exam remains fundamentally unproctored and open-book by construction —
  disclosed clearly now, but not solvable without adding a server, which was
  out of scope for a zero-cost static site.
