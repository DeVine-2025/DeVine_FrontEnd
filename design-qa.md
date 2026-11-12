# Recommended project card design QA

final result: passed

- Reference: user-provided ConnectUp card, 490 × 581 px.
- Implementation: developer home, dark theme, 1685 × 1051 viewport. The ConnectUp card was captured and compared alongside the reference at the same card width.
- Typography and copy: title, description, domain, reason and three statistics follow the reference hierarchy. The actual mock deadline is shown as `11.03`; the sample score is identified as an example.
- Layout and spacing: image, bookmark, summary, reason and three divided statistics match the reference structure. The existing four-column grid makes cards narrower than the supplied standalone example; typography and padding are scaled accordingly.
- Colors and tokens: charcoal surfaces, pale text, violet score and segmented recruitment bar follow the reference.
- Image and assets: the existing Devine thumbnail and bookmark/check assets are retained. The score ring uses a circular progress component.
- Interaction: opening and closing the ConnectUp preview was verified; bookmark controls remain available. The production build passed.
- Follow-up polish: the reference uses a full year in its date; current mock data contains only month and day, so no year was invented.

## Project explore page design QA

- Source: `C:/Users/user/AppData/Local/Temp/codex-clipboard-13f79a96-daa9-455d-a227-e377936e5bac.png` (1476 × 1026).
- Implementation: `C:/Users/user/AppData/Local/Temp/devine-explore-qa.png` (1584 × 1050), desktop dark theme, list view. Comparison: `C:/Users/user/AppData/Local/Temp/devine-explore-compare.png`; each full view was scaled to 738 px wide. Reference has a selected status filter; the implementation shows all home mock projects by default.
- Typography: existing site font, compact labels and stronger page/card titles preserve the reference hierarchy. Data and labels come from the home mocks instead of the reference's fictional counts and projects.
- Spacing/layout: left filter panel, search and toolbar above horizontal project rows, thumbnail, metadata, recruitment and deadline columns follow the reference. Different viewport width and existing site header account for framing differences.
- Colors: dark charcoal panels, subdued borders, purple controls and progress, and status colors match the reference direction.
- Images: existing Devine thumbnail and existing icon assets are reused; no replacement thumbnails were introduced.
- Interaction: status filter changes 8 results to 4; combining it with a project search changes results to 1. Reset, grid/list toggle and project preview were checked in the browser. Production build passed.
- Follow-up polish: the list/grid controls are text-only rather than using the reference's view icons. Mock projects without posting timestamps use the honest label 기본순 rather than an invented latest order.
- final result: passed
