---
description: "Tailwind CSS v4 breaking changes and utility-first styling patterns for SmartPocket webapp"
applyTo: "webapp/**/*.{css,tsx}"
---

# Tailwind CSS v4 Standards

Tailwind CSS v4 conventions with breaking changes from v3.

## Breaking Changes (v3 → v4)

### ❌ ELIMINADO en v4

```javascript
// ❌ NO existe tailwind.config.js
module.exports = {
  theme: {
    colors: { primary: "#1e40af" },
  },
};
```

```css
/* ❌ NO usar @tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```css
/* ❌ Colores en hex OBSOLETO */
--color-primary: #1e40af;
```

### ✅ NUEVA sintaxis v4

**1. Import statement**

```css
/* ✅ En index.css */
@import "tailwindcss";
```

**2. Theme configuration con @theme**

```css
/* ✅ En index.css con @theme */
@theme {
  --color-sp-blue-600: oklch(0.424 0.181 266);
  --color-sp-blue-700: oklch(0.331 0.178 266);
  --font-size-base: 1rem;
  --spacing-4: 1rem;
}
```

**3. Colores en formato oklch**

| Color | Formato v3 (HEX) | Formato v4 (OKLCH)       |
| ----- | ---------------- | ------------------------ |
| Blue  | `#1e40af`        | `oklch(0.424 0.181 266)` |
| Red   | `#dc2626`        | `oklch(0.577 0.245 25)`  |
| Green | `#16a34a`        | `oklch(0.599 0.163 145)` |

**4. Vite plugin**

```typescript
// ✅ vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // NO PostCSS config
  ],
});
```

## Utility-First Approach

**✅ PREFERIR: Utility classes**

```tsx
<div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Button</div>
```

**❌ EVITAR: Inline CSS**

```tsx
<div style={{ padding: "1rem", backgroundColor: "#1e40af" }}>Bad</div>
```

## Conditional Classes con `cn()`

**SIEMPRE usar `cn()` helper para clases condicionales**

```tsx
import { cn } from '@/lib/utils';

// ✅ Correcto
<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === "primary" && "primary-class",
  className
)} />

// ❌ Evitar concatenación manual
<div className={`base-class ${isActive ? 'active-class' : ''}`} />
```

### Patterns comunes

```tsx
// ✅ Boolean conditional
<button className={cn(
  "btn",
  isLoading && "opacity-50 cursor-not-allowed"
)} />

// ✅ Variant mapping
<div className={cn(
  "card",
  variant === "primary" && "bg-blue-600",
  variant === "secondary" && "bg-gray-600"
)} />

// ✅ Props spreading
<Component className={cn("default-styles", className)} />
```

## Responsive Design

**Mobile-first approach**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
</div>

<p className="text-sm md:text-base lg:text-lg">
  Responsive text
</p>
```

## Custom Utilities

**Definir custom classes en `index.css`**

```css
@import "tailwindcss";

@theme {
  --color-sp-blue-600: oklch(0.424 0.181 266);
}

/* ✅ Custom utilities */
@layer components {
  .glass-card {
    @apply backdrop-blur-md bg-white/10 rounded-lg border border-white/20;
  }
}
```

**Uso:**

```tsx
<div className="glass-card p-6">Content</div>
```

## Pseudo-classes

```tsx
{/* Hover, focus, active */}
<button className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
  Click me
</button>

{/* Group hover */}
<div className="group">
  <p className="group-hover:text-blue-600">
    Hover parent
  </p>
</div>

{/* Peer state */}
<input type="checkbox" className="peer" />
<label className="peer-checked:text-blue-600">
  Label
</label>
```

## Dark Mode

```tsx
{
  /* ✅ Dark mode con class strategy */
}
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">Content</div>;
```

## Performance

**❌ EVITAR: Excesivas clases dinámicas**

```tsx
// ❌ Re-render en cada cambio
<div className={`bg-${color}-600`} /> // NO funciona en Tailwind
```

**✅ USAR: Variantes predefinidas**

```tsx
// ✅ Mapping estático
const colorMap = {
  blue: "bg-blue-600",
  red: "bg-red-600",
} as const;

<div className={colorMap[color]} />;
```

## Validation

- Verificar sintaxis: `npm run dev` (Vite muestra errores de Tailwind)
- Producción: `npm run build`
