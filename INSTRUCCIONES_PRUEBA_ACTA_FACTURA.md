# Instrucciones de Prueba - Validación Acta/Factura

## Descripción de la Feature
Sistema de validación que compara la fecha del acta (Fecha del Acta en módulo WART) con las facturas/registros de consumo cargados. Muestra una alerta visual centrada si:
1. **No hay facturas registradas** → Alerta roja (error)
2. **No hay facturas en el período del acta** → Alerta roja (error)  
3. **Última factura >30 días antes del acta** → Alerta naranja (warning)

## Casos de Prueba

### Setup Inicial
1. Abrir aplicación en `http://localhost:5173/#/export-saldo-atr`
2. Abrir Browser DevTools → Console (F12)
3. Copiar y ejecutar uno de los scripts de prueba abajo

### Caso 1: SIN FACTURAS (Error)
```javascript
// Limpiar datos anteriores
localStorage.removeItem('valorApp.analisis.atrCsv')
localStorage.removeItem('valorApp.wart.fechaActa')

// Crear fecha del acta (hoy)
const today = new Date().toISOString().split('T')[0]
localStorage.setItem('valorApp.wart.fechaActa', JSON.stringify(today))

// Recargar página
location.reload()

// Verificar: Debe mostrar alerta ROJA con mensaje:
// "⚠️ SIN FACTURAS REGISTRADAS"
```

**Resultado esperado:** Alerta roja centrada en pantalla con mensaje sobre sin facturas registradas.

---

### Caso 2: FACTURAS >30 DÍAS ANTES DEL ACTA (Warning)
```javascript
// Limpiar
localStorage.removeItem('valorApp.analisis.atrCsv')
localStorage.removeItem('valorApp.wart.fechaActa')

// Crear datos ATR: 1 factura hace 45 días
const today = new Date()
const facturaDate = new Date(today)
facturaDate.setDate(facturaDate.getDate() - 45)

// Formato CSV con fecha
const atrData = {
  headers: ['Contrato', 'Período', 'Consumo kWh', 'Fecha'],
  rows: [
    {
      'Contrato': 'ES0031101927321001MV0F',
      'Período': `${facturaDate.getFullYear()}-${String(facturaDate.getMonth() + 1).padStart(2, '0')}`,
      'Consumo kWh': '150',
      'Fecha': facturaDate.toLocaleDateString('es-ES')
    }
  ]
}

localStorage.setItem('valorApp.analisis.atrCsv', JSON.stringify(atrData))

// Fecha del acta: HOY
localStorage.setItem('valorApp.wart.fechaActa', JSON.stringify(today.toISOString().split('T')[0]))

// Recargar
location.reload()

// Verificar: Debe mostrar alerta NARANJA (warning) con mensaje:
// "⚠️ FACTURACIÓN VENCIDA" + "45 días de diferencia"
```

**Resultado esperado:** Alerta naranja centrada en pantalla indicando facturación vencida con 45 días de diferencia.

---

### Caso 3: FACTURAS DENTRO DE 30 DÍAS (Sin Alerta)
```javascript
// Limpiar
localStorage.removeItem('valorApp.analisis.atrCsv')
localStorage.removeItem('valorApp.wart.fechaActa')

// Crear datos ATR: 1 factura hace 10 días
const today = new Date()
const facturaDate = new Date(today)
facturaDate.setDate(facturaDate.getDate() - 10)

const atrData = {
  headers: ['Contrato', 'Período', 'Consumo kWh', 'Fecha'],
  rows: [
    {
      'Contrato': 'ES0031101927321001MV0F',
      'Período': `${facturaDate.getFullYear()}-${String(facturaDate.getMonth() + 1).padStart(2, '0')}`,
      'Consumo kWh': '150',
      'Fecha': facturaDate.toLocaleDateString('es-ES')
    }
  ]
}

localStorage.setItem('valorApp.analisis.atrCsv', JSON.stringify(atrData))

// Fecha del acta: HOY
localStorage.setItem('valorApp.wart.fechaActa', JSON.stringify(today.toISOString().split('T')[0]))

// Recargar
location.reload()

// Verificar: NO debe mostrar alerta (válido)
```

**Resultado esperado:** No aparece alerta. Sistema considera las facturas como válidas (dentro de 30 días).

---

### Caso 4: NO HAY FACTURAS EN EL PERÍODO DEL ACTA (Error)
```javascript
// Limpiar
localStorage.removeItem('valorApp.analisis.atrCsv')
localStorage.removeItem('valorApp.wart.fechaActa')

// Crear datos ATR: 1 factura de hace 90 días (mes anterior)
const today = new Date()
const facturaDate = new Date(today)
facturaDate.setMonth(facturaDate.getMonth() - 3) // 3 meses atrás

const atrData = {
  headers: ['Contrato', 'Período', 'Consumo kWh', 'Fecha Desde'],
  rows: [
    {
      'Contrato': 'ES0031101927321001MV0F',
      'Período': `${facturaDate.getFullYear()}-${String(facturaDate.getMonth() + 1).padStart(2, '0')}`,
      'Consumo kWh': '150',
      'Fecha Desde': facturaDate.toLocaleDateString('es-ES')
    }
  ]
}

localStorage.setItem('valorApp.analisis.atrCsv', JSON.stringify(atrData))

// Fecha del acta: HOY (mes diferente del mes de la factura)
localStorage.setItem('valorApp.wart.fechaActa', JSON.stringify(today.toISOString().split('T')[0]))

// Recargar
location.reload()

// Verificar: Debe mostrar alerta ROJA con mensaje:
// "⚠️ SIN FACTURAS EN EL PERÍODO"
```

**Resultado esperado:** Alerta roja centrada indicando que no hay facturas en el período del acta.

---

## Checklist de Validación

- [ ] Caso 1: Alerta roja aparece cuando no hay facturas
- [ ] Caso 2: Alerta naranja aparece cuando >30 días
- [ ] Caso 3: Sin alerta cuando está dentro de 30 días
- [ ] Caso 4: Alerta roja cuando no hay facturas en el período
- [ ] Modal está centrado en pantalla
- [ ] Botón X cierra el modal
- [ ] La alerta desaparece al cambiar los datos
- [ ] Console log muestra "⚠️ Acta/Factura validation alert:" con información correcta

## Validación de Estilos

- [ ] Alerta roja (error): Background `#ef4444`, border rojo oscuro
- [ ] Alerta naranja (warning): Background `#f97316`, border naranja oscuro
- [ ] Overlay oscuro con blur detrás del modal
- [ ] Modal animación slideUp + fadeIn (0.3s)
- [ ] Iconos mostrados: ⚠️ para warning/error, ℹ️ para info
- [ ] Responsive en mobile (95% ancho, máx 600px desktop)

## Notas de Debugging

Si la alerta no aparece:
1. Verificar Console → buscar "Acta/Factura validation alert:"
2. Verificar en DevTools → Check localStorage keys:
   - `valorApp.wart.fechaActa`
   - `valorApp.analisis.atrCsv`
3. Verificar Network → React está renderizando sin errores
4. Verificar que `monthlySeries` tiene datos (Console → React DevTools)

## Archivos Modificados
- `src/pages/ExportSaldoATR/ATRPreview.tsx` - Integración del hook y modal
- `src/hooks/business/useActaFacturaValidation.ts` - Hook de validación
- `src/components/ui/ActaFacturaAlertModal/ActaFacturaAlertModal.tsx` - Componente modal
