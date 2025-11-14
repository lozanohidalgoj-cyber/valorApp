#!/usr/bin/env ts-node
/**
 * Script mejorado para eliminar console statements
 * Solo elimina líneas que ÚNICAMENTE contienen console (con espacios/indentación)
 * Nunca elimina si console está en una expresión compleja
 */
import { readFileSync, writeFileSync } from 'fs';

const ARCHIVOS_EXCLUIDOS = ['loggerService.ts'];

const resultados = JSON.parse(readFileSync('auditoria-resultados.json', 'utf-8'));
const consoleLogs = resultados.detalles.consoleLogs;

// Agrupar por archivo
const porArchivo = consoleLogs.reduce((acc: any, item: any) => {
  if (!acc[item.archivo]) acc[item.archivo] = [];
  acc[item.archivo].push(item);
  return acc;
}, {});

let totalEliminadas = 0;

console.log('🧹 Eliminando console statements de forma segura...\n');

Object.keys(porArchivo).forEach((archivo) => {
  if (ARCHIVOS_EXCLUIDOS.some((ex) => archivo.includes(ex))) {
    console.log(`⏭️  Saltando ${archivo}`);
    return;
  }

  const items = porArchivo[archivo];
  const contenido = readFileSync(archivo, 'utf-8');
  const lineas = contenido.split('\n');
  
  let modificado = false;
  let eliminadas = 0;

  // Ordenar por línea descendente
  items
    .map((i: any) => i.linea - 1)
    .sort((a: number, b: number) => b - a)
    .forEach((indice: number) => {
      const linea = lineas[indice];
      if (!linea) return;

      const trimmed = linea.trim();
      
      // Reglas seguras para eliminación:
      // 1. Línea que solo tiene console.xxx(...)
      // 2. Línea que solo tiene console.group/groupEnd()
      // 3. NO eliminar si es parte de una función multilinea
      
      const esLineaSimple = 
        /^console\.(log|error|warn|info|debug|trace|table|group|groupEnd)\(/i.test(trimmed) &&
        trimmed.endsWith(';');
      
      const esGroupSimple = 
        /^console\.(group|groupEnd)\(\)/.test(trimmed);

      if (esLineaSimple || esGroupSimple) {
        lineas.splice(indice, 1);
        eliminadas++;
        modificado = true;
      }
    });

  if (modificado) {
    writeFileSync(archivo, lineas.join('\n'), 'utf-8');
    console.log(`✅ ${archivo} - ${eliminadas} líneas eliminadas`);
    totalEliminadas += eliminadas;
  }
});

console.log(`\n✅ Total eliminadas: ${totalEliminadas}`);
