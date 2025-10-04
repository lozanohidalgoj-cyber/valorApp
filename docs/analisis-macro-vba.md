# Análisis integral de macros VBA (Análisis de Expedientes)

Este documento describe, de forma exhaustiva, el flujo de trabajo implementado por el archivo `macro.vb` (más de 2.000 líneas) asociado al libro Excel de “Análisis de Expedientes”. Se detallan objetivos, entradas/salidas, celdas y hojas implicadas, fórmulas, filtros, acciones sobre archivos (PDF/guardado), y dependencias entre módulos. Al final se incluye una lista de insumos requeridos y dudas abiertas para la migración a la aplicación web.

Notas de lectura:
- Referencias R1C1 (RC) de Excel: RC19 hace referencia a la columna 19 (S), R2C5 es celda E2, etc.
- Rango de trabajo típico: filas 1–200 (cabeceras alrededor de fila 1–4 y datos 5–200).
- Hojas mencionadas: "Entrada datos", "Valoración", "Resumen", "Suma", "Vista por años", "Listado", "Comentario".
- Se observan operaciones de AutoFilter, AutoFill, SUBTOTAL, INDEX, TODAY, y RefreshAll, además de copias, pegados y formateos.

## Hoja y celdas clave (mapa rápido)
- Área de datos principal: `A5:S200`.
- Cabeceras y totales en fila 1–4; varias celdas de control en la fila 2:
  - `C2, E2, F2, H2`: se limpian/usan como totales o control.
  - `D2`: fecha del día (`=TODAY()`).
  - `J2:K2`, `L2:M2`: `SUBTOTAL(109, …)` para totales.
  - `G2`: referencia a otra hoja: `=Listado!R[28]C[22]` (según macro).
- Columna S (19): tipo de valoración asignada masivamente: "Tipo V", "TV DH" (Tipo V horario), "Tipo IV".
- Columnas M–R (13–18): resultados de valoración desglosados en porcentajes distintos según el tipo.

## Descripción por macro (Sub)

### 1) AhoraLimpiar
Objetivo: "Limpia la hoja para realizar una nueva valoración."

Acciones principales:
- Limpia contenidos en `C2, E2, F2, H2`.
- `G2 = Listado!R[28]C[22]`.
- Replica datos desde "Entrada datos" en fila 5 (`A5:D5`), con AutoFill hasta columnas indicadas.
- `E5 = RC[-1] - RC[-2]` (diferencia entre columnas D y C).
- `F5 = IF(RC[-2]<=R2C3, "no procede", "Refacturar")` (marca si procede refacturación respecto a `C2`).
- Rellena `G5:L5` desde "Entrada datos" y auto-rellena hasta `A5:S200`.
- `S5 = "Tipo V"` y AutoFill hasta `S200`.
- Limpia `M5:R200` (resultados previos).
- Totales: `L2:M2 = SUBTOTAL(109, R[3]C[1]:R[198]C[6])`, `J2:K2 = SUBTOTAL(109, R[3]C[-3]:R[198]C[2])`.
- `D2 = TODAY()`.
- AutoFilter sobre Field 6 (columna F), y `RefreshAll`.

Entradas y dependencias:
- Hoja "Entrada datos" (origen), hoja "Listado".
- C2 (umbral para comparar en F5).

Salidas/efectos:
- Hoja preparada con tipos por defecto (Tipo V) y datos base extendidos hasta fila 200.

---

### 2) Guardar_PDF
Objetivo: exportar la hoja "Resumen" a PDF.

Acciones:
- Copia hoja "Resumen" y exporta a `C:\AD Expedientes\Análisis de consumos.pdf` (abre tras publicar).

Dependencias:
- Ruta de carpeta debe existir y tener permisos.

---

### 3) ImprimirListado
Objetivo: preparar un listado para imprimir en una hoja.

Acciones:
- Autofiltro `D1:D200` para no vacíos; imprime 1 copia a color.

---

### 4) MetodoCerrarLibrosinGuardarCambios
- Cierra el libro activo sin guardar.

---

### 5) Cambiar_inicio_mes
Objetivo: alternar el “inicio de mes” (parece pre/post cálculo mensual) mostrando hoja auxiliar.

Acciones:
- `Suma` visible; en `Suma!AT2 = YEAR(RC[-40])`, `AU2 = TEXT(RC[-41], "mmmm")`; AutoFill hasta fila 200.
- Oculta `Suma`, muestra "Vista por años"; `RefreshAll`.

Dependencias:
- Hojas "Suma" y "Vista por años"; columnas de referencia 40–41 a la izquierda de AT/AU.

---

### 6) Volver_atras_macro_anterior
Objetivo: revertir a la situación anterior del punto 5.

Acciones:
- Similar a la anterior pero con offsets `-41` y `-42`.

---

### 7) Campaña_Proactivo
Objetivo: generar PDF para campaña proactiva.

Acciones:
- Usa `archivo = Range("D2")` y `ano = Range("F1")` para construir nombre en `C:\AD Expedientes\Campaña Proactiva\…` y exporta a PDF.

---

### 8) Guardar_Libro_Como
Objetivo: guardar el libro con nombre estandarizado.

Acciones:
- Construye nombre con `A201` y `A202` (incluye texto "Póliza ATR nº").
- `SaveAs *.xlsm`, guarda y cierra.

Dependencias:
- Celdas `A201`, `A202`, carpeta destino.

---

### 9) Imprimir_Resumen
- Imprime la hoja actual (normalmente "Resumen").

---

### 10) AhoraValidarPeriodo
Objetivo: validar período y localizar refacturaciones.

Acciones:
- En "Entrada datos": escribe `SUBTOTAL` en `AH2:AM200` referenciando "Valoración".
- En "Valoración": `D2 = SUBTOTAL(4, R[3]C:R[198]C)` (conteo); aplica AutoFilter en Field 6 = "Refacturar".
- Copia `C2` a `E2`. `RefreshAll`.

---

### 11) Sumar_P2
Objetivo: sumarizar y limpiar columnas auxiliares.

Acciones:
- Copia `V5:V200` a `W5` (valores); limpia `G5:I200`.
- Copia `W5:W200` en `H5`; limpia `W5:W200`.
- Oculta columnas `V:W`.

---

### 12) CopiarComentario
Objetivo: copiar comentario para pegar en SCE.

Acciones:
- Copia `AA1:AA20` y vuelve al inicio (variación de navegación).

---

### 13) Realizar_Simulación_Enofa_2
Objetivo: preparar simulación de refacturación (Enofa) con constante.

Acciones:
- Formato y limpieza `K3:K200`; valida lista "Simular" en K3:K200.
- Fórmulas de simulación: en `AB3 = IF(K="Simular", RC[-12]*R1C17 - RC[-12], "")`, se auto-rellena hasta `AG3:AG200`.
- Encabezado y constantes: `P1="Constante:", Q1=valor`; sección Enofa: `S1="Enofa -", T1 = SUM(AB5:AG200)`, `U1="kWh."` (formateos incluidos).

Dependencias:
- Celda de constante en Q1 (usada en fórmulas), columna K como disparador de simulación.

---

### 14) AhoraFR (cálculo por tipo con restas de energía facturada)
Objetivo: calcular módulos M–R según el tipo en S (RC19) con distintos porcentajes.

Acciones:
- Fórmulas en `M5:R5`:
  - Para "TV DH": porcentajes 58.33%, 41.67%, 4.83%, 14.5%, 9.67% aplicados a `R2C5*R2C6*RC5 - RC[-6]` (resta de energía facturada en distintas columnas).
  - Para "Tipo IV": porcentajes 11.83%, 35.5%, 23.67%, 4.83%, 14.5%, 9.67% sobre la misma base con restas.
  - Para "Tipo V": generalmente vacío en algunas columnas o cálculo distinto (según fórmula exacta de cada col.).
- AutoFill hasta `M5:R200`. `RefreshAll`.

Observaciones:
- `R2C5` y `R2C6` son factores globales (E2 y F2), `RC5` es columna E por fila (potencia o energía de base), `RC[-6]` resta energía facturada previa.

---

### 15) AhoraDA (cálculo directo, sin restas en algunos casos)
Objetivo: similar a FR, pero en ciertas columnas no se resta `RC[-6]`.

Acciones:
- Fórmulas en `M5:R5` con base `R2C5*R2C6*RC5` (para algunos tipos sin restar facturado).
- AutoFill `M5:R200`. `RefreshAll`.

---

### 16) ValidarFechas (duplicada)
Objetivo: limpiar filas "no procede" y recalcular índices.

Acciones (resumen):
- En "Entrada datos": `SUBTOTAL` en `AH3:AM200`; filtro Field 6 = "no procede" y borra filas `5:200` (deja cabeceras); quita filtro.
- Reajusta fórmulas de `INDEX` en `C5` y `D2` para localizar últimas entradas no vacías.

Efecto:
- Depura datos previos a la valoración.

---

### 17) AhoraTipoV / AhoraTipoVDH / AhoraTipoIV
Objetivo: asignar masivamente el tipo de valoración.

Acciones:
- Escribe `"Tipo V"` o `"TV DH"` o `"Tipo IV"` en `S5` y rellena hasta `S200`.
- `RefreshAll`.

---

### 18) AhoraValorarCMD
Objetivo: valoración por constante (variante CMD) con restas/refinamientos y distintas referencias (R2C7, R[-3]C7...).

Acciones:
- Fórmulas en `M5:R5` usan como base `R2C7` (G2) o `R[-3]C7` (columna G de 3 filas arriba) multiplicado por `RC5` y porcentajes, restando `RC[-6]` según el tipo.
- AutoFill `M5:R200`. `RefreshAll`.

---

### 19) AhoraValorarCTE
Objetivo: valoración por constante restando la energía facturada por ciclo.

Acciones:
- Fórmulas en `M5:R5` del estilo `(R2C8*RC[-6]) - RC[-6]` según tipo.
- AutoFill `M5:R200`. `RefreshAll`.

---

### 20) ComplementarInformacion (macro personal)
Objetivo: combinar datos de dos libros externos mediante `VLookup`.

Acciones:
- Abre `Ruta_del_Archivo1.xlsx` y `Ruta_del_Archivo2.xlsx`.
- Para cada fila de `ws1`, busca valor de columna A en `ws2 A:B` y, si existe, copia el valor asociado en columna B.
- Guarda cambios en `wb1`, cierra `wb2` sin guardar, mensaje de finalización.

Dependencias:
- Rutas físicas y estructura A:B del segundo archivo para VLookup.

---

### 21) Copia_y_abre_hoja_análisis3 (duplicada en el archivo con ligeras variantes)
Objetivo: copiar la hoja actual a un libro objetivo y limpiar/filtrar contenidos.

Acciones:
- Copia todas las celdas; abre `C:\ADExpedientes\Análisis de Expedientes.xlsm` (variantes con `C:\AD_Expedientes`).
- Pega en `A1`; elimina shape "Rounded Rectangle 10".
- Aplica filtros en rangos (por ejemplo `F:`, criterios múltiples como FRAUDE, S, A, SUSTITUIDA) y limpia contenidos.
- Ordena por `G2:G200` ascendente y aplica orden global a `A1:AS200`.
- `RefreshAll` y navega a "Vista por años".

Dependencias:
- Rutas de destino y shape existente.

---

### 22) Abre_Informe
Objetivo: volcar contenido al libro "Informe DGE - Definitivo (Prueba).xlsm" y depurarlo.

Acciones:
- Abre el libro destino; pega todo; aplica filtros (ej. en columna 27 "#¡VALOR!"); limpia contenidos; aplica filtros/ordenaciones; vuelve a "Vista por años"; `RefreshAll`.

---

### 23) Copia_y_abre_hoja_Análisis
Objetivo: variante de copiado al libro de análisis con filtros y ordenaciones.

Acciones:
- Copia todo, abre `C:\AD Expedientes\Análisis de Expedientes.xlsm`, pega; filtra `F` por "S" y `E` por "FRAUDE" y limpia; ordena `G3:G151` ascendente y aplica rango `A2:AS151`.
- `RefreshAll` y navega a "Vista por años".

---

## Flujo probable de uso (resumen)
1) Preparación: `AhoraLimpiar` para resetear hoja de trabajo y tipos por defecto.
2) Depuración: `ValidarFechas` / `AhoraValidarPeriodo` para borrar filas “no procede” y filtrar “Refacturar”.
3) Asignación de tipo: `AhoraTipoV` / `AhoraTipoVDH` / `AhoraTipoIV`.
4) Valoración:
   - Por FR/DA: `AhoraFR` o `AhoraDA` (porcentajes diferentes y restas).
   - Por constante: `AhoraValorarCMD` o `AhoraValorarCTE` (uso de G2/H2 y restas/constantes).
5) Simulación (opcional): `Realizar_Simulación_Enofa_2` con columna K="Simular" y constante en Q1.
6) Exportación/entrega: `Guardar_PDF`, `Imprimir_Resumen`, `Guardar_Libro_Como`, `Campaña_Proactivo`, o traspaso a otros libros (`Abre_Informe`, `Copia_y_abre_*`).

## Entradas/insumos necesarios
- Estructura de hojas y columnas:
  - Hojas: "Entrada datos", "Valoración", "Resumen", "Suma", "Vista por años", "Listado", "Comentario".
  - Rango de datos hasta fila 200; cabeceras y celdas clave (E2, F2, G2, H2, J2:K2, L2:M2, S5…)
  - Significado de columnas C, D, E… y de columnas M–R (segmentos de valoración por porcentaje).
- Constantes y parámetros globales:
  - `E2 (R2C5)`, `F2 (R2C6)`: factores de cálculo (¿tarifa? ¿kWh->€?).
  - `G2 (R2C7)`, `H2 (R2C8)`: constantes para CMD/CTE.
  - `Q1`: constante para simulación Enofa; `P1/Q1` etiqueta/valor.
- Tipologías de valoración:
  - Valores esperados en columna `S`: "Tipo V", "TV DH", "Tipo IV" y su semántica de negocio.
- Reglas de filtrado y estados:
  - Columna F produce "no procede" vs "Refacturar" (Umbral en `C2`).
  - Otros filtros: FRAUDE, A, S, SUSTITUIDA; campañas específicas.
- Rutas de archivos/salida:
  - `C:\AD Expedientes\…`, `C:\AD_Expedientes\…`, `C:\ADExpedientes\…` (unificar carpeta final en la app).
  - Libros externos: "Análisis de Expedientes.xlsm", "Informe DGE - Definitivo (Prueba).xlsm".
- Interoperabilidad:
  - `ComplementarInformacion` requiere dos rutas de archivos y estructura A:B en el segundo para VLookup.
- Elementos UI del Excel:
  - Shapes ("Rounded Rectangle 10"), validación de datos en `K3:K200`.

## Dudas y aclaraciones pendientes
1) Semántica exacta de factores `E2`, `F2`, `G2`, `H2` y `Q1`.
2) Definición funcional de tipos "Tipo V", "TV DH", "Tipo IV" (criterios de asignación y impacto real en costes/porcentajes).
3) Mapeo de columnas M–R: ¿qué representa cada columna (M, N, O, P, Q, R) en términos de negocio? (ej. periodos, tramos, conceptos).
4) Criterios de “no procede” vs “Refacturar”: confirmación del umbral (`C2`) y casos borde.
5) Límites de filas (200): ¿debe ser dinámico según datos reales?
6) Filtros adicionales (FRAUDE/A/S/SUSTITUIDA): ¿significados y reglas en pipeline?
7) Exportaciones: en app web, ¿qué PDF/reportes son obligatorios (Resumen/Listado/Campaña)?
8) Rutas y permisos: ¿ruta unificada para salidas? ¿nombres estándar? ¿se requiere integración con SCE?
9) Simulación Enofa: confirmar fórmula completa (relación con `R1C17`, `Q1`, etc.) y unidades (kWh/€).
10) Módulos duplicados (ValidarFechas y Copia_y_abre_hoja_análisis3): decidir versión canónica.
11) `ComplementarInformacion`: definir con precisión las columnas de búsqueda/resultado y el esquema real de ambos archivos.
12) Integración con nuestra app: ¿qué pasos del flujo serán automáticos al cargar el Excel integrado y cuáles quedarán bajo acciones del usuario (p. ej., elegir tipo en S)?

## Propuesta de migración a la app (alto nivel)
- Parser (existente) + motor de reglas:
  - Implementar servicios/funciones equivalentes a: Limpiar/Preparar, Validar (fechas/periodos), Asignar Tipo, Valorar (FR/DA/CMD/CTE), Simular Enofa, Exportar.
- UI:
  - Vista cruda (ya implementada) + vista tipada con KPIs y tabla.
  - Acciones discretas que repliquen cada macro, con estados y logs.
- Exportación:
  - Generación de PDF/CSV desde la app (definir plantillas).
- Persistencia:
  - Guardar constantes/tipos/umbrales en estado y en almacenamiento local/servidor.

---

Si confirmas este análisis, puedo crear una “tabla de mapeo” macro→servicio de app y empezar a portar las fórmulas/porcentajes exactos a TypeScript, además de un pipeline reproducible paso a paso.
