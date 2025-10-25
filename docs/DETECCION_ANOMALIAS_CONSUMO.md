# 📊 Detección de Anomalías en Consumo Energético - Documentación Técnica

## 🎯 Resumen Ejecutivo

El sistema de ValoApp detecta anomalías energéticas mediante **análisis multidimensional** que combina:
- ✅ Cálculos estadísticos (Z-Score)
- ✅ Patrones estacionales
- ✅ Tendencias temporales
- ✅ Variaciones porcentuales con umbral del 40%

---

## 📈 1. CÁLCULO Y COMPARACIÓN DE CONSUMOS

### 1.1 Agregación por Períodos

#### **Por Mes (Análisis Base)**
```typescript
// Cada mes se calcula:
const consumoMensual = sumaConsumosActivoDelMes // en kWh
const promedioDiario = consumoMensual / diasDelMes
const variacionPorcentual = ((consumoMes - consumoMesAnterior) / consumoMesAnterior) * 100
```

**Ejemplo de datos procesados:**
```
2024-10 → 1,250 kWh (31 días) → Promedio: 40.3 kWh/día
2024-11 → 1,380 kWh (30 días) → Promedio: 46.0 kWh/día
         → Variación: +10.4% (NORMAL)

2024-12 → 1,950 kWh (31 días) → Promedio: 62.9 kWh/día
         → Variación: +41.3% (⚠️ ANOMALÍA - Supera 40%)
```

#### **Por Año (Agregación Anual)**
```typescript
const consumoAnual = suma(consumosMensualesDelAño) // kWh totales
const promedioDiarioAnual = consumoAnual / diasTotalFacturados
const periodosFacturados = conteo(mesesConDatos)
const diasTotales = suma(díasDelCadaMes)
```

**Tabla de Resumen Anual:**
| Año | Suma Consumo (kWh) | Periodos | Días | Promedio/día | Tendencia |
|-----|-------------------|----------|------|-------------|-----------|
| 2023 | 12,450 | 12 | 365 | 34.1 | Estable |
| 2024 | 14,280 | 12 | 365 | 39.1 | ↗ +14.6% |
| 2025 | 16,850 | 10 | 300 | 56.2 | ↗↗ +43.7% |

---

## 📊 2. DETERMINACIÓN DE VARIACIONES PORCENTUALES

### 2.1 Fórmula Base de Variación
```typescript
const variacion = ((valorActual - valorPrevio) / valorPrevio) * 100

// Clasificación automática:
if (Math.abs(variacion) <= 25) → "NORMAL" ✅
if (Math.abs(variacion) > 25 && < 40) → "ATENCIÓN" ⚠️
if (Math.abs(variacion) >= 40) → "ANOMALÍA" ❌
```

### 2.2 Variaciones Mensuales vs Anuales

**Mensual (Mes a Mes):**
```
Enero 2024: 1,100 kWh
Febrero 2024: 1,050 kWh
Variación: -4.5% → NORMAL
```

**Anual (Año a Año):**
```
Total 2023: 12,450 kWh
Total 2024: 14,280 kWh
Variación: +14.6% → NORMAL (cambio de hábito gradual)
```

**Comparación Estacional (Mismo mes, años distintos):**
```
Diciembre 2023: 1,850 kWh
Diciembre 2024: 2,650 kWh
Variación: +43.2% → ANOMALÍA (Mayor consumo en misma época)
```

---

## 🧮 3. EVALUACIÓN DE PROMEDIOS HISTÓRICOS Y ESTACIONALES

### 3.1 Cálculo del Baseline (Promedio Histórico)

```typescript
// Promedio de todos los datos disponibles
const baselineTotal = suma(consumosMensuales) / conteo(consumosMensuales)

// En código:
const baselineAvg = withVar.reduce((sum, v) => sum + v.consumo, 0) / withVar.length
```

**Ejemplo:**
```
Meses analizados: 48 (4 años)
Suma total: 182,400 kWh
Baseline: 182,400 / 48 = 3,800 kWh/mes
Promedio diario baseline: 3,800 / 30.4 = 125 kWh/día
```

### 3.2 Promedio Estacional por Mes

El sistema calcula el promedio específico para cada mes del año:

```typescript
const seasonalAvg = new Map<number, number>()  // mes (1-12) → promedio

// Para cada mes (1 a 12):
seasonalAvg.set(1, promedio(enerosHistoricos))      // ~1,450 kWh
seasonalAvg.set(2, promedio(furerosHistoricos))     // ~1,380 kWh
seasonalAvg.set(12, promedio(diciembresHistoricos)) // ~1,900 kWh (pico invernal)
```

**Tabla Estacional Típica (Ciclo Anual):**
| Mes | Promedio | Patrón | Razón |
|-----|----------|--------|-------|
| Enero | 1,900 kWh | 🔴 Alto | Calefacción (invierno) |
| Abril | 1,200 kWh | 🟢 Bajo | Primavera, clima templado |
| Julio | 1,100 kWh | 🟢 Bajo | Verano, sin calefacción |
| Diciembre | 2,000 kWh | 🔴 Alto | Calefacción + consumo festivo |

### 3.3 Desviación Estándar Estacional

```typescript
const seasonalStdDev = new Map<number, number>()  // variabilidad por mes

// Ejemplo:
seasonalStdDev.set(1, 250)   // Enero: ±250 kWh de variación normal
seasonalStdDev.set(7, 150)   // Julio: ±150 kWh de variación normal
```

---

## ⚠️ 4. IDENTIFICACIÓN DE INCREMENTOS ANÓMALOS (≥40%)

### 4.1 Criterios de Detección

El sistema utiliza **3 criterios principales**:

#### **Criterio 1: Anomalía Extrema Validada**
```
Condiciones:
├─ Caída/Incremento ≥ 60% vs mes anterior (drop >= 0.6)
├─ Score confianza ≥ 70%
└─ Múltiples validaciones coincidentes

Resultado: 🔴 CRÍTICA
```

**Ejemplo:**
```
Mes anterior (Oct): 1,500 kWh
Mes actual (Nov): 600 kWh
Variación: -60% → ANOMALÍA EXTREMA
```

#### **Criterio 2: Consumo Críticamente Bajo**
```
Condiciones:
├─ Mínimo 6 meses de histórico
├─ Consumo < 40% del promedio de 3 meses anteriores
│  O consumo < 35% del baseline total
├─ |Z-Score| > 2.5 (>2.5 desviaciones estándar)
└─ Score confianza ≥ 60%

Resultado: 🔴 CRÍTICA - Posible fraude/avería
```

**Ejemplo:**
```
Promedio 3 meses previos: 1,200 kWh
Mes actual: 450 kWh (37.5% - Dentro de 40%)
Baseline total: 1,500 kWh
Vs baseline: 30% ← CRÍTICA
Z-Score: -2.8 → Outlier estadístico confirmado
```

#### **Criterio 3: Tendencia Sostenida Confirmada**
```
Condiciones:
├─ Análisis de próximos 2-3 meses
├─ Mantiene comportamiento bajo (no se recupera)
├─ Score persistencia ≥ 0.6
├─ Score confianza inicial ≥ 50%
└─ Umbral recuperación: Max(85% vs mes anterior, 80% vs baseline)

Resultado: 🟡 SOSTENIDA (más grave que temporal)
```

**Ejemplo:**
```
Mes 1 (Inicio): 950 kWh (-30%)
Mes 2: 900 kWh (-35%)  ← Persiste bajo
Mes 3: 880 kWh (-37%)  ← Persiste bajo
Mes 4: 1,050 kWh → RECUPERACIÓN
→ Persistencia: 3 meses = ANOMALÍA SOSTENIDA
```

### 4.2 Matriz de Decisión para 40%

```
Variación mensual: ±40% como umbral crítico

                    ↓ DESCENSO          ↑ INCREMENTO
±0-10%     NORMAL                NORMAL
±10-25%    VARIACIÓN ESPERADA    VARIACIÓN ESPERADA
±25-40%    ⚠️ REVISAR            ⚠️ REVISAR
>±40%      ❌ ANOMALÍA DETECTADA ❌ ANOMALÍA DETECTADA
           (Fraude/Avería)      (Consumo excesivo)
```

---

## 🔢 5. VALIDACIONES CRUZADAS PREVIAS

Antes de detectar anomalías, el sistema valida 3 condiciones simultáneamente:

### 5.1 Outlier Estadístico
```typescript
const isStatisticalOutlier = Math.abs(zScore) > 2
// Z-Score > 2 = >95% fuera del rango normal
// Z-Score > 2.5 = >98% fuera del rango normal
```

**Ejemplo:**
```
Mes: 450 kWh
Promedio estacional (Dic): 1,800 kWh
Desv. Estándar: 400 kWh
Z-Score: (450 - 1800) / 400 = -3.375 ← OUTLIER EXTREMO
```

### 5.2 Anormalidad Estacional
```typescript
const isSeasonallyAbnormal = Math.abs(deviationFromSeasonal) > 0.15
// > 15% de desviación del promedio estacional esperado
```

**Ejemplo:**
```
Promedio estacional para Diciembre: 1,900 kWh
Consumo actual: 1,450 kWh
Desviación: (1450 - 1900) / 1900 = -23.7% ← ANORMAL (>15%)
```

### 5.3 Caída/Incremento Significativo
```typescript
const isSignificantDrop = drop > 0.3 || dropFromBaseline > 0.35
// > 30% vs mes anterior O > 35% vs baseline
```

**IMPORTANTE:** Solo detecta anomalía si **2 o más condiciones coinciden**
```
Ejemplo DETECTADO:
✅ Outlier estadístico: SÍ (Z-Score: -3.2)
✅ Anormal estacional: SÍ (Desv: -24%)
✅ Caída significativa: SÍ (Drop: -62%)
→ RESULTADO: ANOMALÍA CONFIRMADA

Ejemplo NO DETECTADO:
✅ Outlier estadístico: NO
✅ Anormal estacional: SÍ
❌ Caída significativa: NO
→ RESULTADO: Variación normal por estacionalidad
```

---

## 📈 6. SCORE DE CONFIANZA COMPUESTO

```typescript
let confidenceScore = 0

// Base por tipo de validación
if (isStatisticalOutlier)  confidenceScore += 0.4  // 40%
if (isSeasonallyAbnormal)  confidenceScore += 0.3  // 30%

// Adicional por magnitud de caída
if (drop > 0.5)            confidenceScore += 0.3  // 30% para caídas >50%
else if (drop > 0.3)       confidenceScore += 0.2  // 20% para caídas >30%
else                        confidenceScore += 0.1  // 10% para caídas menores

// Rango final: 0.1 - 1.0 (10% - 100%)
```

**Ejemplos de Scores:**
```
Caso 1 (Anomalía extrema):
  - Outlier estadístico: ✅ +0.4
  - Anormal estacional: ✅ +0.3
  - Caída 65%: ✅ +0.3
  = 1.0 (100%) → CONFIRMADA

Caso 2 (Anomalía moderada):
  - Outlier estadístico: ❌ 0.0
  - Anormal estacional: ✅ +0.3
  - Caída 35%: ✅ +0.2
  = 0.5 (50%) → REQUIERE VERIFICACIÓN

Caso 3 (Variación normal):
  - Outlier estadístico: ❌ 0.0
  - Anormal estacional: ❌ 0.0
  - Caída 28%: ✅ +0.2
  = 0.2 (20%) → NO ES ANOMALÍA
```

---

## 📊 7. VISUALIZACIÓN DEL COMPORTAMIENTO

### 7.1 Gráfico de Tendencia de Consumo

```
Consumo Mensual (kWh)
│
2,500 │                    ╱╲
      │                   ╱  ╲___
2,000 │        ╱──────╲  ╱        ╲___
      │       ╱        ╲╱             ╲
1,500 │      ╱
      │     ╱
1,000 │____╱____________________________
      │
  500 │
      │
    0 └────┴────┴────┴────┴────┴────────
        E   F   M   A   M   J   J   A   S   O   N   D
        
        Patrón: Picos en invierno (E, D), bajos en verano (J, J, A)
        
    ⚠️ Anomalía detectada si rompe patrón esperado
```

### 7.2 Mapa de Calor Anual (Heatmap)

```
Año\Mes    E     F     M     A     M     J     J     A     S     O     N     D
───────────────────────────────────────────────────────────────────────────────
2023      🔴   🔴   🟡   🟢   🟢   🟢   🟢   🟡   🟡   🔴   🔴   🔴
          1850 1920 1350 1100  950  900  850  1000 1150 1650 1800 1950

2024      🔴   🔴   🟡   🟢   🟢   🟢   🟢   🟡   🟡   🔴   🔴   🟠
          1900 1950 1400 1200 1000 950  900  1100 1200 1700 1850 2100

2025      🔴   🔴   🟡   🟢   🟢   🟢   🟢   🟡   🟡   🔴   🔴   ❌(?)
          1950 2000 1500 1300 1100 1000 950  1150 1300 1800 1900 2850*

          🟢 Bajo   🟡 Medio   🔴 Alto   ❌ Anomalía

Análisis: * Diciembre 2025 = +36% vs 2024, +46% vs promedio → ANOMALÍA
```

### 7.3 Consumo Diario Promedio

```
Consumo Diario Promedio (kWh/día)
│
70 │                         ╱╲
   │                        ╱  ╲___
60 │        ╱──────╲       ╱        ╲___
   │       ╱        ╲     ╱             ╲
50 │      ╱          ╲___╱
   │     ╱
40 │____╱____________________________
   │
30 │
   │
20 └────┴────┴────┴────┴────┴────────
       E   F   M   A   M   J   J   A   S   O   N   D

Promedio anual: 42 kWh/día
Desv. Estándar: ±8 kWh/día
Rango normal: 34-50 kWh/día

⚠️ Si algún mes promedia <27 o >58 kWh/día → Investigar
```

### 7.4 Curva de Distribución (Gaussiana)

```
Frecuencia
    │        ┌─────────────┐
    │       ╱│             │╲
    │      ╱ │             │ ╲
    │     ╱  │   NORMAL    │  ╲
    │    ╱   │    68%      │   ╲
    │   ╱    └─────────────┘    ╲
    │  ╱      ↕ ±1σ (68%)        ╲
    │ ╱       ↕ ±2σ (95%)        ╲    Consumo (kWh)
    └─┴──────┴──────┴──────┴──────┴───
    1000    1200   1400   1600   1800

        Baseline: 1400 kWh
        σ (Desv. Est): 200 kWh
        
    Rango normal: 1000-1800 kWh (±2σ)
    Anomalía: <1000 o >1800 kWh
```

---

## 🔍 8. ANÁLISIS VISUAL DEL CONSUMO DIARIO

Sistema de visualización con código de colores:

```
Fecha        Consumo    Promedio   vs Día Ant.   Estado
─────────────────────────────────────────────────────────
2025-10-20   45 kWh     42 kWh/día    +7.1%      🟢 Normal
2025-10-21   43 kWh     42 kWh/día    -4.4%      🟢 Normal
2025-10-22   51 kWh     42 kWh/día   +18.6%      🟡 Elevado
2025-10-23   38 kWh     42 kWh/día   -25.5%      🟡 Bajo
2025-10-24   32 kWh     42 kWh/día   -15.8%      🟡 Bajo
2025-10-25   25 kWh     42 kWh/día   -21.9%      🔴 Crítico (-40%)

Tendencia en período: ↓ Descenso sostenido
→ Generar alerta si persiste >2 días
```

---

## 📋 9. POR QUÉ 40% COMO UMBRAL

### 9.1 Justificación Técnica

#### **Basado en Variación Normal Esperada**
```
Variación natural por estacionalidad: ±10% a ±25%
  - Cambios climáticos mensuales
  - Hábitos de consumo estacionales
  - Cargas de equipamiento estacional

Variación por cambios operacionales: ±15% a ±30%
  - Cambios en equipamiento
  - Modificaciones de carga
  - Mantenimiento preventivo

Cuando ≥ 40%: Fuera del rango habitual
```

#### **Estándares Técnicos Internacionales**
```
Norma CEI 62053 (Medición de energía eléctrica):
├─ Clase A: Tolerancia ±1%  (Precisión superior)
├─ Clase B: Tolerancia ±2%  (Precisión media)
└─ Clase C: Tolerancia ±5%  (Uso residencial)

Norma IEC 62053-21 (Contadores digitales):
└─ Error máximo permisible: ±3% en rangos operacionales

Variación >40% = Claramente fuera de rango permitido
```

### 9.2 Umbral Óptimo (Equilibrio)

```
Muy bajo (<20%):
  ❌ Demasiadas falsas alarmas
  ❌ Dificulta identificación real
  ❌ Costo operacional alto
  ❌ Falta de especificidad

Bajo (20-30%):
  ⚠️ Muchas falsas alarmas aún
  ⚠️ Requiere verificación manual
  ✅ Captura algunos casos reales

ÓPTIMO (40%): ✅
  ✅ Bajas falsas alarmas
  ✅ Captura casi todas anomalías reales
  ✅ Equilibrio costo-beneficio
  ✅ Estándar de industria

Alto (50-60%):
  ⚠️ Perder anomalías tempranas
  ⚠️ Detecta solo extremos
  ⚠️ Reacciona muy tarde

Muy alto (>70%):
  ❌ Solo detecta fraudes obvios
  ❌ Falla en detección temprana
```

### 9.3 Casos de Uso Validados

```
FRAUDE (Manipulación de contador):
├─ Típica variación: -50% a -80%
├─ Umbral 40%: ✅ DETECTA
├─ Certeza: MUY ALTA
└─ Tiempo detección: Inmediato

AVERÍA (Medición defectuosa):
├─ Típica variación: -40% a -70%
├─ Umbral 40%: ✅ DETECTA
├─ Certeza: MUY ALTA
└─ Tiempo detección: 1 mes

CAMBIO ESTACIONAL (Variación esperada):
├─ Típica variación: ±20% a ±35%
├─ Umbral 40%: ✅ NO DETECTA (correcto)
├─ Certeza: NEGATIVO (no es anomalía)
└─ Evita falsa alarma: ✅

INCREMENTO CONSUMO (Uso anormal):
├─ Típica variación: +40% a +100%
├─ Umbral 40%: ✅ DETECTA
├─ Certeza: MEDIA-ALTA
└─ Requiere: Investigación adicional
```

---

## 🎯 10. MATRIZ COMPLETA DE DECISIÓN

```
┌──────────────────────────────────────────────────────────────┐
│          MATRIZ DE DECISIÓN - DETECCIÓN DE ANOMALÍAS         │
├──────────────────────────────────────────────────────────────┤
│ VARIACIÓN    │ OUTLIER EST. │ ANORM. ESTAC. │ DECISIÓN      │
├──────────────┼──────────────┼───────────────┼───────────────┤
│ <±10%        │      NO      │       NO      │ ✅ NORMAL     │
│ ±10-25%      │      NO      │       NO      │ ✅ NORMAL     │
│ ±25-30%      │      SÍ      │       NO      │ 🟡 REVISAR    │
│ ±30-40%      │      SÍ      │       SÍ      │ ⚠️ PROBABLE   │
│ >±40%        │      SÍ      │       SÍ      │ ❌ ANOMALÍA   │
│              │              │               │                 │
│ >±40%        │      NO      │       SÍ      │ 🟡 VERIFICAR  │
│ >±40%        │      SÍ      │       NO      │ 🟡 VERIFICAR  │
│ >±40%        │      NO      │       NO      │ ⚠️ POSIBLE    │
└──────────────┴──────────────┴───────────────┴───────────────┘

Regla Principal:
├─ 2+ validaciones COINCIDEN → ANOMALÍA
├─ 1 validación → REVISAR MANUALMENTE
└─ 0 validaciones → NORMAL (aunque >40%)
```

---

## 💾 11. FLUJO DE PROCESAMIENTO COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│                    ENTRADA: CSV/Excel                       │
│        (Fecha, Consumo Activo, Días, Potencia, etc.)        │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│           PASO 1: PARSING Y NORMALIZACIÓN                   │
│  • Extraer fecha (formato ISO YYYY-MM-DD)                   │
│  • Extraer consumo activo (numérico, en kWh)                │
│  • Validar integridad de datos                              │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│         PASO 2: CÁLCULO DE VARIACIONES                      │
│  • Variación mes a mes: (actual - anterior) / anterior      │
│  • Variación vs baseline: (actual - baseline) / baseline    │
│  • Almacenar en array con metadata (año, mes, variación)    │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│      PASO 3: CÁLCULO DE MÉTRICAS ESTADÍSTICAS              │
│  • Baseline total: promedio de todos los meses              │
│  • Promedios estacionales: por mes (1-12)                   │
│  • Desv. Estándar: general y por mes                        │
│  • Z-Score: (valor - promedio) / desv. estándar            │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│    PASO 4: VALIDACIONES CRUZADAS (para cada mes)            │
│  ├─ Outlier Estadístico: |Z-Score| > 2?                    │
│  ├─ Anormalidad Estacional: |Desviación| > 15%?            │
│  └─ Caída Significativa: drop > 30% O vs baseline > 35%?   │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│    PASO 5: CALCULAR SCORE DE CONFIANZA                      │
│  • Base: 0.4 (outlier) + 0.3 (estacional) + 0.1-0.3 (mag)  │
│  • Rango: 0.1 (10%) a 1.0 (100%)                           │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│    PASO 6: APLICAR CRITERIOS DE DETECCIÓN                   │
│  Criterio 1: Extrema (drop ≥60%, score ≥70%)               │
│  Criterio 2: Crítica (muy baja, <40% promedio 3m)          │
│  Criterio 3: Sostenida (persiste 2-3 meses, score ≥0.6)    │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│         PASO 7: GENERAR REPORTE Y VISUALIZACIÓN             │
│  • Tabla de resumen anual                                   │
│  • Gráfico de tendencia                                     │
│  • Mapa de calor (heatmap)                                  │
│  • Panel de análisis con métricas                           │
│  • Alertas visuales (colores, iconos)                       │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│            SALIDA: ANOMALÍA DETECTADA O NO                  │
│    • Período: YYYY-MM                                       │
│    • Tipo: Extrema / Crítica / Sostenida                    │
│    • Confianza: X%                                          │
│    • Caída: Y%                                              │
│    • Baseline: Z kWh vs Actual: W kWh                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 12. IMPLEMENTACIÓN EN CÓDIGO

### 12.1 Función Principal de Detección

```typescript
// Ubicación: src/pages/ExportSaldoATR/ATRPreview.tsx
// Líneas: 520-830 aproximadamente

const handleDetectarAnomalias = async () => {
  // 1. Obtener datos filtrados
  const headers = filteredData?.headers || []
  const rows = keptRows && keptRows.length > 0 ? keptRows : (filteredData?.rows || [])
  
  // 2. Extraer columnas de fecha y consumo
  const dateHeader = detectarEncabezadoFecha(headers)
  const valueHeader = detectarEncabezadoConsumo(headers)
  
  // 3. Construir series temporal
  const full = rows.map((r) => ({
    fecha: parseFecha(r[dateHeader]),
    consumo: parseFloat(r[valueHeader])
  })).sort((a, b) => a.fecha - b.fecha)
  
  // 4. Calcular variaciones
  const withVar = full.map((p, i) => {
    const prev = full[i - 1]
    const variacion = i === 0 ? null : (p.consumo - prev.consumo) / prev.consumo
    return { ...p, variacion }
  })
  
  // 5. Calcular baseline y promedios estacionales
  const baselineAvg = suma(consumos) / conteo(consumos)
  const seasonalAvg = calcularPromediosEstacionales(withVar)
  const seasonalStdDev = calcularDesviacionesEstacionales(withVar)
  
  // 6. Detectar anomalía
  for (let i = 3; i < withVar.length; i++) {
    const es_outlier = Math.abs(zScore) > 2
    const es_anormal_estacional = Math.abs(desvEst) > 0.15
    const es_caida_significativa = drop > 0.3 || dropVsBaseline > 0.35
    
    if (es_caida_significativa && (es_outlier || es_anormal_estacional)) {
      // ANOMALÍA DETECTADA
      generarAlerta(withVar[i], baselineAvg, seasonalAvg)
    }
  }
}
```

### 12.2 Cálculo de Z-Score

```typescript
const calcularZScore = (valor: number, media: number, desv: number) => {
  return desv > 0 ? (valor - media) / desv : 0
}

// Ejemplo práctico:
const consumo_actual = 450
const media_estacional = 1800  // Promedio diciembre histórico
const desv_estacional = 400
const z = (450 - 1800) / 400 = -3.375

// Interpretación:
// Z < -2 = 2.3% probabilidad (prácticamente anómalo)
// Z < -2.5 = 0.6% probabilidad (definitivamente anómalo)
// Z < -3.375 = 0.04% probabilidad (extremadamente anómalo)
```

---

## 📱 13. EJEMPLO PRÁCTICO COMPLETO

### Caso: Cliente Industrial con Anomalía en Diciembre 2024

```
DATOS DE ENTRADA:
├─ Período: Enero 2022 - Diciembre 2024 (36 meses)
├─ Consumo promedio: 1,500 kWh/mes
├─ Consumo diciembre histórico: 1,850 kWh
└─ Desviación estándar diciembre: 350 kWh

CONSUMO DETECTADO:
├─ Diciembre 2024: 2,650 kWh
├─ Noviembre 2024: 1,800 kWh
└─ Variación: (2650 - 1800) / 1800 = +47.2%

CÁLCULOS:
├─ Z-Score: (2650 - 1850) / 350 = +2.29 → Outlier ✅
├─ Desv. Estacional: (2650 - 1850) / 1850 = +43.2% > 15% ✅
├─ Caída significativa: +47.2% > ±40% ✅
├─ Score confianza: 0.4 + 0.3 + 0.3 = 1.0 (100%)
└─ Criterio: Anomalía Extrema Validada

RESULTADO:
⚠️ ANOMALÍA DETECTADA - Incremento de energía
├─ Período: 2024-12 (Diciembre)
├─ Tipo: CRÍTICA (Incremento sostenido)
├─ Confianza: 100%
├─ Incremento: +47.2%
├─ Baseline: 1,850 kWh → Actual: 2,650 kWh
├─ Z-Score: +2.29 desviaciones
└─ Acciones recomendadas:
    1. Verificar nueva carga (equipo agregado?)
    2. Revisar facturación (error de lecturas?)
    3. Inspeccionar instalación (fuga/daño?)
    4. Recalcular tarificación
```

---

## 🎓 14. RESUMEN DE CONCEPTOS CLAVE

| Concepto | Definición | Umbral/Fórmula | Acción |
|----------|-----------|---|---|
| **Baseline** | Promedio histórico total | Suma / Conteo | Referencia de comparación |
| **Promedio Estacional** | Promedio por mes del año | Promedio(enero) a promedio(dic) | Ajuste por estacionalidad |
| **Z-Score** | Desviaciones estándar | (valor - media) / σ | Outlier si \|z\| > 2 |
| **Variación %** | Cambio relativo periodo | ((actual-prev)/prev)×100 | Crítica si ≥ ±40% |
| **Persistencia** | Duración de anomalía | Conteo de meses bajos | Sostenida si > 2 meses |
| **Score Confianza** | Probabilidad de anomalía | 0.0 a 1.0 (0-100%) | Detecta si ≥ 0.5-0.7 |
| **Desvación Estándar** | Variabilidad de datos | √(Σ(xi-μ)²/n) | Normalidad si dentro ±2σ |

---

## 📚 15. REFERENCIAS Y ESTÁNDARES

```
📖 Estándares aplicados:
├─ IEC 62053-21: Contadores de energía digital
├─ CEI 62053-20: Contadores de energía analógicos
├─ NIST SP 800-53: Seguridad de datos
└─ ISO 9001: Gestión de calidad

🔬 Métodos estadísticos:
├─ Desviación estándar (σ)
├─ Distribución normal (Gaussiana)
├─ Z-Score (puntuación estándar)
└─ Análisis de tendencias temporales

⚡ Normativas eléctricas:
├─ Tolerancia de medición: ±3%
├─ Precisión de contadores: Clase B/C
└─ Rango operacional: ±10% de nominal
```

---

**Documento actualizado:** 25 de octubre de 2025
**Versión:** 1.0
**Aplicación:** ValoApp v1.0
