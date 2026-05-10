---
name: frontend-financial-display
description: "Patterns visuales reutilizables para SmartPocket. **Usar al** aplicar color semántico (ingreso/gasto/transferencia), glassmorphism effects, formatear montos, aplicar hover states, o cualquier decisión visual financiera. Mantiene consistencia del design system (paleta, timing, effects, variables semánticas dark/light). NO cubre estructura de componentes específicos."
argument-hint: 'Visual aspect (e.g., "color for expense", "glassmorphism", "number formatting")'
---

# SmartPocket - Financial Display Patterns

Patterns visuales reutilizables y design tokens para cualquier componente financiero. Enfocado en estilos, colores, effects y formateo — NO en estructura de componentes.

---

## When to Use This Skill

- **Color semántico**: decidir qué color usar para ingreso/gasto/transferencia
- **Variables semánticas**: usar `foreground`, `muted-foreground`, `text-tertiary` para textos adaptables dark/light
- **Glassmorphism**: aplicar `.glass-card`, `.glass-card-strong`, `.glass-card-hover`
- **Typography**: jerarquía de tamaños para montos y textos financieros
- **Number formatting**: formatear montos con símbolos de moneda
- **Effects**: glow, hover states, timing de animaciones
- **Responsive styles**: spacing progresivo, mobile-first patterns
- **Empty states**: estilizar mensajes de contenido vacío

**NO usar para**: estructura de componentes (ver `frontend-component-architecture`)

---

## Color Semántico Financiero

### Paleta Establecida

Usar colores específicos según tipo de dato financiero:

| Tipo de Dato       | Color Token  | Hex         | Clases Tailwind                          | Cuándo Usar                            |
| ------------------ | ------------ | ----------- | ---------------------------------------- | -------------------------------------- |
| **Ingreso (+)**    | `emerald`    | `#10b981`   | `text-emerald-400`, `bg-emerald-500`     | Dinero que entra, valores positivos    |
| **Gasto (-)**      | `red`        | `#ef4444`   | `text-red-400`, `bg-red-500`             | Dinero que sale, valores negativos     |
| **Transferencia**  | `sp-purple`  | `#8b5cf6`   | `text-sp-purple-400`, `bg-sp-purple-500` | Movimiento entre cuentas propias       |
| **Balance Total**  | `foreground` | Adaptable   | `text-foreground`                        | Balance consolidado (dato neutral)     |
| **Próximo Pago**   | `yellow/red` | Condicional | `text-yellow-400` / `text-red-400`       | Según días restantes (ver regla abajo) |
| **Primario (CTA)** | `sp-blue`    | `#1e40af`   | `bg-sp-blue-600`, `text-sp-blue-400`     | Botones primarios, links, FAB          |

### Reglas de Aplicación

**Próximos Pagos (Urgencia):**

```tsx
// Lógica de color según días restantes
const getPaymentUrgencyColor = (daysUntil: number) => {
  if (daysUntil <= 3) return "text-red-400 font-semibold"; // ⚠️ Urgente
  if (daysUntil <= 7) return "text-yellow-400"; // ⚠️ Próximo
  return "text-muted-foreground"; // ℹ️ Normal
};
```

### Color Backgrounds

**Cards & Surfaces:**

```tsx
// Card de cuenta/categoría con color de acento
<div className="glass-card border-l-4 border-emerald-500">
  {/* Border lateral de color semántico */}
</div>

// Badge de tipo de transacción
<span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
  Gasto
</span>
```

---

## Sistema de Variables Semánticas

SmartPocket usa un sistema de variables CSS semánticas que se adaptan automáticamente entre dark y light mode. Define `src/index.css` bajo `:root` y `.dark`.

### Variables Extendidas Disponibles

| Variable CSS         | Clase Tailwind          | Uso                                  | Ejemplo                                  |
| -------------------- | ----------------------- | ------------------------------------ | ---------------------------------------- |
| `--foreground`       | `text-foreground`       | Texto principal, títulos importantes | Nombre de cuenta, título de card         |
| `--muted-foreground` | `text-muted-foreground` | Texto secundario, metadata           | Descripciones, subtítulos                |
| `--text-tertiary`    | `text-text-tertiary`    | Hints, labels, información terciaria | "Version", labels de campos              |
| `--text-quaternary`  | `text-text-quaternary`  | Metadata, timestamps, badges sutiles | "hace 2h", "Financial Management"        |
| `--glass-base`       | `bg-glass-base`         | Background glassmorphism estándar    | Cards, containers elevados               |
| `--glass-strong`     | `bg-glass-strong`       | Background glassmorphism más opaco   | Sidebar, Header, Modales                 |
| `--hover-muted`      | `bg-hover-muted`        | Background hover sutil               | Hover en items de sidebar, transacciones |
| `--border-subtle`    | `border-border-subtle`  | Borders glassmorphism sutiles        | Separadores en cards glass               |
| `--background`       | `bg-background`         | Fondo de página base                 | Body background                          |
| `--card`             | `bg-card`               | Background cards sólidos (no glass)  | Cards en light mode                      |

### Regla de Uso de Variables

**Principio**: Preferir variables semánticas para elementos que deben adaptarse a dark/light mode. Usar colores específicos solo para datos financieros con significado semántico.

**✅ Usar variables semánticas para:**

- Fondos de containers y cards (si no requieren glassmorphism)
- Textos que no son datos financieros (títulos, descripciones, metadata)
- Borders y separadores generales
- Hover states de navegación

**✅ Usar colores específicos para:**

- **Datos financieros**: `emerald-400` (ingresos), `red-400` (gastos), `sp-purple-400` (transferencias)
- **Acciones primarias**: `sp-blue-600` (CTAs, botones principales)
- **Estados de urgencia**: `yellow-400`, `red-400` (próximos pagos, alertas)

```tsx
// ✅ Correcto: Variables semánticas para UI, colores específicos para datos
<div className="glass-card p-6">
  <h3 className="text-foreground font-semibold mb-2">Cuenta Principal</h3>
  <p className="text-text-quaternary text-xs mb-3">Actualizado hace 5m</p>
  <p className="text-2xl font-semibold text-emerald-400">
    {formatCurrency(balance)}
  </p>
</div>

// ❌ Incorrecto: Colores hardcoded para texto general
<div className="glass-card p-6">
  <h3 className="text-slate-50 font-semibold mb-2">Cuenta Principal</h3>
  <p className="text-slate-500 text-xs mb-3">Actualizado hace 5m</p>
</div>
```

### Clases Condicionales con `cn()`

Combinar variables semánticas con clases condicionales usando el helper `cn()`:

```tsx
import { cn } from "@/lib/utils";

// Texto base semántico + acento condicional
<span className={cn(
  "text-muted-foreground", // Base semántica
  isActive && "text-sp-blue-400" // Acento específico
)}>
  {label}
</span>

// Background hover + estado activo
<button className={cn(
  "hover:bg-hover-muted transition-colors",
  isActive && "bg-sp-blue-600/20 text-sp-blue-400"
)}>
  Dashboard
</button>
```

---

## Glassmorphism Effects

### Clases Custom Establecidas

Definidas en `src/index.css` bajo `@layer utilities`:

| Clase                | Uso                                    | Propiedades                                            |
| -------------------- | -------------------------------------- | ------------------------------------------------------ |
| `.glass-card`        | Cards estándar                         | `backdrop-blur-sm` + `bg-glass-base` + border + shadow |
| `.glass-card-strong` | Sidebar, Header, modales               | `backdrop-blur-lg` + `bg-glass-strong` (más opaco)     |
| `.glass-card-hover`  | Cards interactivas (combinar con base) | Hover: `bg-hover-muted` + `border-border` animado      |

### Patterns de Uso

**Card Estándar (sin hover):**

```tsx
// AccountCard, CategoryCard, MetricCard
<div className="glass-card p-6 rounded-2xl">
  <h3 className="text-lg font-semibold text-foreground">Cuenta Principal</h3>
  <p className="text-2xl font-semibold text-emerald-400">{formatCurrency(balance)}</p>
</div>
```

**Card Interactiva (con hover):**

```tsx
// TransactionItem, clickeable cards
<div className="glass-card glass-card-hover group p-4 rounded-xl cursor-pointer">
  <div className="flex items-center gap-3">
    <Icon className="group-hover:scale-110 transition-transform duration-200" />
    <span className="text-foreground">{description}</span>
  </div>
</div>
```

### Reglas de Composición

1. **Base siempre primero**: `.glass-card` o `.glass-card-strong`
2. **Hover opcional**: Agregar `.glass-card-hover` solo si es interactivo
3. **Group pattern**: Usar `group` en contenedor + `group-hover:` en hijos
4. **Border subtle**: `border border-border-subtle` (ya incluido en `.glass-card`)

```tsx
// ✅ Correcto: Composición completa
<div className="glass-card glass-card-hover group">
  <Icon className="group-hover:scale-110 transition-transform duration-200" />
</div>

// ❌ Incorrecto: Solo hover sin base
<div className="glass-card-hover">
```

---

## Typography & Number Display

### Jerarquía de Montos

SmartPocket usa la fuente Inter (sans-serif) para todos los textos y montos. La jerarquía visual se logra con tamaño, weight y color.

| Contexto               | Size Class              | Weight           | Color                                  | Ejemplo                |
| ---------------------- | ----------------------- | ---------------- | -------------------------------------- | ---------------------- |
| **Balance Hero**       | `text-4xl` - `text-5xl` | `font-extrabold` | `text-foreground` o `text-emerald-400` | Balance total en Home  |
| **Balance Card**       | `text-2xl`              | `font-bold`      | `text-emerald-400`                     | Balance en AccountCard |
| **Montos en Lista**    | `text-sm` - `text-base` | `font-semibold`  | `text-emerald-400` / `text-red-400`    | Transacciones en lista |
| **Montos Secundarios** | `text-sm`               | `font-normal`    | `text-muted-foreground`                | Metadata, subtotales   |

```tsx
// Ejemplos consolidados
<h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground">{formatCurrency(totalBalance)}</h2> // Hero
<p className="text-2xl font-semibold text-emerald-400">{formatCurrency(accountBalance)}</p> // Card
<span className={`text-sm font-semibold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(amount)}</span> // Lista
```

### Number Glow Effect

Para balances importantes en Hero sections:

```tsx
// Con glow sutil (text-shadow inline style)
<h2
  className="text-4xl font-extrabold text-foreground"
  style={{ textShadow: "0 0 30px rgba(248, 250, 252, 0.15)" }}
>
  {formatCurrency(totalBalance)}
</h2>
```

**Cuándo usar glow:**

- Balance total (hero en Home)
- Métricas destacadas en Dashboard
- Montos call-to-action

**Cuándo NO usar glow:**

- Listas de transacciones (clutter visual)
- Montos repetitivos en tablas

---

## Formateo de Montos

### Helper `formatCurrency()`

Helper existente en `src/utils/formatters.ts`:

```tsx
// Firma: formatCurrency(amount: number, currencySymbol?: string, locale?: string)
import { formatCurrency } from "@/utils/formatters";

<span className="text-emerald-400">{formatCurrency(balance)}</span> // Estándar
<span className="text-emerald-400">{formatCurrency(balance, "€")}</span> // Custom symbol
```

**Prefijo de signo** (para diferencias +/-):

```tsx
const displayAmount = amount >= 0 ? `+${formatCurrency(amount)}` : formatCurrency(amount);
```

---

## Hover States & Microinteractions

### Timing Establecido

| Contexto              | Duration       | Uso                                     |
| --------------------- | -------------- | --------------------------------------- |
| Hover rápido          | `duration-200` | Iconos, pequeños elementos interactivos |
| Transición estándar   | `duration-300` | Cards, buttons, modales                 |
| Animaciones complejas | `duration-500` | Balance counter, gráficos               |

### Patterns de Hover

**Card con Scale:**

```tsx
<div className="glass-card glass-card-hover group transition-all duration-300">
  {/* El scale-105 ya está en .glass-card-hover */}
</div>
```

**Íconos en Cards:**

```tsx
<Icon className="text-muted-foreground group-hover:scale-110 group-hover:text-sp-blue-400 transition-all duration-200" />
```

**Botones con Translate:**

```tsx
<button className="flex items-center gap-2 text-sp-blue-400 hover:gap-3 transition-all duration-200">
  Ver detalles
  <ArrowRight className="group-hover:translate-x-0.5 transition-transform" />
</button>
```

---

## Empty States

```tsx
// Pattern: glass-card + bg-secondary/50 (icon container) + text-muted-foreground (title) + text-text-tertiary (description)
<div className="glass-card p-8 rounded-2xl text-center">
  <div className="inline-flex p-4 rounded-full bg-secondary/50 mb-4">
    <Icon className="w-8 h-8 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No hay transacciones</h3>
  <p className="text-sm text-text-tertiary mb-6">Comienza registrando tu primera transacción</p>
  <button className="px-6 py-3 bg-sp-blue-600 text-white rounded-xl hover:bg-sp-blue-700 transition-colors duration-200">
    Nueva Transacción
  </button>
</div>
```

---

## Anti-Patterns (NO Hacer)

❌ **Color sin significado semántico**

```tsx
// Incorrecto: Ingreso en rojo, gasto en verde
<span className="text-red-400">{income}</span>
```

❌ **Colores hardcoded en lugar de variables semánticas**

```tsx
// Incorrecto: texto general con color hardcoded
<h3 className="text-slate-50">Cuenta Principal</h3>
<p className="text-slate-400">Descripción</p>

// Correcto: usar variables semánticas
<h3 className="text-foreground">Cuenta Principal</h3>
<p className="text-muted-foreground">Descripción</p>
```

❌ **Glassmorphism sin clase base**

```tsx
// Incorrecto: Re-definir propiedades ya existentes
<div className="backdrop-blur-md bg-slate-800/60">

// Correcto: usar clases establecidas
<div className="glass-card">
```

❌ **Hover en elementos no interactivos**

```tsx
// Incorrecto: Display card sin acción
<div className="glass-card-hover"> {/* No hace nada al click */}

// Correcto: solo si es clickeable
<div className="glass-card glass-card-hover cursor-pointer" onClick={...}>
```

---

## Checklist de Implementación

### Al Aplicar Estilos Financieros:

- [ ] **Color semántico**: ingreso=`emerald-400`, gasto=`red-400`, transferencia=`sp-purple-400`
- [ ] **Variables semánticas**: usar `text-foreground`, `text-muted-foreground`, `text-text-tertiary` para textos generales
- [ ] **Glassmorphism**: usar `.glass-card` (base) o `.glass-card-strong` (elevated)
- [ ] **Hover**: solo si es interactivo (`.glass-card-hover` + `group` pattern)
- [ ] **Timing**: `duration-200` hover, `duration-300` transiciones estándar
- [ ] **Formateo**: usar `formatCurrency()` helper de `@/utils/formatters`
- [ ] **Responsive**: mobile-first con `md:`, `lg:` breakpoints
- [ ] **Contraste**: verificar WCAG AA (color sobre background)

### Al Mostrar Montos Destacados:

- [ ] **Glow effect**: aplicar `textShadow` inline si es hero/métrica principal
- [ ] **Jerarquía**: `text-4xl` hero, `text-2xl` cards, `text-sm` listas
- [ ] **Weight**: `font-extrabold` hero, `font-bold` destacados, `font-semibold` estándar
- [ ] **Animation**: counter animation si se actualiza en tiempo real (opcional)

---

## Ejemplos de Aplicación

### Monto con Color Semántico

```tsx
// En cualquier componente que muestre montos
const amountColor =
  type === "income"
    ? "text-emerald-400"
    : type === "expense"
      ? "text-red-400"
      : "text-sp-purple-400";

<span className={`text-sm font-semibold ${amountColor}`}>{formatCurrency(amount)}</span>;
```

### Balance Hero con Glow

```tsx
// Balance destacado en hero section
<h2
  className="text-4xl md:text-5xl font-extrabold text-foreground"
  style={{ textShadow: "0 0 30px rgba(248, 250, 252, 0.15)" }}
>
  {formatCurrency(totalBalance)}
</h2>
```

### Card con Glassmorphism + Hover

```tsx
// Card interactiva con todos los effects
<div className="glass-card glass-card-hover group p-6 rounded-2xl">
  <Icon className="text-muted-foreground group-hover:scale-110 group-hover:text-sp-blue-400 transition-all duration-200" />
  <span className="text-2xl font-bold text-emerald-400">{formatCurrency(balance)}</span>
</div>
```

---

## Referencias

- **Design System**: `src/index.css` (clases `.glass-card-*`, colores `oklch`)
- **Colors**: `.github/copilot-instructions.md` (paleta semántica completa)
- **UX Spec**: `_docs/planning/ux-design-specification.md` (decisiones de diseño)
- **Formatters**: `src/utils/formatters.ts` (crear si no existe)

---

**Reminder**: Este skill documenta **patterns visuales reutilizables** (colores, effects, typography). Para estructura de componentes específicos, ver `frontend-component-architecture`.

**Uso**: Copilot cargará este skill automáticamente cuando preguntes sobre estilos, colores, glassmorphism, o formateo de montos. No necesitas invocarlo manualmente.
