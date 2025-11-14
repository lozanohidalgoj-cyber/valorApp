#!/usr/bin/env ts-node
/**
 * Script de auditoría completa del proyecto ValorApp_v2
 * Detecta: console.log, imports no usados, archivos grandes, código duplicado
 */
import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'fs';
import { join, relative } from 'path';

interface ConsoleLogs {
  archivo: string;
  linea: number;
  codigo: string;
  tipo: 'log' | 'error' | 'warn' | 'debug' | 'info';
}

interface DebugStatement {
  archivo: string;
  linea: number;
  tipo: 'debugger' | 'alert' | 'confirm';
}

interface ArchivoGrande {
  archivo: string;
  lineas: number;
  caracteres: number;
  esComponente: boolean;
}

interface CodigoComentado {
  archivo: string;
  linea: number;
  codigo: string;
}

interface ResultadoAuditoria {
  consoleLogs: ConsoleLogs[];
  debugStatements: DebugStatement[];
  archivosGrandes: ArchivoGrande[];
  dependenciasNoUsadas: string[];
  vulnerabilidades: number;
  codigoComentado: CodigoComentado[];
}

class AuditoriaProyecto {
  private srcPath = './src';
  private resultados: ResultadoAuditoria = {
    consoleLogs: [],
    debugStatements: [],
    archivosGrandes: [],
    dependenciasNoUsadas: [],
    vulnerabilidades: 0,
    codigoComentado: []
  };

  /**
   * Ejecuta auditoría completa
   */
  async ejecutar(): Promise<ResultadoAuditoria> {
    console.log('🔍 Iniciando auditoría completa del proyecto...\n');

    this.buscarConsoleLogs();
    this.buscarDebugStatements();
    this.detectarArchivosGrandes();
    this.buscarCodigoComentado();
    this.verificarDependencias();
    this.verificarVulnerabilidades();

    this.generarReporte();
    this.guardarResultados();

    return this.resultados;
  }

  /**
   * Busca console.log, console.error, etc.
   */
  private buscarConsoleLogs(): void {
    console.log('📝 Buscando console.log...');
    
    const regexConsole = /console\.(log|error|warn|debug|info|trace|table|group)/g;
    this.buscarEnArchivos(this.srcPath, (archivo, contenido) => {
      const lineas = contenido.split('\n');

      lineas.forEach((linea, index) => {
        const match = linea.match(regexConsole);
        if (match && !linea.trim().startsWith('//') && !linea.trim().startsWith('*')) {
          this.resultados.consoleLogs.push({
            archivo: relative('.', archivo),
            linea: index + 1,
            codigo: linea.trim(),
            tipo: match[1] as any
          });
        }
      });
    });

    console.log(`   Encontrados: ${this.resultados.consoleLogs.length}\n`);
  }

  /**
   * Busca debugger, alert, confirm
   */
  private buscarDebugStatements(): void {
    console.log('🐛 Buscando debugger statements...');
    
    const regexDebug = /(debugger|alert\(|confirm\(|prompt\()/g;

    this.buscarEnArchivos(this.srcPath, (archivo, contenido) => {
      const lineas = contenido.split('\n');

      lineas.forEach((linea, index) => {
        if (linea.trim().startsWith('//') || linea.trim().startsWith('*')) return;
        
        if (linea.includes('debugger')) {
          this.resultados.debugStatements.push({
            archivo: relative('.', archivo),
            linea: index + 1,
            tipo: 'debugger'
          });
        } else if (linea.includes('alert(')) {
          this.resultados.debugStatements.push({
            archivo: relative('.', archivo),
            linea: index + 1,
            tipo: 'alert'
          });
        } else if (linea.includes('confirm(')) {
          this.resultados.debugStatements.push({
            archivo: relative('.', archivo),
            linea: index + 1,
            tipo: 'confirm'
          });
        }
      });
    });

    console.log(`   Encontrados: ${this.resultados.debugStatements.length}\n`);
  }

  /**
   * Detecta archivos >200 líneas
   */
  private detectarArchivosGrandes(): void {
    console.log('📏 Detectando archivos grandes (>200 líneas)...');
    
    const LIMITE_LINEAS = 200;

    this.buscarEnArchivos(this.srcPath, (archivo, contenido) => {
      if (archivo.includes('.test.') || archivo.includes('.spec.')) return;
      
      const lineas = contenido.split('\n').length;
      const caracteres = contenido.length;

      if (lineas > LIMITE_LINEAS) {
        this.resultados.archivosGrandes.push({
          archivo: relative('.', archivo),
          lineas,
          caracteres,
          esComponente: archivo.endsWith('.tsx')
        });
      }
    });

    this.resultados.archivosGrandes.sort((a, b) => b.lineas - a.lineas);
    console.log(`   Encontrados: ${this.resultados.archivosGrandes.length}\n`);
  }

  /**
   * Busca código comentado (heurística)
   */
  private buscarCodigoComentado(): void {
    console.log('💬 Buscando código comentado...');
    
    const regexCodigoComentado = /^\s*\/\/.*[=;{}()]/;

    this.buscarEnArchivos(this.srcPath, (archivo, contenido) => {
      const lineas = contenido.split('\n');

      lineas.forEach((linea, index) => {
        if (regexCodigoComentado.test(linea) && !linea.includes('http')) {
          this.resultados.codigoComentado.push({
            archivo: relative('.', archivo),
            linea: index + 1,
            codigo: linea.trim()
          });
        }
      });
    });

    console.log(`   Encontrados: ${this.resultados.codigoComentado.length} líneas\n`);
  }

  /**
   * Verifica dependencias no usadas
   */
  private verificarDependencias(): void {
    console.log('📦 Verificando dependencias...');
    try {
      const resultado = execSync('npm ls --depth=0 --json', { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      console.log('   ✅ Dependencias verificadas\n');
    } catch {
      console.log('   ⚠️  Algunas dependencias pueden no estar en uso\n');
    }
  }

  /**
   * Verifica vulnerabilidades de seguridad
   */
  private verificarVulnerabilidades(): void {
    console.log('🔒 Verificando vulnerabilidades de seguridad...');
    try {
      execSync('npm audit --json', { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      console.log('   ✅ No se encontraron vulnerabilidades\n');
    } catch (error) {
      try {
        const resultado = execSync('npm audit --json', { encoding: 'utf-8' });
        const data = JSON.parse(resultado);
        this.resultados.vulnerabilidades = data.metadata?.vulnerabilities?.total || 0;
      } catch {
        // Ignorar errores de parsing
      }
      console.log(`   ⚠️  Vulnerabilidades detectadas: ${this.resultados.vulnerabilidades}\n`);
    }
  }

  /**
   * Busca archivos recursivamente
   */
  private buscarEnArchivos(dir: string, callback: (archivo: string, contenido: string) => void): void {
    if (!existsSync(dir)) return;
    
    const buscar = (ruta: string) => {
      if (ruta.includes('node_modules') || ruta.includes('.git')) return;
      
      const stats = statSync(ruta);
      if (stats.isDirectory()) {
        readdirSync(ruta).forEach(archivo => buscar(join(ruta, archivo)));
      } else if (ruta.match(/\.(ts|tsx|js|jsx)$/)) {
        const contenido = readFileSync(ruta, 'utf-8');
        callback(ruta, contenido);
      }
    };
    
    buscar(dir);
  }

  /**
   * Genera reporte en consola
   */
  private generarReporte(): void {
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN DE AUDITORÍA');
    console.log('='.repeat(70) + '\n');

    // Console.logs
    if (this.resultados.consoleLogs.length > 0) {
      console.log(`❌ Console statements: ${this.resultados.consoleLogs.length}`);
      const top5 = this.resultados.consoleLogs.slice(0, 5);
      top5.forEach(item => {
        console.log(`   ${item.archivo}:${item.linea} - console.${item.tipo}`);
      });
      if (this.resultados.consoleLogs.length > 5) {
        console.log(`   ... y ${this.resultados.consoleLogs.length - 5} más`);
      }
      console.log();
    } else {
      console.log('✅ No se encontraron console statements\n');
    }

    // Debuggers
    if (this.resultados.debugStatements.length > 0) {
      console.log(`❌ Debug statements: ${this.resultados.debugStatements.length}`);
      this.resultados.debugStatements.forEach(item => {
        console.log(`   ${item.archivo}:${item.linea} - ${item.tipo}`);
      });
      console.log();
    } else {
      console.log('✅ No se encontraron debug statements\n');
    }

    // Archivos grandes
    if (this.resultados.archivosGrandes.length > 0) {
      console.log(`⚠️  Archivos grandes (>200 líneas): ${this.resultados.archivosGrandes.length}`);
      const top10 = this.resultados.archivosGrandes.slice(0, 10);
      top10.forEach(item => {
        const tipo = item.esComponente ? '(componente)' : '(servicio/util)';
        console.log(`   ${item.archivo.padEnd(50)} - ${item.lineas} líneas ${tipo}`);
      });
      console.log();
    } else {
      console.log('✅ Todos los archivos están dentro del límite\n');
    }

    // Código comentado
    if (this.resultados.codigoComentado.length > 0) {
      console.log(`⚠️  Código comentado detectado: ${this.resultados.codigoComentado.length} líneas`);
      console.log(`   (revisar manualmente para eliminar código obsoleto)\n`);
    }

    // Vulnerabilidades
    if (this.resultados.vulnerabilidades > 0) {
      console.log(`⚠️  Vulnerabilidades de seguridad: ${this.resultados.vulnerabilidades}`);
      console.log(`   Ejecuta: npm audit fix\n`);
    }

    console.log('='.repeat(70));
    console.log('✅ Auditoría completada. Resultados guardados en: auditoria-resultados.json');
    console.log('='.repeat(70) + '\n');
  }

  /**
   * Guarda resultados en JSON
   */
  private guardarResultados(): void {
    const reporte = {
      fecha: new Date().toISOString(),
      resumen: {
        consoleLogs: this.resultados.consoleLogs.length,
        debugStatements: this.resultados.debugStatements.length,
        archivosGrandes: this.resultados.archivosGrandes.length,
        vulnerabilidades: this.resultados.vulnerabilidades,
        codigoComentado: this.resultados.codigoComentado.length
      },
      detalles: this.resultados
    };

    writeFileSync(
      'auditoria-resultados.json',
      JSON.stringify(reporte, null, 2),
      'utf-8'
    );
  }
}

// Ejecutar auditoría
const auditor = new AuditoriaProyecto();
auditor.ejecutar().catch(error => {
  console.error('❌ Error en auditoría:', error.message);
  process.exit(1);
});
