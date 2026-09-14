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

1. ~~**Sign-up form.**~~ Live. The URL sits at the top of `main.js` as
   `SIGNUP_FORM_URL` and is applied on load to every element marked
   `data-signup` — the nav button, the hero CTA, the registration strip, and two
   Get Involved cards — so that constant is the only place to change it.

2. ~~**Contact email.**~~ Done — the Teachers card emails
   `beauedwards51@gmail.com`. Sponsors now go to a dedicated Google Form
   (`SPONSOR_FORM_URL` in `main.js`, applied to every `[data-sponsor]`
   element).

3. **Fair date.** The hero stat reads `TBA` and the FAQ says dates are being
   finalized. Update both once the district confirms.

4. **Prize details.** The awards card says the structure is pending sponsorship
   rather than promising amounts. Update when sponsorships are settled.

## Domains

Live at **https://pennridgestem.org** (Vercel project `pennridge-stem`).

`pennridgestem.org` is the canonical address. Three other hostnames
301-redirect to it, configured in `vercel.json`:

| Hostname | Behaviour |
| --- | --- |
| `pennridgestem.org` | serves the site |
| `www.pennridgestem.org` | → `pennridgestem.org` |
| `pennridgestem.com` | → `pennridgestem.org` |
| `www.pennridgestem.com` | → `pennridgestem.org` |

DNS is managed at Namecheap (BasicDNS), not Vercel — so MX records for
club email can be added there later without touching this setup. Both
domains use the same two records:

| Type | Host | Value |
| --- | --- | --- |
| A Record | `@` | `76.76.21.21` |
| CNAME Record | `www` | `cname.vercel-dns.com` |

TLS certificates are issued and renewed automatically by Vercel via
Let's Encrypt. Pushing to `main` deploys to production.

## Share image

`og.png` (1200x630) is what appears when the link is posted to a group
chat, social post, or message. It is generated from `tools/og.html`,
which uses the site's own palette, type, and interference field, so it
stays consistent if the design changes. To regenerate after editing that
file:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --force-device-scale-factor=1 \
  --hide-scrollbars --window-size=1200,630 --virtual-time-budget=9000 \
  --screenshot="$PWD/og.png" "file://$PWD/tools/og.html"
```

## Analytics

Vercel Web Analytics is enabled on the project, with the tracking script
loaded from `index.html`:

```html
<script defer src="/_vercel/insights/script.js"></script>
```

It is cookieless and does not track visitors across sites, which matters
for a site aimed largely at students. Figures appear under the project's
Analytics tab; there is no separate account or key to manage.

## Publishing with GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)` → Save.
The site appears at `https://kedwards0107.github.io/pennridgeSTEM/` within a
minute or two. Every push to `main` republishes it.

## Accessibility and browser support

Light and dark themes are both built out, including the viewer's default
"system" state. The page respects `prefers-reduced-motion` (all four
simulations fall back to a static frame), keyboard focus is visible throughout,
and there is a skip link. Layout holds down to 400px wide.
