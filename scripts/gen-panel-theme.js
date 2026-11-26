// Generates app/panel-theme.css — run: node scripts/gen-panel-theme.js app/panel-theme.css
const fs = require('fs')
const out = process.argv[2]

// Literal Tailwind palette values (v4 only emits CSS vars for colours the app uses)
const THEME = fs.readFileSync('node_modules/tailwindcss/theme.css', 'utf8')
const color = (name) => {
  const m = THEME.match(new RegExp(`--color-${name}:\\s*([^;]+);`))
  if (!m) throw new Error('missing colour ' + name)
  return m[1].trim()
}

// Applies anywhere on a page that renders the dashboard (incl. portaled dialogs/menus)
const D = '.dark:has(.panel-theme)'
const L = ':root:not(.dark):has(.panel-theme)'
const esc = (c) => c.replace(/([:/\[\]#.])/g, '\\$1')
const NOT_SIDEBAR = ':not([data-sidebar] *)'

// selector for a utility class, skipping elements that already define their own dark: variant
const sel = (scope, cls, guard, pseudo = '') =>
  `${scope} .${esc(cls)}${guard ? `:not([class*="${guard}"])` : ''}${NOT_SIDEBAR}${pseudo}`

const rules = []
const rule = (selectors, body) => rules.push(`${selectors.join(',\n')} {\n  ${body}\n}`)

const GRAYS = ['gray', 'slate', 'zinc', 'neutral', 'stone']
const COLORS = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']

/* ───────── DARK: neutral surfaces ───────── */
const surface = ['bg-white', 'bg-[#f9f7f7]', 'bg-[#f7f8fc]', 'bg-[#f8fafc]', 'bg-[#fafafa]']
rule(surface.map((c) => sel(D, c, 'dark:bg-')), 'background-color: var(--pd-surface);')
rule(['bg-white/60', 'bg-white/70', 'bg-white/80', 'bg-white/90'].map((c) => sel(D, c, 'dark:bg-')),
  'background-color: color-mix(in oklab, var(--pd-surface) 85%, transparent);')

const subtle = GRAYS.flatMap((g) => [`bg-${g}-50`, `bg-${g}-100`, `bg-${g}-50/50`, `bg-${g}-50/60`, `bg-${g}-50/70`])
rule(subtle.map((c) => sel(D, c, 'dark:bg-')), 'background-color: var(--pd-surface-2);')
rule(GRAYS.flatMap((g) => [`bg-${g}-200`, `bg-${g}-300`]).map((c) => sel(D, c, 'dark:bg-')),
  'background-color: var(--pd-surface-3);')

const hoverSubtle = GRAYS.flatMap((g) => [`hover:bg-${g}-50`, `hover:bg-${g}-100`, `hover:bg-${g}-50/60`, `hover:bg-${g}-50/70`])
rule(hoverSubtle.map((c) => sel(D, c, 'dark:hover:bg-', ':hover')), 'background-color: var(--pd-surface-3);')
rule(GRAYS.flatMap((g) => [`hover:bg-${g}-200`, `hover:bg-${g}-300`]).map((c) => sel(D, c, 'dark:hover:bg-', ':hover')),
  'background-color: var(--pd-surface-4);')

/* ───────── DARK: neutral text ───────── */
const strong = ['text-black', ...GRAYS.flatMap((g) => [`text-${g}-950`, `text-${g}-900`, `text-${g}-800`]), 'text-[#0b1b3f]', 'text-[#0b2a4a]', 'text-[#030712]']
rule(strong.map((c) => sel(D, c, 'dark:text-')), 'color: var(--pd-text-strong);')
rule(GRAYS.map((g) => sel(D, `text-${g}-700`, 'dark:text-')), 'color: var(--pd-text);')
rule(GRAYS.flatMap((g) => [`text-${g}-600`, `text-${g}-500`]).map((c) => sel(D, c, 'dark:text-')), 'color: var(--pd-text-muted);')
rule(GRAYS.flatMap((g) => [`hover:text-${g}-900`, `hover:text-${g}-800`, `hover:text-${g}-700`]).map((c) => sel(D, c, 'dark:hover:text-', ':hover')),
  'color: var(--pd-text-strong);')

/* ───────── DARK: neutral borders / dividers / rings / gradients ───────── */
const borders = ['border-white', ...GRAYS.flatMap((g) => [`border-${g}-50`, `border-${g}-100`, `border-${g}-200`, `border-${g}-200/70`, `border-${g}-300`])]
rule(borders.map((c) => sel(D, c, 'dark:border-')), 'border-color: var(--pd-border);')
rule(GRAYS.flatMap((g) => [`divide-${g}-100`, `divide-${g}-200`]).map((c) => `${sel(D, c, 'dark:divide-')} > :not(:last-child)`),
  'border-color: var(--pd-border);')
rule(GRAYS.flatMap((g) => [`ring-${g}-100`, `ring-${g}-200`, `ring-${g}-300`]).map((c) => sel(D, c, 'dark:ring-')),
  '--tw-ring-color: var(--pd-border);')
rule(GRAYS.flatMap((g) => [`from-${g}-50`, `from-${g}-100`]).map((c) => sel(D, c, 'dark:from-')), '--tw-gradient-from: var(--pd-surface-2);')
rule(GRAYS.flatMap((g) => [`to-${g}-50`, `to-${g}-100`, `to-${g}-200`]).map((c) => sel(D, c, 'dark:to-')), '--tw-gradient-to: var(--pd-surface-3);')

/* ───────── DARK: pastel colour chips / badges / alerts ───────── */
for (const c of COLORS) {
  const tint = (pct) => `color-mix(in oklab, ${color(`${c}-500`)} ${pct}%, transparent)`
  const bg50 = [`bg-${c}-50`, `bg-${c}-50/50`, `bg-${c}-50/60`, `bg-${c}-50/70`]
  if (c === 'orange') bg50.push('bg-[#fff0ea]')
  rule(bg50.map((x) => sel(D, x, 'dark:bg-')), `background-color: ${tint(12)};`)
  rule([sel(D, `bg-${c}-100`, 'dark:bg-')], `background-color: ${tint(18)};`)
  const bg200 = [`bg-${c}-200`]
  if (c === 'orange') bg200.push('bg-[#ffe2d5]')
  rule(bg200.map((x) => sel(D, x, 'dark:bg-')), `background-color: ${tint(26)};`)
  rule([`hover:bg-${c}-50`, `hover:bg-${c}-50/40`, `hover:bg-${c}-100`].map((x) => sel(D, x, 'dark:hover:bg-', ':hover')), `background-color: ${tint(20)};`)
  rule([sel(D, `focus:bg-${c}-50`, 'dark:focus:bg-', ':focus')], `background-color: ${tint(20)};`)
  rule([`border-${c}-50`, `border-${c}-100`, `border-${c}-200`].map((x) => sel(D, x, 'dark:border-')), `border-color: ${tint(35)};`)
  rule([`ring-${c}-50`, `ring-${c}-100`, `ring-${c}-200`].map((x) => sel(D, x, 'dark:ring-')), `--tw-ring-color: ${tint(35)};`)
  rule([`text-${c}-700`, `text-${c}-800`, `text-${c}-900`].map((x) => sel(D, x, 'dark:text-')), `color: ${color(`${c}-400`)};`)
  rule([`from-${c}-50`, `hover:from-${c}-50`].map((x) => sel(D, x, 'dark:from-')), `--tw-gradient-from: ${tint(12)};`)
  rule([sel(D, `to-${c}-50`, 'dark:to-')], `--tw-gradient-to: ${tint(6)};`)
  rule([sel(D, `via-${c}-50`, 'dark:via-')], `--tw-gradient-via: ${tint(8)};`)
}

/* ───────── LIGHT: readability ───────── */
rule(['text-gray-400', 'text-zinc-400', 'text-slate-400', 'text-neutral-400'].map((c) => sel(L, c, '')), 'color: #7c828d;')
rule(['text-gray-300', 'text-zinc-300', 'text-slate-300'].map((c) => sel(L, c, '')), 'color: #9aa0a8;')
rule(['border-gray-100', 'border-zinc-100', 'border-slate-100', 'border-gray-200/70'].map((c) => sel(L, c, '')), 'border-color: #e3e5e8;')

const header = `/* AUTO-GENERATED by scripts/gen-panel-theme.js (edit that, not this file) — dashboard (admin + shop owner) theme fixes.
 * Scope: only pages that render <div class="panel-theme"> (the two dashboard layouts),
 * including dialogs/menus portaled to <body>.
 * Dark:  maps hard-coded light utilities (bg-white, text-gray-800, bg-orange-50 …) to dark
 *        equivalents — skipped for any element that already sets its own dark: variant,
 *        and for the green sidebar.
 * Light: slightly stronger borders, inputs and faint grey text for readability. */

${L} {
  --border: oklch(0.885 0 0);
  --input: oklch(0.85 0 0);
  --muted-foreground: oklch(0.48 0 0);
}

${D} {
  --pd-bg: #121214;
  --pd-surface: #1c1c20;
  --pd-surface-2: #24242a;
  --pd-surface-3: #2e2e35;
  --pd-surface-4: #393941;
  --pd-text-strong: #f4f4f5;
  --pd-text: #d4d4d8;
  --pd-text-muted: #a1a1aa;
  --pd-border: rgb(255 255 255 / 0.1);

  --background: var(--pd-bg);
  --card: var(--pd-surface);
  --popover: var(--pd-surface);
  --muted: var(--pd-surface-2);
  --accent: var(--pd-surface-3);
  --secondary: var(--pd-surface-2);
  --border: rgb(255 255 255 / 0.1);
  --input: rgb(255 255 255 / 0.16);
  --muted-foreground: var(--pd-text-muted);
  color-scheme: dark;
}

${D} input::placeholder,
${D} textarea::placeholder { color: #71717a; }
${D} select option { background-color: var(--pd-surface); color: var(--pd-text-strong); }
`
fs.writeFileSync(out, header + '\n' + rules.join('\n\n') + '\n')
console.log('rules:', rules.length)
