# Pennridge STEM Initiative

Website for the Pennridge STEM Initiative (PSI) — a district-wide STEM pipeline
connecting elementary, middle, and high school students through hands-on
exploration days, an annual challenge-based science fair, mentorship, and
student leadership.

Founded by Soulayman Abdi, Fenix Bock, and Beau Edwards.
Co-hosted with Pennridge Student Council.

## What's here

| File | Purpose |
| --- | --- |
| `index.html` | The whole page — hero, pipeline, lab stations, entry process, timeline, leadership, FAQ, sign-up |
| `styles.css` | Design system: riso-print palette, type scale, light + dark themes |
| `main.js` | The four canvas simulations and the sign-up link wiring |

No build step, no dependencies, no framework. Open `index.html` in a browser and
it runs. Fonts load from Google Fonts; everything else ships with the page.

## The lab stations are real science

The three interactive stations mirror the actual Exploration Day experiments:

- **Oobleck** — a particle bed whose contact stiffness rises with the shear rate
  your pointer imposes. Drag slowly and it flows; drag fast and it jams into a
  bonded lattice. Apparent viscosity is computed as η = K·γ̇⁽ⁿ⁻¹⁾ with n = 1.7.
- **Volcanic Eruption** — genuine stoichiometry for
  NaHCO₃ + CH₃COOH → CO₂ + H₂O + NaCH₃COO. It finds the limiting reagent,
  computes moles of CO₂, and converts to litres at 22 °C and 1 atm
  (24.2 L/mol). Plume height scales with the yield.
- **Waves** — two travelling waves and their superposition on a string. Phase
  180° cancels; phase 0° doubles the amplitude.

The hero background is a live two-source ripple tank. Both sources are draggable.

## Before this goes public

1. **Sign-up form.** Replace the placeholder URL at the top of `main.js`:

   ```js
   var SIGNUP_FORM_URL = "https://forms.gle/REPLACE-WITH-YOUR-FORM";
   ```

   It is applied on load to every element marked `data-signup` — the nav button,
   the hero CTA, the registration strip, and two Get Involved cards — so this is
   the only place the URL needs to change.

2. **Contact email.** The Teachers and Sponsors cards in the Get Involved
   section use `mailto:` links with subject lines set but no recipient. Search
   `index.html` for `mailto:?subject=` and add the address.

3. **Fair date.** The hero stat reads `TBA` and the FAQ says dates are being
   finalized. Update both once the district confirms.

4. **Prize details.** The awards card says the structure is pending sponsorship
   rather than promising amounts. Update when sponsorships are settled.

## Publishing with GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)` → Save.
The site appears at `https://kedwards0107.github.io/pennridgeSTEM/` within a
minute or two. Every push to `main` republishes it.

## Accessibility and browser support

Light and dark themes are both built out, including the viewer's default
"system" state. The page respects `prefers-reduced-motion` (all four
simulations fall back to a static frame), keyboard focus is visible throughout,
and there is a skip link. Layout holds down to 400px wide.
