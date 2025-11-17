# 🎨 Cybernetic Mad Scientist Animation Styles

This document showcases the new animation styles and cybernetic themes for repo cards!

## 🤖 Cybernetic Themes

Five new themes inspired by a cybernetic mad scientist laboratory aesthetic:

### 1. **mad_scientist** - Electric Blue Laboratory
Bright cyan and blue tones with a dark space background.
```
theme=mad_scientist
```
- Title: `#00d9ff` (bright cyan)
- Text: `#7dd3fc` (sky blue)
- Icons: `#38bdf8` (blue)
- Border: `#0ea5e9` (deep blue)
- Background: `#0c1021` (dark navy)

### 2. **mad_scientist_dark** - Deep Laboratory
Darker, more intense cyan with near-black background.
```
theme=mad_scientist_dark
```
- Title: `#22d3ee` (cyan)
- Text: `#67e8f9` (light cyan)
- Icons: `#06b6d4` (darker cyan)
- Border: `#0891b2` (teal)
- Background: `#020617` (almost black)

### 3. **cybernetic_lab** - Classic Blue Tech
Traditional tech blue with laboratory feel.
```
theme=cybernetic_lab
```
- Title: `#3b82f6` (blue)
- Text: `#60a5fa` (light blue)
- Icons: `#2563eb` (royal blue)
- Border: `#1d4ed8` (deep blue)
- Background: `#0a0e1a` (dark blue-black)

### 4. **robot_blue** - Robot Head Inspired
Inspired by the blue robot avatar aesthetic.
```
theme=robot_blue
```
- Title: `#0ea5e9` (sky blue)
- Text: `#7dd3fc` (light sky)
- Icons: `#38bdf8` (bright blue)
- Border: `#0284c7` (ocean blue)
- Background: `#082f49` (dark teal)

### 5. **electric_laboratory** - Electric Cyan
High-contrast electric cyan with modern lab feel.
```
theme=electric_laboratory
```
- Title: `#00ffff` (pure cyan)
- Text: `#5eead4` (teal)
- Icons: `#2dd4bf` (turquoise)
- Border: `#14b8a6` (dark teal)
- Background: `#0f172a` (slate black)

---

## ⚡ Animation Styles

Five unique animation effects for your repo cards:

### 1. **bubbles** - Fishtank Effect 🐠
A complete aquarium experience with bubbles, glowing jellyfish, and drifting starfish.
```
animation_style=bubbles
```
- 8 bubbles floating upward with varying sizes and speeds
- 2 glowing jellyfish with wavy tentacles drifting left to right
- 2 starfish slowly rotating and drifting right to left
- Jellyfish appear every ~12 seconds with gentle pulsing glow
- Starfish drift across every ~15 seconds with slow rotation
- All creatures layered behind text for depth
- Perfect for: Calm, steady progress projects, marine/ocean themes

### 2. **embers** - Burning Particles 🔥
Glowing particles pulse and float like hot embers.
```
animation_style=embers
```
- 12 glowing particles
- Pulsing glow effect with blur
- Gentle floating motion
- 2-4 second animation cycles
- Perfect for: Active, hot projects

### 3. **radiant** - Pulsing Sun ☀️
Radiant rays emanate from the center with a pulsing core.
```
animation_style=radiant
```
- 16 rays radiating from center
- Pulsing central core
- Sequential wave animation
- 2 second pulse cycle
- Perfect for: Central, important projects

### 4. **circuit** - Edge Traveler 🔌
Dots travel around the card edges like signals in a circuit.
```
animation_style=circuit
```
- 6 glowing dots traveling the perimeter
- Glowing edge trail effects
- Continuous loop motion
- 4 second travel cycle
- Perfect for: Tech, systematic projects

### 5. **sparks** - Electric Sparks ⚡
Electric sparks flash randomly across the card.
```
animation_style=sparks
```
- 10 electric spark bursts
- Random positions
- Flash and fade effect
- 5 second cycle with stagger
- Perfect for: Energetic, innovative projects

---

## 🎯 Usage Examples

### Basic Animation
```markdown
![Repo Card](https://your-domain.vercel.app/api/pin?username=hesreallyhim&repo=your-repo&animation_style=bubbles)
```

### With Cybernetic Theme
```markdown
![Repo Card](https://your-domain.vercel.app/api/pin?username=hesreallyhim&repo=your-repo&theme=mad_scientist&animation_style=circuit)
```

### Full Customization
```markdown
![Repo Card](https://your-domain.vercel.app/api/pin?username=hesreallyhim&repo=your-repo&theme=robot_blue&animation_style=sparks&show_owner=true&all_stats=true)
```

### Disable Animations (for static images)
```markdown
![Repo Card](https://your-domain.vercel.app/api/pin?username=hesreallyhim&repo=your-repo&theme=electric_laboratory&disable_animations=true)
```

---

## 🎨 Recommended Combinations

Here are some great theme + animation pairings:

### The Scientist's Lab
```
theme=mad_scientist&animation_style=bubbles
```
Blue laboratory with gentle bubbles rising - perfect for research projects.

### The Robot Workshop
```
theme=robot_blue&animation_style=circuit
```
Robot-inspired blues with circuit paths - ideal for robotics/automation.

### Electric Experiment
```
theme=electric_laboratory&animation_style=sparks
```
High-voltage cyan with electric sparks - great for exciting new projects.

### Burning Innovation
```
theme=cybernetic_lab&animation_style=embers
```
Tech blue with glowing embers - perfect for hot, active development.

### Radiant Core
```
theme=mad_scientist_dark&animation_style=radiant
```
Dark background with pulsing radiant center - excellent for core libraries.

---

## 📝 Parameters Reference

### Animation Parameters
- `animation_style` - Animation effect to use
  - Options: `none`, `bubbles`, `embers`, `radiant`, `circuit`, `sparks`
  - Default: `none`

- `disable_animations` - Disable all animations
  - Options: `true`, `false`
  - Default: `false`

### All Compatible Parameters
You can combine animations with all existing repo card parameters:
- `theme` - Choose from 65+ themes (including 5 new cybernetic ones)
- `title_color`, `icon_color`, `text_color`, `bg_color`, `border_color` - Custom colors
- `hide_border`, `hide_title`, `hide_text` - Hide elements
- `show_owner` - Show full username/repo
- `show_issues`, `show_prs`, `show_age` - Show extra stats
- `all_stats` - Show all available stats
- `border_radius` - Customize corner rounding
- `locale` - Set language

---

## 🎬 Animation Performance

All animations are:
- ✅ Pure CSS/SVG (no JavaScript required)
- ✅ Lightweight (minimal impact on file size)
- ✅ Smooth (GPU-accelerated where possible)
- ✅ Accessible (can be disabled with `disable_animations=true`)
- ✅ Compatible with all modern browsers

---

## 🚀 Quick Start

1. Choose a theme from the cybernetic collection
2. Pick an animation style that matches your project vibe
3. Add to your README:

```markdown
[![Repo Card](https://your-domain.vercel.app/api/pin?username=hesreallyhim&repo=your-repo&theme=mad_scientist&animation_style=circuit)](https://github.com/hesreallyhim/your-repo)
```

---

## 💡 Tips

1. **For READMEs viewed on GitHub**: All animations work perfectly in SVG!
2. **For static documentation**: Use `disable_animations=true`
3. **Performance**: Animations use minimal resources and won't slow page load
4. **Accessibility**: Users with `prefers-reduced-motion` should disable animations
5. **Caching**: Animation style is included in cache key, so changes update immediately

---

## 🎨 Color Customization

You can override theme colors while keeping animations:

```markdown
![Repo Card](https://your-domain.vercel.app/api/pin?username=hesreallyhim&repo=your-repo&animation_style=bubbles&title_color=ff00ff&icon_color=00ffff&bg_color=000000)
```

Animations will automatically use your custom colors!

---

## 🧪 Experiment!

Don't be afraid to mix and match! Try different combinations to find the perfect look for your project. The cybernetic mad scientist aesthetic is all about creative experimentation! 🔬⚡🤖
