# Design QA — CKF institutional site

## Comparison target

- Source visual truth: `C:/Users/Kauerc/AppData/Local/Temp/codex-clipboard-fdd3b19b-aecf-47e4-bb49-0f9e7cbd10cc.png`
- Browser-rendered implementation: `implementation-viewport.png`
- Combined comparison evidence: `design-qa-comparison.png`
- State: desktop, initial home position; header, hero and start of the credibility section visible.
- Source dimensions: 799 × 1967 px at 72 dpi.
- Implementation dimensions: 1265 × 712 px at 72 dpi; browser viewport capture.
- Normalization: both captures were resized to 620 px wide and composited side by side in `design-qa-comparison.png`. The full reference is retained at left to preserve its visual context; the shared above-the-fold hero area is the focused comparison region.

## Findings

- No actionable P0, P1, or P2 differences in the focused desktop comparison.
  - Fonts and typography: a condensed industrial display face and a compact UI face preserve the target's hierarchy, uppercase treatment and strong hero emphasis.
  - Spacing and layout rhythm: the implementation intentionally provides a broader desktop reading width while retaining the reference's left-aligned hero hierarchy, dark image treatment and generous section pacing.
  - Colors and visual tokens: black, warm white and CKF yellow are consistently mapped across header, CTA, icon accents and credibility bar.
  - Image quality and asset fidelity: original CKF transparent logo is used; the photographic assets are high-resolution, context-specific maintenance and industrial images with equivalent dark editorial treatment.
  - Copy and content: the approved messages — `Sua operação precisa continuar.`, `Quem confia, não para.`, `Equipamento parado custa alto.` and the three-step process — are present and legible.
  - Interaction: all primary CTAs use the same WhatsApp quotation link; the navigation and section links are present in the rendered DOM. Browser console captured no warnings or errors.

## Open questions

- The two displayed WhatsApp numbers are retained from the approved visual reference. They should be confirmed before a public launch.

## Implementation checklist

1. Confirm final WhatsApp numbers and replace the placeholder/consolidated link if necessary.
2. Add real CKF case studies only when approved photography and project permission are available.

## Follow-up polish

- P3: refine the hero's overlay geometry further if the original non-rectangular panel becomes a mandatory brand pattern.
- P3: perform a content pass with the CKF team to calibrate service descriptions for local terminology.

## Comparison history

- Initial comparison: only build/runtime export error found (`App` export mismatch); fixed by exporting the React component as a named export.
- Post-fix evidence: production build, Sites packaging tests and browser-rendered capture passed; no browser console warnings or errors.
- Refinement pass: replaced the hero, concrete and welding imagery with CKF-uniform scenes; strengthened the hero's angular yellow contour, card corner marks, credibility dividers and process route. `implementation-viewport-refined.png` shows the refreshed desktop hero. Production build and Sites packaging tests passed again; browser console remained clean.

final result: passed
