# Project 52 — 02: Bubble

**Project 52** is a personal series of 52 creative coding projects, one per week, each exploring a distinct concept through GLSL, generative art, and interactive media.

---

## 02 — Bubble

This project dives into **noise and blob techniques** to recreate the organic, inflated aesthetic of a bubble — part scientific curiosity, part Y2K nostalgia. The goal is to push GLSL's procedural capabilities to produce something that feels alive: glossy, wobbly, and irresistibly tactile.

### Concept

Bubbles are deceptively complex — they refract light, shift color with iridescence, and deform fluidly under motion. This shader mimics those properties by layering domain-warped noise over a smooth metaball-style blob form, with a Fresnel-like rim that catches light just like a soap film would.

The Y2K dimension leans into the era's love of hyper-glossy, inflated 3D shapes — think candy-colored UI, aqua buttons, and shiny orbs. The piece sits somewhere between a lava lamp and a Windows XP screensaver.

### Techniques

- **FBM / Domain-warped noise** — multiple octaves of smooth noise warp the bubble's surface, giving it organic wobble and depth
- **Blob / Metaball shape** — a smooth implicit surface forms the base silhouette, which breathes and pulses over time
- **Fresnel rim lighting** — edge glow simulates the light-catching rim of a soap bubble
- **Iridescent color shift** — hue rotates across the surface based on the normal angle, echoing the thin-film interference of real bubbles
- **Time-driven animation** — the blob continuously deforms, never settling into a static form

### Interaction

Hovering or clicking disturbs the bubble's surface — the noise field reacts to the cursor position, creating ripples or local deformations that fade back into the resting wobble. The bubble feels like it *knows* you're there.

### Aesthetic Reference

- Y2K glossy UI and inflated 3D iconography
- Soap bubbles and oil slicks
- Lava lamps and liquid motion screensavers
- Early 2000s candy-colored web design

### Stack

- GLSL fragment shader
- [GlslCanvas](https://github.com/patriciogonzalezvivo/glslCanvas) for WebGL rendering
- Vanilla JS for mouse tracking and uniform injection
