# CBSH Digital Library - Theme & Aesthetic Design Prompt

**Core Identity:** A premium, "refined academic luxury" dark theme. It combines institutional prestige with modern web design, utilizing a dark background with warm, gold/amber accents, frosted glass elements, and subtle background glow effects.

## 1. Typography System

- **Headings (Headers, Titles):** `Cormorant Garamond` (serif) - Gives the academic, institutional feel.
- **Body Content (Text, Buttons, Inputs):** `DM Sans` (sans-serif) - Ensures modern, clean readability.
- **Monospace (Code/Data):** `JetBrains Mono`

## 2. Color Palette & Coordination

_The application relies heavily on custom CSS variables to maintain a consistent, warm dark mode._

**Backgrounds (Dark & Warm):**

- **App Background:** `#0d1117` (Deepest dark grey/blue)
- **Sidebar Background:** `#0f1218` (Slightly elevated dark)
- **Card Background:** `#1a1410` (Warm, dark brown-tinted grey)
- **Input Background:** `#1f1810` (Lighter warm dark for depth)

**Accents (The "Academic Gold"):**

- **Primary Accent:** `#d4922a` (Amber/Gold) - Used for primary buttons, active states, and glowing shadows.
- **Hover Accent:** `#e8a835`
- **Pressed Accent:** `#b87d22`

**Text Colors (Warm Off-Whites):**

- **Primary Text:** `#f7f0e6` (Soft off-white for main readability)
- **Secondary Text:** `#c4a882` (Muted tan/gold for subtitles, metadata, and inactive states)
- **Heading Text:** `#ede0c4` (Brighter warm white for titles)

**Borders & Dividers:**

- **Card Borders:** `#332208`
- **Input Borders:** `#4a3318`

**Semantic/Role Highlights:**

- **Teacher/Admin roles & Quizzes:** Uses hints of Blue (`text-blue-400`, `bg-blue-500/10`)
- **Student roles & Success states:** Uses hints of Emerald (`text-emerald-400`, `bg-emerald-500/10`)
- **Alerts/Logout:** Uses hints of Red (`text-red-400`, `bg-red-400/10`)

## 3. Layout Structure

**Overall Layout:**

- **Sidebar (Left):** Fixed width (`w-64`), full viewport height, separated by a thin `border-r`. Contains the logo, application name, role indicator, and vertical navigation menu. The active navigation item is highlighted with `bg-accent-amber/10` and a thick left border (`border-l-4 border-accent-amber`).
- **Topbar (Header):** Fixed/Sticky at the top (`h-16`), sits to the right of the sidebar. Uses a frosted glass effect (`bg-bg-app/80 backdrop-blur-md`) with a bottom border. Contains the page title on the left and user profile/notifications on the right.
- **Main Content Area:** Sits below the Topbar with a max-width container (`max-w-7xl mx-auto`). Uses responsive CSS grids (`grid-cols-1 md:grid-cols-3` or `lg:grid-cols-4`) to organize stat cards and material cards.

**Background Effects:**

- The root layout features decorative, large blurred gradient orbs fixed in the background (e.g., a top-right amber orb `"bg-accent-amber/5 blur-[120px]"` and a bottom-left blue orb) to give the dark background dimension and an ambient glow.

## 4. Component Rules (Reusable UI)

- **Cards (`.cbsh-card`):** All surface containers use the card background with a subtle border (`border-border-card`), rounded corners (`rounded-2xl`), and internal padding (`p-6`).
  - _Hover State:_ Cards smoothly lift (`-translate-y-1`) and project a subtle amber shadow (`shadow-[0_0_20px_rgba(212,146,42,0.1)]`).
- **Primary Buttons (`.cbsh-btn-primary`):** Filled with the `accent-amber` color, dark text (`text-bg-app`), slightly rounded (`rounded-xl`), and lift on hover.
- **Inputs (`.cbsh-input`):** Darker background (`bg-bg-input`), soft borders. On focus, they glow with an amber ring (`focus:ring-2 focus:ring-accent-amber/20 focus:border-accent-amber`).
- **Badges/Tags:** Use extremely small (`text-[10px]`), bold, uppercase text with a highly transparent background and thin border of the respective color (e.g., `bg-accent-amber/10 text-accent-amber border-accent-amber/20 rounded-full`).
