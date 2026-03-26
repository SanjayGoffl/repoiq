# Design System Specification: The Monolithic Intelligence

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Architect."** 

This is not a generic SaaS interface; it is a high-precision instrument for elite developers. We move beyond the "template" look by embracing a high-contrast, editorial layout that favors structural depth over decorative lines. The aesthetic is defined by **intentional asymmetry** and **tonal layering**, where the UI feels like a single, carved obsidian block rather than a collection of floating boxes. By leveraging wide-set display typography against dense, technical data, we create an environment that feels both authoritative and hyper-efficient.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep obsidian and charcoal, using vibrant accents not just for decoration, but as functional "signals" within the codebase.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. We define boundaries through **Background Shifts**. To separate a sidebar from a main workspace, transition from `surface` (#131313) to `surface_container_low` (#1C1B1B). This creates a sophisticated, "etched" look that is easier on the eyes during long coding sessions.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. Use the following tiers to denote "lift" and importance:
- **Level 0 (Base):** `surface_container_lowest` (#0E0E0E) – Used for the furthest background or "trench" layouts.
- **Level 1 (App Frame):** `surface` (#131313) – The primary canvas.
- **Level 2 (Panels):** `surface_container` (#201F1F) – Sidebars and navigation.
- **Level 3 (Interactive Elements):** `surface_container_high` (#2A2A2A) – Active cards or hovered states.
- **Level 4 (Modals/Popovers):** `surface_container_highest` (#353534) – Command palettes and tooltips.

### The "Glass & Gradient" Rule
To inject "soul" into the machine, use **Glassmorphism** for all floating overlays (Command Palettes, Context Menus). Apply `surface_container_highest` at 70% opacity with a `24px` backdrop blur. 

**Signature Texture:** Main CTAs should utilize a subtle linear gradient from `primary` (#ADC6FF) to `primary_container` (#4D8EFF) at a 135-degree angle. This provides a metallic, premium sheen that flat colors cannot replicate.

---

## 3. Typography: Editorial Precision
We pair the utilitarian 'Inter' with the technical 'JetBrains Mono' to create a "Technical Editorial" vibe.

*   **Display & Headlines:** Use `display-lg` and `headline-lg` with tight letter-spacing (-0.02em). These should feel like headers in a premium architectural magazine—bold, stark, and authoritative.
*   **Body & UI:** `body-md` (0.875rem) is our workhorse. Use `on_surface_variant` (#C2C6D6) for secondary text to maintain a high-end, low-fatigue contrast ratio.
*   **Monospace Utility:** All code fragments, hashes, and terminal outputs must use 'JetBrains Mono'. This differentiates "system data" from "user interface" instantly.

---

## 4. Elevation & Depth
We eschew traditional drop shadows in favor of **Tonal Layering** and **Ambient Light**.

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface_container_low` card sitting on a `surface` background creates a natural, soft lift.
*   **Ambient Shadows:** For floating elements (CMD+K Palette), use a highly diffused shadow: `0px 20px 40px rgba(0, 0, 0, 0.4)`. The shadow must never be gray; it should be a deep black-tinted version of the background to mimic natural light absorption.
*   **The "Ghost Border" Fallback:** If a container lacks sufficient contrast against its neighbor, use a **Ghost Border**: `1px solid` using the `outline_variant` (#424754) at **15% opacity**. It should be felt, not seen.

---

## 5. Components & Patterns

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`). Border-radius: `md` (0.375rem). Text: `label-md` bold.
*   **Secondary:** Ghost style. No background, `Ghost Border` (15% opacity `outline_variant`). On hover, shift background to `surface_container_high`.
*   **Tertiary:** Text-only using `primary` color. Reserved for low-priority actions in dense data views.

### Input Fields & Command Palette
*   **Inputs:** Use `surface_container_lowest` for the field background to create an "inset" feel. No borders. Active state: A 1px glow using `surface_tint`.
*   **Command Palette:** The centerpiece. Use the **Glassmorphism Rule**. Width: `24` scale (5.5rem equivalents). Use `JetBrains Mono` for shortcut hints (e.g., "CMD+K") in `label-sm`.

### Data-Rich Cards & Lists
*   **No Dividers:** Prohibit 1px lines between list items. Use a `1.5` (0.3rem) spacing gap or a `surface_container` background on hover to indicate separation.
*   **Sparklines:** Render in `primary` (Electric Blue) with a subtle `secondary` (Cyber Purple) glow effect to highlight trends without cluttering the UI.

### Key AI Component: The "Insight Pane"
A multi-pane workspace component using `surface_container_low`. It uses vertical typography for labels to maximize code horizontal space, creating a signature "IDE-plus" layout.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Place a large `display-sm` title against a dense `label-sm` data grid to create visual interest.
*   **Respect the Grid:** Use the `spacing` scale religiously (e.g., `4` for outer margins, `2` for internal grouping).
*   **Prioritize Type:** Use font weight and color (`on_surface` vs `on_surface_variant`) to show hierarchy before reaching for a new box or line.

### Don’t:
*   **Don't use 100% Opaque Borders:** This shatters the "Monolithic" feel and makes the UI look like a legacy enterprise app.
*   **Don't use Standard Shadows:** Avoid small, dark, "fuzzy" shadows. If it doesn't look like ambient light, don't use it.
*   **Don't Over-Color:** Keep the UI 90% monochrome. Use `primary` and `secondary` only for interactive triggers and critical data states.