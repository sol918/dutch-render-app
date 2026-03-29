# Design System Document: The Blueprint Gallery

## 1. Overview & Creative North Star
### Creative North Star: "The Technical Curator"
This design system moves beyond simple minimalism into the realm of **Industrial Sophistication**. Inspired by the ethos of Dieter Rams and the rigor of mid-century Swiss design, the system treats digital space like a high-end architectural gallery. Every pixel must feel engineered, not just "placed." 

The goal is to eliminate the "template" aesthetic by leaning into extreme negative space, rigid mathematical grids, and a rejection of decorative flourishes. We do not use color to draw attention; we use scale, weight, and tonal shifts to command it. The interface is a "white-label" vessel for the precision of Sustainer Vlakwerk’s CNC-milled reality.

---

## 2. Colors: The Technical Palette
The palette is restricted to a monochromatic, technical spectrum. There are no accent colors. Contrast is our only tool for hierarchy.

### The Tonal Scale
- **Surface (Background):** `#F9F9F9` – The gallery floor.
- **Primary:** `#000000` – Used for maximum contrast (text, primary CTAs).
- **Surface Container (Lowest to Highest):** `#FFFFFF` to `#E2E2E2`. Use these to create "nested" technical zones.

### The "No-Line" Rule for Sectioning
Prohibit 1px solid borders for primary sectioning. Major content blocks must be defined by shifts in background color (e.g., a `surface-container-low` section sitting on a `surface` background). This creates a "monolithic" feel where the UI feels carved from a single block of material.

### Signature Textures & Glassmorphism
To add "soul" to the utilitarian base, use **Glassmorphism** for floating technical panels or navigation bars. Use semi-transparent versions of `surface-container-lowest` with a `backdrop-blur` of 20px. This mimics the appearance of architectural vellum or frosted glass overlays used in drafting.

---

## 3. Typography: Information Architecture
Typography is the primary visual driver. We utilize **Inter** as a neo-grotesque industrial engine.

- **Display & Headlines:** Large-scale (`display-lg` at 3.5rem). Use **Tight Tracking** (-2% to -4%) to create a dense, authoritative block of text.
- **Technical Labels:** Small-scale (`label-sm` at 0.6875rem). Use **Wide Tracking** (+5% to +10%) and uppercase for "meta-data" or technical specs. This creates a contrast between "Art" (Headlines) and "Instruction" (Labels).
- **Body:** `body-md` (0.875rem) for high legibility. Maintain a generous line-height (1.5) to ensure the technical content remains breathable.

---

## 4. Elevation & Structural Logic
In this system, depth is not achieved through light and shadow, but through **Tonal Layering**.

### The Layering Principle
Stacking `surface-container` tiers mimics physical material thickness:
1. **Level 0 (Base):** `surface` (#F9F9F9).
2. **Level 1 (Section):** `surface-container-low` (#F4F3F3).
3. **Level 2 (Inlay/Card):** `surface-container-lowest` (#FFFFFF).

### Ambient Shadows
Avoid traditional "Drop Shadows." When an element must float (e.g., a modal), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(0,0,0,0.04)`. It should feel like an object casting a soft shadow on a lightbox.

### The "Ghost Border"
The user request calls for 1px borders. These are strictly "Ghost Borders." Use the `outline-variant` (#C6C6C6) at **20% opacity**. These lines should look like faint architectural drafting guides, not structural boundaries.

---

## 5. Components: The Industrial Primitive
All components follow a **0px Border Radius** (absolute sharp corners).

### Buttons
- **Primary:** Solid `#000000` background, `#FFFFFF` text. High-contrast, utilitarian.
- **Secondary:** `surface-container-highest` background. Subtle, tonal.
- **Tertiary:** Text-only with a 1px "Ghost Border" bottom underline.
- **States:** On hover, primary buttons should shift to a dark grey (`primary-container`), never a color.

### Input Fields
- **Architecture:** Do not use four-sided boxes. Use a single 1px baseline (using `outline`) with the label floating in `label-sm` style above it.
- **Focus State:** The baseline transitions from `outline` to `primary` (#000000) with a 2px weight.

### Cards & Lists
- **Prohibition:** No divider lines between list items. Use vertical white space (Scale `6` or `8`) to separate thoughts.
- **Images:** Architectural photography must be high-contrast. Frame images in a 1px Ghost Border to treat them as "technical exhibits."

### Additional Component: The "Spec Tag"
A custom chip used for technical data (e.g., "LVL 40mm", "CNC-04"). 
- **Style:** Small, `#000000` text on a `surface-container-high` background. No rounded corners. Monospaced-look labels.

---

## 6. The Exhibition Rules (Do's & Don'ts)

### Do:
- **Embrace Asymmetry:** Align a small technical label to the far right while the headline sits far left. Use the rigid grid to find unconventional balances.
- **Use Excessive Negative Space:** If a section feels "done," add 20% more padding. Space is a luxury material in this system.
- **Align to the Grid:** Every element must snap to a mathematical increment of the Spacing Scale.

### Don't:
- **Don't use Rounded Corners:** 0px is the law. Any radius breaks the industrial "Vlakwerk" precision.
- **Don't use Icons for Decoration:** Use icons only if they are functional (e.g., an arrow for a link). Never use icons to "beautify" a layout.
- **Don't use Gradients for Color:** Only use subtle tonal gradients (e.g., `#F2F2F2` to `#E5E5E5`) to imply material depth, never for visual flair.