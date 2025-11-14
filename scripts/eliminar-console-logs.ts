#!/usr/bin/env ts-node
/**
 * Script para eliminar console statements de archivos
 * EXCEPTO en loggerService.ts y archivos de test
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { relative } from 'path';

interface ArchivoModificado {
  archivo: string;
  lineasEliminadas: number;
  lineasOriginales: number;
  lineasFinales: number;
}

const ARCHIVOS_EXCLUIDOS = [
  'loggerService.ts',
  '.test.ts',
  '.test.tsx',
  '.spec.ts',
  '.spec.tsx',
];

const resultados = JSON.parse(
  readFileSync('auditoria-resultados.json', 'utf-8')
);

const archivosModificados: ArchivoModificado[] = [];
let totalLineasEliminadas = 0;

// Procesar cada console.log detectado
const consoleLogs = resultados.detalles.consoleLogs;

// Agrupar por archivo
const porArchivo = consoleLogs.reduce((acc: any, item: any) => {
  if (!acc[item.archivo]) {
    acc[item.archivo] = [];
  }
  acc[item.archivo].push(item);
  return acc;
}, {});

console.log('🧹 Iniciando limpieza de console statements...\n');

Object.keys(porArchivo).forEach((archivoRelativo) => {
  // Verificar si está excluido
  if (ARCHIVOS_EXCLUIDOS.some((excluido) => archivoRelativo.includes(excluido))) {
    console.log(`⏭️  Saltando ${archivoRelativo} (excluido)`);
    return;
  }

  const items = porArchivo[archivoRelativo];
  const contenido = readFileSync(archivoRelativo, 'utf-8');
  const lineas = contenido.split('\n');
  const lineasOriginales = lineas.length;

  // Ordenar por línea (descendente) para eliminar de abajo hacia arriba
  const lineasAEliminar = items
    .map((item: any) => item.linea - 1) // Convertir a índice 0-based
    .sort((a: number, b: number) => b - a);

  let lineasEliminadas = 0;

  lineasAEliminar.forEach((indice: number) => {
    const linea = lineas[indice];
    
    // Verificar que realmente contiene console
    if (linea && /console\.(log|error|warn|debug|info|trace|table|group)/.test(linea)) {
      // Si la línea SOLO contiene console (espacios + console), eliminar completamente
      if (linea.trim().match(/^console\./)) {
        lineas.splice(indice, 1);
        lineasEliminadas++;
      } else {
        // Si console está en medio de código, comentar la línea
        lineas[indice] = linea.replace(
          /console\.(log|error|warn|debug|info|trace|table|group)/g,
          '// console.$1 [ELIMINADO]'
        );
      }
    }
  });

  if (lineasEliminadas > 0) {
    const nuevoContenido = lineas.join('\n');
    writeFileSync(archivoRelativo, nuevoContenido, 'utf-8');

    archivosModificados.push({
      archivo: archivoRelativo,
      lineasEliminadas,
      lineasOriginales,
      lineasFinales: lineas.length,
    });

    totalLineasEliminadas += lineasEliminadas;

    console.log(`✅ ${archivoRelativo}`);
    console.log(`   Líneas eliminadas: ${lineasEliminadas}`);
  }
});

console.log('\n' + '='.repeat(70));
console.log('📊 RESUMEN DE LIMPIEZA');
console.log('='.repeat(70));
console.log(`\n✅ Archivos modificados: ${archivosModificados.length}`);
console.log(`🗑️  Líneas eliminadas: ${totalLineasEliminadas}`);

if (archivosModificados.length > 0) {
  console.log('\n📋 Archivos procesados:');
  archivosModificados
    .sort((a, b) => b.lineasEliminadas - a.lineasEliminadas)
    .forEach((archivo) => {
      console.log(
        `   ${archivo.archivo.padEnd(60)} - ${archivo.lineasEliminadas} líneas`
      );
    });
}

console.log('\n' + '='.repeat(70));
console.log('✅ Limpieza completada');
console.log('='.repeat(70));
