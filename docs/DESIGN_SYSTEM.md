# Sistema de Diseño Corporativo ValorApp

## 🎨 Paleta de Colores

### Colores Primarios
- **Primary**: `#0000D0` - Azul corporativo principal
- **Primary Light**: `#2929E5` - Variante clara para degradados
- **Primary Dark**: `#0000B8` - Estado hover/activo
- **Primary Ultra Light**: `#5252FF` - Acentos y degradados finales

### Colores Secundarios
- **Secondary**: `#FF3184` - Rosa vibrante para acciones importantes
- **Secondary Dark**: `#E6006F` - Estado hover
- **Secondary Bright**: `#FF1493` - Acentos y énfasis

### Colores de Sistema
- **Background**: `#FFFFFF` - Fondo principal
- **Surface**: `rgba(255, 255, 255, 0.98)` - Tarjetas y paneles
- **Text Primary**: `#1a1a1a` - Texto principal
- **Text Secondary**: `#666666` - Texto secundario

## 🎭 Efectos y Sombras

### Sombras Corporativas
```css
/* Primary Shadow */
box-shadow: 0 10px 25px -8px rgba(0, 0, 208, 0.4);

/* Secondary Shadow */
box-shadow: 0 12px 32px -8px rgba(255, 49, 132, 0.7);

/* Card Shadow */
box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.3);
```

### Degradados
```css
/* Primary Gradient - Pantalla de bienvenida */
background: linear-gradient(135deg, #0000D0 0%, #2929E5 50%, #5252FF 100%);

/* Secondary Gradient - Botón FRAUDE */
background: linear-gradient(135deg, #FF3184 0%, #FF1493 100%);
```

## 📐 Espaciado y Tipografía

### Escala de Espaciado
- **XS**: `0.25rem` (4px)
- **SM**: `0.5rem` (8px)
- **MD**: `1rem` (16px)
- **LG**: `1.5rem` (24px)
- **XL**: `2rem` (32px)
- **2XL**: `3rem` (48px)
- **3XL**: `4rem` (64px)

### Tipografía
- **Títulos**: `clamp(2.5rem, 8vw, 4rem)` - Responsive, peso 800
- **Subtítulos**: `clamp(1.75rem, 4vw, 2.25rem)` - Peso 800
- **Texto**: `clamp(1rem, 2.5vw, 1.125rem)` - Peso 500
- **Botones**: `1.25rem` - Peso 700, uppercase, letter-spacing 0.08em

## 🎯 Componentes

### Botón Principal (Primary)
```tsx
style={{
  background: '#0000D0',
  color: '#FFFFFF',
  border: 'none',
  padding: '1.25rem 2.5rem',
  fontSize: '1rem',
  fontWeight: 700,
  borderRadius: '12px',
  boxShadow: '0 10px 25px -8px rgba(0, 0, 208, 0.5)',
  cursor: 'pointer',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}}
// Hover: background #0000B8, translateY(-4px)
```

### Botón Secundario (Secondary)
```tsx
style={{
  background: 'linear-gradient(135deg, #FF3184 0%, #FF1493 100%)',
  color: '#FFFFFF',
  border: 'none',
  padding: '1.75rem 4rem',
  fontSize: '1.25rem',
  fontWeight: 700,
  borderRadius: '16px',
  boxShadow: '0 12px 32px -8px rgba(255, 49, 132, 0.7)',
  // ... transiciones similares
}}
```

### Botón Ghost (Transparente)
```tsx
style={{
  background: 'rgba(255, 255, 255, 0.15)',
  color: '#FFFFFF',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(10px)',
  // ... resto del estilo
}}
```

### Panel Modal
```tsx
style={{
  background: 'rgba(255, 255, 255, 0.98)',
  padding: '3rem 2.5rem',
  borderRadius: '24px',
  boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(20px)',
}}
```

## 🎬 Animaciones y Transiciones

### Transiciones Estándar
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Efectos Hover
- **Elevación**: `translateY(-4px)` a `translateY(-6px)`
- **Escala**: `scale(1.02)` para énfasis sutil
- **Sombra**: Aumentar intensidad y difusión en hover

### Efectos de Fondo
```tsx
// Orbes decorativos con blur
<div style={{
  position: 'absolute',
  background: 'radial-gradient(circle, rgba(255,49,132,0.15) 0%, transparent 70%)',
  borderRadius: '50%',
  filter: 'blur(60px)'
}} />
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Técnicas
- Uso de `clamp()` para tamaños fluidos
- `flex-wrap: wrap` en contenedores de botones
- `minWidth` en botones para mantener legibilidad
- `max-width` en textos para control de línea

## ✨ Principios de Diseño

1. **Coherencia**: Todos los componentes siguen la misma paleta y espaciado
2. **Jerarquía Visual**: Uso estratégico de colores primarios (azul) y secundarios (rosa)
3. **Feedback Visual**: Animaciones suaves en hover/interacción
4. **Accesibilidad**: Alto contraste, tamaños de fuente legibles
5. **Modernidad**: Degradados sutiles, sombras suaves, bordes redondeados
6. **Performance**: Transiciones optimizadas con `cubic-bezier`

## 🔧 Variables CSS (tokens.css)

```css
:root {
  /* Colores */
  --color-primary: #0000D0;
  --color-primary-light: #2929E5;
  --color-primary-dark: #0000B8;
  --color-secondary: #FF3184;
  --color-secondary-dark: #E6006F;
  
  /* Sombras */
  --shadow-primary: 0 10px 25px -8px rgba(0, 0, 208, 0.4);
  --shadow-secondary: 0 12px 32px -8px rgba(255, 49, 132, 0.7);
  
  /* Transiciones */
  --transition-fast: 0.15s;
  --transition-base: 0.3s;
  --transition-slow: 0.5s;
  --timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 📋 Checklist de Implementación

- [x] Crear tokens de diseño en `tokens.css`
- [x] Actualizar pantalla de bienvenida del Dashboard
- [x] Rediseñar botones principales (FRAUDE/AVERÍA)
- [x] Actualizar panel de subopciones de avería
- [x] Implementar efectos decorativos de fondo
- [ ] Actualizar componentes de filtros
- [ ] Rediseñar tabla ATR
- [ ] Actualizar componentes de formulario
- [ ] Implementar componentes Card corporativos
- [ ] Documentar patrones de uso

## 🎓 Guía de Uso

### Para agregar un nuevo botón principal:
```tsx
<button
  style={{
    background: '#0000D0',
    color: '#FFFFFF',
    padding: '1.25rem 2.5rem',
    borderRadius: '12px',
    // ... copiar propiedades del sistema
  }}
>
  TEXTO
</button>
```

### Para agregar un botón de acción importante:
```tsx
<button
  style={{
    background: 'linear-gradient(135deg, #FF3184 0%, #FF1493 100%)',
    // ... usar estilo secundario
  }}
>
  ACCIÓN
</button>
```

---

**Última actualización**: Dashboard - Pantalla de bienvenida rediseñada con colores corporativos
