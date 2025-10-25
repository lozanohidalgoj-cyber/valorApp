# 🎯 Guía de Uso: Detección de Anomalías por Consumo Nulo

**Versión:** 1.0  
**Fecha:** 25 de octubre de 2025  
**Aplicación:** ValoApp - Módulo de Análisis de Anomalías ATR

---

## 📌 Introducción

A partir de esta versión, el sistema detecta automáticamente **anomalías por consumo nulo sostenido** (fraude/avería severa). Esta guía te explica cómo funciona y qué significan los resultados.

---

## 🔍 ¿Qué es una Anomalía de Consumo Nulo?

### Definición
```
Período consecutivo de 2 o más meses con consumo ≤1 kWh
mientras el cliente tenía consumo normal anteriormente
```

### Ejemplos Reales

**Caso 1: Fraude Total**
```
Noviembre 2023: 1,500 kWh ← Normal
Diciembre 2023: 0 kWh     ← Inicio
Enero 2024:    0 kWh     ← Persiste
Febrero 2024:  0 kWh     ← Persiste
Marzo 2024:    1,450 kWh ← Recuperación

⚠️ RESULTADO: ANOMALÍA DETECTADA
   Tipo: Consumo nulo sostenido (3 meses)
   Confianza: 95%
```

**Caso 2: Avería del Medidor**
```
Junio 2023:    850 kWh   ← Normal
Julio 2023:    0 kWh     ← Falla
Agosto 2023:   0 kWh     ← Persiste
Septiembre:    0 kWh     ← Persiste
Octubre 2023:  5 kWh     ← Recuperación incompleta

⚠️ RESULTADO: ANOMALÍA DETECTADA
   Tipo: Consumo nulo sostenido (4 meses)
   Confianza: 95%
```

**Caso 3: Desconexión No Registrada**
```
Febrero 2024:  1,200 kWh ← Normal
Marzo 2024:    0 kWh     ← Corte
Abril 2024:    0 kWh     ← Persiste
Mayo 2024:     1,300 kWh ← Reconexión

✅ RESULTADO: ANOMALÍA DETECTADA
   Tipo: Consumo nulo sostenido (2 meses)
   Confianza: 95%
```

---

## 🚀 Cómo Usar

### Paso 1: Cargar Datos ATR

1. Ve a **"Export Saldo ATR"**
2. Carga tu archivo CSV/Excel con datos de consumo
3. El archivo debe incluir:
   - ✅ Columna de fecha (Fecha desde/hasta, Período, etc.)
   - ✅ Columna de consumo activo (en kWh)

### Paso 2: Ejecutar Análisis

1. Haz clic en **"Detectar anomalías de consumo"** (botón azul)
2. El sistema analizará automáticamente:
   - ✅ Consumos nulos sostenidos (NUEVO - Criterio 0)
   - ✅ Caídas extremas validadas (Criterio 1)
   - ✅ Consumos críticamente bajos (Criterio 2)
   - ✅ Tendencias sostenidas (Criterio 3)

### Paso 3: Revisar Resultados

#### Caso A: SIN ANOMALÍAS
```
Recibirás un mensaje como:

✅ ANÁLISIS COMPLETADO - SIN ANOMALÍAS DETECTADAS

📊 RESUMEN DEL ANÁLISIS:
• Período analizado: 48 meses
• Rango: 2021-01 → 2025-12
• Meses analizados: 48
• Promedio histórico: 1,250 kWh

🔍 VALIDACIONES REALIZADAS:
✓ Análisis estadístico (Z-Score)
✓ Detección de outliers
✓ Validación estacional
✓ Análisis de tendencias
✓ Detección de persistencia

📈 CONCLUSIÓN:
El comportamiento del consumo es ESTABLE
```

#### Caso B: ANOMALÍA DETECTADA
```
Recibirás un mensaje como:

⚠️ Anomalía detectada con alta precisión

📅 Período: 2022-02
🎯 Criterio: Consumo nulo sostenido (8 meses consecutivos)
📊 Confianza: 95.0%
📉 Caída: 100.0%
📈 Baseline: 1,752 kWh → Actual: 0 kWh
🔢 Desviaciones estándar: 999
⏱️ Persistencia: 8 meses
```

---

## 📊 Interpretación de Resultados

### Campos Clave

| Campo | Significado | Rango |
|-------|------------|-------|
| **Período** | Año-Mes de inicio de la anomalía | YYYY-MM |
| **Criterio** | Tipo de anomalía detectada | Texto descriptivo |
| **Confianza** | Probabilidad de que sea real | 0-100% |
| **Caída** | Descenso de consumo | 0-100% |
| **Baseline** | Consumo esperado | kWh |
| **Actual** | Consumo medido | kWh |
| **Desv. Est.** | Desviaciones estándar | Número |
| **Persistencia** | Meses que persiste | 2+ meses |

### Niveles de Confianza

```
50-69%  = 🟡 REVISAR
         Requiere validación manual
         Podría ser variación estacional
         
70-89%  = 🟠 PROBABLE  
         Muy probable que sea anomalía
         Se recomienda investigar
         
90-100% = 🔴 CRÍTICA
         Prácticamente confirmada
         Requerida acción inmediata
```

### Criterios de Anomalía

```
Criterio 0: CONSUMO NULO SOSTENIDO ← NUEVO
├─ Detección: 2+ meses consecutivos con ≤1 kWh
├─ Confianza: 95% (muy alta)
├─ Acción: Inspeccionar medidor o investigar corte

Criterio 1: CAÍDA EXTREMA VALIDADA
├─ Detección: ≥60% de caída vs mes anterior
├─ Confianza: ≥70%
├─ Acción: Verificar cambios de carga

Criterio 2: CONSUMO CRÍTICAMENTE BAJO
├─ Detección: <40% promedio 3m anteriores
├─ Confianza: ≥60%
├─ Acción: Revisar mediciones

Criterio 3: TENDENCIA SOSTENIDA
├─ Detección: Baja por 2-3 meses sin recuperación
├─ Confianza: ≥50-95%
├─ Acción: Análisis temporal prolongado
```

---

## 🎓 Ejemplos de Interpretación

### Ejemplo 1: Cliente Industrial con Consumo Nulo

```
Datos cargados:
├─ Período: 01/01/2020 - 31/12/2024 (60 meses)
├─ Consumo promedio: 2,500 kWh/mes
└─ Anomalía detectada en mes 8 (Agosto 2020)

RESULTADO:
⚠️ Anomalía detectada con alta precisión

📅 Período: 2020-08
🎯 Criterio: Consumo nulo sostenido (5 meses consecutivos)
📊 Confianza: 95.0%
📉 Caída: 100.0%
📈 Baseline: 2,550 kWh → Actual: 0 kWh
⏱️ Persistencia: 5 meses

INTERPRETACIÓN:
❌ Consume 0 kWh durante 5 meses seguidos
❌ Anterior: 2,550 kWh (consumo normal)
❌ Posterior: Recuperación lenta o gradual

ACCIONES RECOMENDADAS:
1. ✔️ Verificar estado del medidor (corte/avería)
2. ✔️ Revisar actas de inspección (Aug-Dec 2020)
3. ✔️ Revisar historial de cambios de titular
4. ✔️ Si es fraude: iniciar procedimiento de investigación
5. ✔️ Si es avería: registrar en mantenimiento
```

### Ejemplo 2: Residencial con Variación Normal

```
Datos cargados:
├─ Período: 01/01/2023 - 30/06/2025 (30 meses)
├─ Consumo promedio: 350 kWh/mes
└─ Datos consistentes, sin ceros

RESULTADO:
✅ ANÁLISIS COMPLETADO - SIN ANOMALÍAS DETECTADAS

📊 RESUMEN DEL ANÁLISIS:
• Período analizado: 30 meses
• Rango: 2023-01 → 2025-06
• Meses analizados: 30
• Promedio histórico: 345 kWh

🔍 VALIDACIONES REALIZADAS:
✓ Análisis estadístico (Z-Score)
✓ Detección de outliers
✓ Validación estacional
✓ Análisis de tendencias
✓ Detección de persistencia

📈 CONCLUSIÓN:
El comportamiento del consumo es ESTABLE

INTERPRETACIÓN:
✅ No hay anomalías detectadas
✅ Consumo dentro de rangos normales
✅ Variaciones consistentes con estacionalidad
✅ Recomendación: Seguimiento rutinario
```

---

## 🔧 Casos Especiales

### Caso 1: Un Mes Nulo (NO detecta)
```
Septiembre 2024: 1,200 kWh ← Normal
Octubre 2024: 0 kWh        ← Nulo
Noviembre 2024: 1,150 kWh  ← Vuelve a normal

RESULTADO: ✅ NO DETECTA (requiere 2+ meses)
RAZÓN: Podría ser error de lectura puntual
```

### Caso 2: Dos Meses Nulos (SÍ detecta)
```
Octubre 2024: 1,200 kWh ← Normal
Noviembre 2024: 0 kWh   ← Nulo
Diciembre 2024: 0 kWh   ← Nulo (persistencia)
Enero 2025: 1,150 kWh   ← Vuelve

RESULTADO: ⚠️ DETECTA (2 meses = anomalía)
CONFIANZA: 95%
```

### Caso 3: Recuperación Lenta (SÍ detecta)
```
Febrero 2024: 1,500 kWh ← Normal
Marzo 2024: 0 kWh       ← Nulo
Abril 2024: 0 kWh       ← Nulo
Mayo 2024: 100 kWh      ← Recuperación débil
Junio 2024: 1,400 kWh   ← Recuperación completa

RESULTADO: ⚠️ DETECTA (persistencia de nulo + recuperación lenta)
```

---

## 📋 Checklist de Validación

Antes de reportar una anomalía, verifica:

```
□ ¿La anomalía persiste 2+ meses?
□ ¿El consumo anterior era normal (>100 kWh)?
□ ¿Hay cambios de contador en el período?
□ ¿Hay cambios de titular en el período?
□ ¿La confianza es ≥90%?
□ ¿La persistencia es visible en la tabla?
□ ¿Se correlaciona con actas de inspección?
```

---

## 🆘 Preguntas Frecuentes

### P: ¿Por qué no detecta 1 mes de 0 kWh?
**R:** Podría ser un error de lectura. Requerimos 2+ meses para confirmar anomalía.

### P: ¿Qué significa Z-Score = 999?
**R:** Es un valor extremo que indica desviación máxima (consumo = 0 vs esperado).

### P: ¿Puedo ignorar una anomalía con 95% de confianza?
**R:** NO. 95% significa que es prácticamente segura. Investigar de inmediato.

### P: ¿Qué hago si detecta por error?
**R:** Revisa:
- El período es correcto?
- Hay cambios de contador?
- Es de verdad 2+ meses de 0 kWh?

### P: ¿Dónde veo el histórico de anomalías?
**R:** Aparece resaltado en la tabla principal (fila amarilla).

---

## 🚀 Próximos Pasos

1. **Usar en Producción:** Analizar clientes problemáticos
2. **Recopilar Feedback:** Registrar casos reales
3. **Validar Precisión:** Comparar con inspecciones
4. **Iteración 2:** Detectar incrementos anómalos (>40%)

---

## 📞 Soporte

Para dudas sobre:
- **Detección de anomalías:** Ver `DETECCION_ANOMALIAS_CONSUMO.md`
- **Caso específico:** Ver `ANALISIS_CASO_ES0031101927321001MV0F.md`
- **Implementación técnica:** Ver `IMPLEMENTACION_CONSUMO_NULO.md`

---

**Última actualización:** 25/10/2025  
**Versión:** 1.0  
**Estado:** ✅ Activo
