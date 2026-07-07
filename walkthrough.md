# Verdikt AI — Build Walkthrough

A complete record of how the Verdikt AI frontend was designed, built, and verified.

---

## Project Summary

**Verdikt AI** is an autonomous approval and task-routing agent built for the TakeOver'26 hackathon (Theme 2: AI Automation & Intelligent Agents) by **Tech Resolutions (FTS.19)**.

Employees submit requests through a web form → an AI agent (Google Gemini via n8n) evaluates the request → makes an autonomous decision (AUTO_APPROVE, NEEDS_REVIEW, or REJECT) with reasoning → logs it to Google Sheets → notifies the relevant manager by email — all in seconds.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (This Repo)                     │
│  index.html + style.css + script.js                             │
│  Deployed on Vercel                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /webhook (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     n8n WORKFLOW (Backend)                       │
│  Hosted on workflow.ccbp.in                                     │
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌───────────┐   ┌────────────┐ │
│  │ Webhook  │──▸│ AI Agent │──▸│ Set Fields│──▸│   Google   │ │
│  │ (receive)│   │ (Gemini) │   │ (parse)   │   │   Sheets   │ │
│  └──────────┘   └──────────┘   └───────────┘   │  (log row) │ │
│                                                  └─────┬──────┘ │
│                                                        │        │
│                                                  ┌─────▼──────┐ │
│                                                  │   Switch    │ │
│                                                  │  (route by  │ │
│                                                  │  decision)  │ │
│                                              ┌───┴───┬────┴──┐ │
│                                              ▼       ▼       ▼  │
│                                           Gmail   Gmail   Gmail │
│                                          approve  review  reject│
│                                              └───┬───┴────┬──┘ │
│                                                  ▼              │
│                                           Respond to            │
│                                            Webhook              │
│                                          (JSON back)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend — What Was Built

### Files Created

| File | Purpose | Description |
|---|---|---|
| `index.html` | Page structure | Single-page app with 5 sections, SEO meta tags, semantic HTML, accessible form |
| `style.css` | Design system | Dark theme, glassmorphism, CSS custom properties, animations, full responsive layout |
| `script.js` | Interactions | Particle canvas, scroll animations, form submission, result display, expandable cards |

**Zero external dependencies** — no frameworks, no build step, no npm. Just 3 clean files that deploy as a static site.

---

### Section-by-Section Breakdown

#### 1. Hero / Landing

- Large **"Verdikt AI"** heading with a purple-to-teal gradient text effect
- Badge: "AI-Powered Approval Automation" with a pulsing dot
- Tagline: *"Approvals, Decided Instantly. Reasoned Autonomously."*
- One-paragraph description of the project
- **"Try It Now"** CTA button → smooth scrolls to the form
- Animated particle network background (canvas-based, mouse-interactive)
- Bouncing scroll indicator at the bottom
- Staggered fade-in entrance animation on page load

#### 2. How It Works

- 4 glassmorphism step cards in a horizontal grid:
  1. 📝 **Submit Request** — Employee fills out a simple form
  2. 🧠 **AI Evaluates** — Google Gemini analyzes the request
  3. ⚡ **Decision Generated** — Clear verdict with transparent reasoning
  4. 📧 **Manager Notified** — Email sent automatically with full details
- Gradient connecting line between steps (desktop)
- Each card has a number badge, icon, title, and description
- Sequential scroll-triggered fade-up animations
- Vertical stack with no connecting line on mobile

#### 3. Request Form (Core Functionality)

- Glassmorphism form card with an **animated gradient border** (purple ↔ teal)
- Two-column grid layout (single column on mobile):
  - **Employee Name** — text input (required, min 2 chars)
  - **Request Type** — styled dropdown: Leave / Expense / Complaint (required)
  - **Description** — textarea (required, min 10 chars)
  - **Additional Context** — textarea (optional, with hint text)
- Focus glow effect on all inputs (purple box-shadow)
- Submit button with:
  - Shimmer hover effect (light sweep across button)
  - Loading state: "Processing" text + animated bouncing dots
  - Disabled state during request
- **Result Card** (appears below form after response):
  - Color-coded by decision type:
    - ✅ **AUTO_APPROVE** → green card with checkmark
    - ⏳ **NEEDS_REVIEW** → amber/yellow card with hourglass
    - ❌ **REJECT** → red card with X
  - Shows: AI Decision label, Reason text, Manager notification confirmation
  - Smooth slide-in animation
- **Error Card**: red-themed with "Try Again" button, handles:
  - Empty field validation
  - Network/fetch failures
  - Request timeouts (30s)
  - Unconfigured webhook URL (graceful message)

#### 4. Roadmap / Future Scope

- Title: *"What's Next for Verdikt AI"*
- 5 expandable glassmorphism cards in a responsive grid:
  1. **📊 Manager Dashboard** — View all requests and decisions in one interface
  2. **🧠 Persistent Agent Memory** — Context-aware decisions across requests
  3. **🌐 Multi-language Support** — Regional language evaluation
  4. **⚙️ Custom Escalation Rules** — Organization-defined approval thresholds
  5. **📈 Analytics Dashboard** — Trend insights and pattern analysis
- Each card shows a preview (1-2 lines) by default
- Click to expand → reveals 2-3 more lines of detail with smooth CSS grid animation
- Only one card open at a time (accordion behavior)
- Hover: scale-up + purple glow + shadow lift

#### 5. Footer

- **VerdiktAI** branding with gradient text
- Tag badges: Tech Resolutions, FTS.19, TakeOver'26, Theme 2 — AI Automation
- Closing line: *"Built with 🤖 and ☕ at TakeOver'26"*

---

## Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg-deep` | `#050810` | Page background |
| `--bg-primary` | `#0a0e1a` | Section backgrounds |
| `--bg-elevated` | `#111827` | Elevated surfaces |
| `--accent` | `#7c3aed` | Primary accent (electric violet) |
| `--accent-secondary` | `#06b6d4` | Secondary accent (teal/cyan) |
| `--text-primary` | `#f1f5f9` | Headings, important text |
| `--text-secondary` | `#94a3b8` | Body text, descriptions |
| `--text-muted` | `#64748b` | Hints, captions |
| `--success` | `#10b981` | AUTO_APPROVE decisions |
| `--warning` | `#f59e0b` | NEEDS_REVIEW decisions |
| `--danger` | `#ef4444` | REJECT decisions, errors |

### Typography

- **Font**: Inter (Google Fonts), weights 300–900
- **Hero title**: `clamp(3rem, 9vw, 5.5rem)`, weight 900, gradient text
- **Section titles**: `clamp(1.75rem, 4vw, 2.75rem)`, weight 700
- **Body**: 16px base, line-height 1.7

### Effects

| Effect | Implementation |
|---|---|
| **Glassmorphism** | `rgba(255,255,255,0.035)` bg + `backdrop-filter: blur(8-16px)` + thin border |
| **Hover glow** | `box-shadow: 0 0 30px rgba(124,58,237,0.12)` + `scale(1.02)` |
| **Focus glow** | `box-shadow: 0 0 0 3px rgba(124,58,237,0.15)` + accent border |
| **Gradient text** | `linear-gradient(135deg, #7c3aed, #a78bfa, #06b6d4)` + `background-clip: text` |
| **Animated border** | Pseudo-element with `mask-composite: exclude` + shifting gradient |
| **Particle network** | Canvas with 60-90 particles, connection lines, mouse proximity glow |

### Animations

| Animation | Trigger | Duration |
|---|---|---|
| Fade-up (sections) | Intersection Observer | 700ms ease-out-expo |
| Stagger delays | Sequential child elements | +100ms per step |
| Hero gradient mesh | Continuous | 12s infinite alternate |
| Scroll dot bounce | Continuous | 2s infinite |
| Badge pulse dot | Continuous | 2s infinite |
| Loading dots | During form submit | 1.4s infinite |
| Card expand | Click | 400ms ease-out-expo |
| Button shimmer | Hover | 600ms ease |

### Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| ≤ 1024px (tablet) | Steps grid → 2 columns, reduced section padding |
| ≤ 768px (mobile) | Hamburger nav, single column grids, smaller hero, scroll indicator hidden |
| ≤ 480px (small mobile) | Smaller title, tighter padding, stacked footer tags |

---

## Technical Decisions

### Why plain HTML/CSS/JS (no React)?

- **Zero build step** — no webpack, no bundler, no node_modules
- **Instant Vercel deployment** — push to GitHub, Vercel auto-deploys static files
- **Full control** — every animation and pixel is custom, no framework overhead
- **Hackathon appropriate** — the app is a single page with one form; React would be over-engineering
- **Debugging** — open `index.html` directly in any browser, no dev server needed

### Why canvas particles instead of a CSS-only background?

- Canvas particles are **mouse-interactive** — they glow brighter near your cursor
- They create a **living, breathing** feel that pure CSS gradients can't match
- Performance is optimized: particle count scales with viewport area, connections are distance-limited
- Combined with CSS gradient mesh for a layered depth effect

### Form error handling strategy

The form handles errors at multiple levels:
1. **Client-side validation** — checks required fields and minimum lengths before sending
2. **Unconfigured webhook** — detects the placeholder URL and shows a friendly message
3. **Network errors** — catches fetch failures with a user-friendly message
4. **Timeouts** — AbortController with 30s timeout
5. **Server errors** — catches non-200 responses
6. **Graceful recovery** — "Try Again" button resets the error state and focuses the form

---

## Verification Results

The following was verified in a browser test:

- ✅ Hero section renders with gradient title, particles, and CTA
- ✅ Navigation sticky behavior and scroll spy highlighting work
- ✅ How It Works cards animate in on scroll with stagger effect
- ✅ Request Form has all fields with proper styling and focus glow
- ✅ Form validation catches empty fields and shows error card
- ✅ Roadmap cards expand/collapse with smooth animation
- ✅ Footer displays all team and hackathon tags
- ✅ Smooth scroll works from nav links and CTA button
- ✅ Mobile hamburger menu opens/closes correctly

---

## Remaining Steps

1. **Get webhook URL** — The n8n Production Webhook URL needs to be set in `script.js` (line 5, `CONFIG.WEBHOOK_URL`)
2. **Deploy to Vercel** — Push repo to GitHub, connect to Vercel, deploy as static site
3. **Update README.md** — Mark frontend and deployment as complete, add live URL

---

*Document created during the TakeOver'26 hackathon build sprint.*
