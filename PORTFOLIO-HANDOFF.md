# Amanda Valverde Portfolio — Architecture & Handoff

Updated: November 12, 2026. This document describes the current local implementation, its design constraints, and remaining work. It supersedes the older README where their descriptions differ.

## Project location and status

- Workspace: `/Users/amanda/Documents/Codex/2026-10-16/referenced-chatgpt-conversation-this-is-an`
- Website root: `outputs/amanda-valverde-portfolio/` within that workspace.
- Entry point: `index.html`.
- Latest preview: <http://127.0.0.1:8765/?preview=frame-scroll-final>
- Public portfolio: <https://amandavalverde.design/>
- Recent changes were made and checked locally. They have not been published to the public site in this work session.
- The `preview` query parameter is a descriptive preview label, not a separate saved version of the website. All such URLs serve the current local files.

## Tech stack

The portfolio is a static website built with semantic HTML, CSS, and vanilla JavaScript. There is no application framework, build pipeline, database, or server-side application required for the portfolio itself.

- **HTML:** page content, project cards, case-study details, inline diagrams, contact links, and embedded artifacts.
- **CSS:** shared theme variables, responsive layouts, typography, card styling, animations, and view-specific rules.
- **JavaScript:** theme persistence, project expansion, navigation, landing previews, grid/gallery construction, gallery cycling, and proportional fitting.
- **Browser APIs:** localStorage for theme preferences, IntersectionObserver for reveal behavior, ResizeObserver for live preview sizing, and URL hashes for section navigation.
- **Fonts:** local Batica Sans plus Google Fonts Manrope; additional font assets are bundled under `assets/fonts/`.
- **Local preview:** Python's static HTTP server. Python is a development convenience, not a deployment requirement.
- **Embedded content:** local HTML artifacts and remote websites. The Civic Energy snapshot additionally references external assets, Google icon fonts, and Leaflet resources.

## Folder structure

```text
amanda-valverde-portfolio/
├── index.html                    # Main page and authoritative case-study content
├── styles.css                    # Main design system and view/responsive overrides
├── script.js                     # Main interactions and view management
├── civic-energy-preview.html     # Local Civic Energy website snapshot
├── energy-map.html
├── energy-map.css
├── energy-map.js                 # Power in Common energy ecosystem artifact
├── relationships-map.html
├── relationships-map.js
├── relationships-legend.css      # Relationships/leverage artifact and legend styling
├── deflection-map.html
├── deflection-map.css
├── deflection-map.js             # Deflection Point interactive exercise
├── healthcare-map.html
├── healthcare-map.css
├── healthcare-map.js
├── healthcare-pathways.js        # Healthcare systems artifact and pathways
├── systems-explorer.css
├── systems-explorer.js           # Shared systems-explorer support
├── EXPLORER-COMPONENT.md          # Existing artifact documentation
├── README.md                     # Older project notes
├── PORTFOLIO-HANDOFF.md           # This document
└── assets/
    ├── fonts/
    ├── mandated/
    ├── clefshift/
    ├── power-in-common/
    ├── accessible-healthcare/
    ├── vacation/
    └── amanda_valverde_resume.pdf # Current public résumé download target
```

The assets directory also contains shared images and other files. Preserve the entire directory and its relative paths when copying or publishing the website. Workspace `work/*.py` files are historical editing/generation helpers; they are not needed to run the deployed site.

## Information architecture

The main page contains a landing section with an interactive computer illustration, five case studies, About & Connect, and a footer.

| Order | Section | Purpose |
| --- | --- | --- |
| 1 | Mandated Reporter Training | Professional UX/UI production, LMS workflows, accessible courseware, testing, and handoff |
| 2 | ClefShift | Interaction design and a music-arrangement prototype |
| 3 | Power in Common | Energy systems research and the Civic Energy website |
| 4 | Accessible Healthcare Systems | Systems research, barriers to access, and interactive diagrams |
| 5 | Culture Decoder: Vacation | Culture analysis presented through an interactive microsite |
| 6 | About & Connect | Profile, background, skills, email, LinkedIn, and résumé |

The project details live in `index.html`; the gallery reuses the original project elements rather than maintaining a second independent copy of each case study. Grid cards are generated as compact previews. The gallery's About & Connect card is assembled separately from existing profile/contact content.

## View and interaction architecture

### Default view

- Landing composition precedes the full case-study cards.
- Each project has a visual, description, contribution/context information, and an expand/collapse control.
- Expanded details remain associated with their original card.
- Closed details are kept out of keyboard navigation through the existing inert behavior.

### Grid view

- Six preview cards, with About & Connect after Culture Decoder.
- Desktop overview is proportionally fitted to the viewport; internal shapes are preserved.
- A collapsed overview applies `grid-locked` to the root element and disables page scrolling and overscroll.
- Selecting a project reveals and opens the original case study and releases the scroll lock.
- Collapsing that project removes its selected state, returns to the top, and locks scrolling again.
- About & Connect is not a project accordion; its return-to-overview behavior still needs explicit regression testing.
- Grid descriptions are truncated where appropriate rather than widening a card.
- Live preview sizing uses untransformed `clientWidth`/`clientHeight`, preventing the parent scale from being applied twice.

### Gallery view

- Displays one project at a time using the original card structure.
- Shared card sizing avoids vertical jumps between collapsed cards.
- Previous/next arrows and mouse/trackpad scrolling cycle through all six items and wrap in both directions.
- Open case-study details allow normal reading/scrolling instead of wheel-driven cycling.
- Cards expand in place; they must not jump to a duplicate card below the gallery.
- Progress bar and numeric counter remain. The redundant “Scroll to advance” label has been removed.
- About & Connect contains portrait, contact box, biography, and skill pills without requiring a separate accordion.
- Its heading becomes “Let’s make the complicated feel possible.”

The active view is tracked through `body[data-work-view]`. View controls retain their selected appearance until toggled off or replaced by the other mode. Project nodes are restored to their original positions when leaving gallery mode.

### Proportional fitting

`fitBrowse()` uniformly transforms the whole browsing panel on desktop and compensates its layout height with a negative bottom margin. `sizeGallery()` measures card content and sets a shared gallery height before fitting. This preserves shapes but is sensitive to measurements, scroll anchoring, and loaded content. Do not measure already-transformed geometry when calculating an embedded preview's own scale.

## Preview and asset behavior

- **Mandated Reporter Training and ClefShift:** static browser mockup images. Grid presentation is full-width and top-aligned. Default/gallery presentation uses the requested mockup backgrounds and spacing.
- **Power in Common:** embeds `civic-energy-preview.html`. Despite UI language calling it a live preview, it is a local snapshot, not an automatically synchronized copy of the public site. Its remote assets still require network access.
- **Culture Decoder:** embeds <https://amandavalverde.design/culturedecoderapp/>. Its own site controls the video and logo reveal.
- **Gallery live previews:** fill the visual column, retain the faux browser toolbar, and have no inset frame shadow or outer padding.
- **Grid live previews:** fill their preview boxes. Slight edge overscan avoids fractional-pixel white seams.
- **Résumé:** `assets/amanda_valverde_resume.pdf`, downloaded as `Amanda_Valverde_Resume.pdf`. The current link identifies the CalCareers update from October 31. Future updates should replace the asset and refresh its cache label.

## Design rules to preserve

1. **Preserve established geometry.** Do not change button ratios, card shapes, menu behavior, typography hierarchy, or content margins to solve an unrelated sizing issue.
2. **Scale proportionally.** Fit desktop grid/gallery compositions without stretching images or independently squeezing their contents.
3. **Keep themes coherent.** Light uses paper `#F0EEEA` and ink `#131610`; dark reverses them. Maintain thin grid texture, strong borders, and offset hard shadows.
4. **Keep navigation stable.** Desktop quick-scroll/grid/gallery controls remain bottom-right and do not move between view modes. At widths of 1180px and below, they move to the top-center toolbar. Small-phone controls use smaller, still-square dimensions.
5. **Do not alter page margins to create button clearance.** Equal space around the controls is separate from content margins.
6. **Keep quick-scroll visible and context-aware.** It returns to the top of the current view. Do not add footer “Back to top” links.
7. **Center the footer statement:** “Designed with curiosity · Built with intention.”
8. **Grid hover feedback inverts colors.** Healthcare diagrams remain legible; profile-image shadows remain visible in both themes.
9. **Profile treatment:** an arched portrait with a true semicircular top, not a stretched ellipse. Grid portrait and three headline sentences sit side by side and are centered together.
10. **About headline:** keep a line break after “Warm research brain.” and “Graphic design heart.” Give the gallery headline visual impact without changing card alignment.
11. **Skill pills:** match the default page's established pill treatment; retain readable text and original shapes.
12. **Mockup consistency:** MRT uses its pale mint background and browser shadow; ClefShift uses soft purple and a comparable shadow. Grid MRT browser corners should blend with the black browser chrome.
13. **Live previews have no visible seams.** Keep the original microsite animation behavior, including Vacation's logo reveal.
14. **Landing composition:** keep text and computer close enough to feel connected, with proportional separation. Switch to a stacked layout before overlap. Current additional hero rules stack at 901–1100px; existing smaller-screen rules continue below that range.
15. **Content attribution:** Amanda's MRT role is UX/UI Producer. Platform-wide metrics and the CDSS testimonial must remain sourced and distinguished from individual contribution.

## Running and publishing

From the website root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open <http://127.0.0.1:8765/>. Serve over HTTP for preview testing rather than relying on `file://`.

For static hosting, upload the website root contents, retaining relative paths. Put `index.html` at the configured publishing root so it becomes the default page. Include all HTML, CSS, JavaScript, and assets. Python helpers and this documentation are not runtime requirements. Deployment settings, custom-domain configuration, and any existing repository hosting files should be checked before publishing.

## Recent completed work

- Corrected grid iframe measurements to prevent double scaling and white unused areas.
- Added collapsed-grid scroll locking and verified project open/close releases/restores it.
- Removed gallery live-preview inset padding and shadows while keeping browser toolbars.
- Reduced the landing text/computer separation and added a narrower-width stacking rule.
- Reset gallery position when advancing to avoid a clipped title after navigation.
- Verified the local grid state and gallery transition; checked JavaScript syntax.

## Pending tasks and known limitations

These are verification and maintenance items, not claims that each is currently broken.

### Before publishing

- Check the latest result in the user's normal Chrome window at 100% zoom, then at reduced zoom. Local checks do not yet establish a complete cross-browser/device pass.
- Test grid scroll locking with wheel, trackpad, keyboard, touch, and browser history. Confirm the title remains visible after repeated open/close cycles.
- Resolve/test the About & Connect grid return path: it has no project collapse control, so it does not naturally use the same relocking path as case studies.
- Verify phone/tablet grid access: the fitting function currently skips widths at or below 800px, while collapsed grid locking is unconditional. Ensure all cards remain reachable before considering mobile scrolling behavior complete.
- Test all gallery cards, expanded content, reverse/forward wrapping, and mode changes after expansion.
- Check seams in both themes at fractional zoom levels and different display densities.
- Check landing spacing across desktop sizes, zoom levels, and around the 1100px breakpoint.
- Verify email, LinkedIn, résumé, all external links, and interactive map embeds on the deployed host.
- Review browser-console MutationObserver errors observed during preview testing; their source was not isolated and they may originate in embedded content.
- Publish only after local review; confirm the deployed files and cache versions match the approved preview.

### Maintenance

- Consolidate repeated CSS overrides only in a dedicated, visually regression-tested cleanup. Later rules currently override earlier ones, including hero and responsive styles.
- Refresh the Civic Energy snapshot when the source website changes; document its external dependencies.
- Consider a clear fallback for remote previews if assets fail or framing is blocked.
- Refresh old README notes and add a repeatable layout/regression checklist. There is no comprehensive automated browser test suite established for these latest changes.


## November 15, 2026 update

Civic Energy links and all active iframe previews now use https://amandavalverde.design/civicenergy/ (journey links retain their fragments). This supersedes the snapshot behavior described above. About anchor spacing measures the responsive header and section padding. Case-study images warm in a low-priority two-request queue, including nested closed disclosures; intrinsic image dimensions reduce layout shifts. Browser verification at 430px: About label sits 16px below the header; all 32 case-study images loaded without expanding the studies. Changes are local and have not been deployed.

Portrait design rule: every profile frame has a true semicircular top, with equal horizontal and vertical corner radii of half its rendered width. A ResizeObserver applies this to the main portrait and grid/gallery portraits, independently of frame height. Preserve this rule when changing responsive layouts.

## Healthcare map readability update

`healthcare-map-layout.js` regenerates all 53 relationship visuals with cubic curves, samples candidate routes against node bounds, and distributes endpoint slots around each node to separate arrowheads. It retains edge IDs, colors, keyboard targets, filters, and pathway notes. Labels use collision-checked positions, appear only at readable scale, and include leaders when offset from their connections. Explicit edge selection zooms to the relationship when its label is hidden; subsequent zoom/pan does not auto-recenter. At overview scale, relationship wording remains available through selection and systems-thinking notes. Dense central and long-distance connections were checked in the browser, including manual zoom-out after selection. Some line crossings remain inherent to the dense network.

## November 15 map layout regression repair
The healthcare-only five-column sidebar layout leaked into energy, relationships, and Deflection Point because energy-map.css imported healthcare-map.css. Extracted the original shared baseline into systems-map-base.css; both healthcare-map.css and energy-map.css now import it independently. Healthcare-specific additions remain in healthcare-map.css. Cache-versioned energy-map.css references in the three affected documents. Browser-verified full-width canvases and node/sticky selection notes in all three; healthcare retains its five-column layout and curved relationships. Local repair only; not deployed.
