/**
 * 📝 Servicio de Logging Centralizado
 *
 * Gestiona logs de la aplicación de forma centralizada.
 * En producción, los logs pueden enviarse a servicios externos (Sentry, LogRocket, etc.)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  /**
   * Registra un mensaje informativo
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Registra una advertencia
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Registra un error
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, context, error);
  }

  /**
   * Registra información de depuración (solo en desarrollo)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Registra una entrada de log
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
    };

    this.logs.push(entry);

    // Limitar número de logs en memoria
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // En desarrollo, mostrar en consola
    if (this.isDevelopment) {
      this.logToConsole(entry);
    }

    // En producción, enviar a servicio externo
    // TODO: Integrar con Sentry, LogRocket, etc.
  }

  /**
   * Muestra el log en consola (solo desarrollo)
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp.toISOString()}] [${entry.level.toUpperCase()}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'error':
        console.error(message, entry.context, entry.error);
        break;
      case 'warn':
        console.warn(message, entry.context);
        break;
      case 'debug':
        console.debug(message, entry.context);
        break;
      default:
        console.log(message, entry.context);
    }
  }

  /**
   * Obtiene todos los logs registrados
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Limpia todos los logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Instancia singleton
export const logger = new Logger();
