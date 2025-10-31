/**
 * Sistema de logging centralizado
 */
export class Logger {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  static info(message: string, data?: any) {
    console.log(`[${this.getTimestamp()}] ℹ️  INFO: ${message}`, data || "");
  }

  static error(message: string, error: any) {
    console.error(`[${this.getTimestamp()}] ❌ ERROR: ${message}`);
    console.error(error);
  }

  static warn(message: string, data?: any) {
    console.warn(`[${this.getTimestamp()}] ⚠️  WARN: ${message}`, data || "");
  }

  static debug(message: string, data?: any) {
    if (
      process.env.DEBUG === "true" ||
      process.env.NODE_ENV === "development"
    ) {
      console.debug(
        `[${this.getTimestamp()}] 🐛 DEBUG: ${message}`,
        data || ""
      );
    }
  }

  static success(message: string, data?: any) {
    console.log(`[${this.getTimestamp()}] ✅ SUCCESS: ${message}`, data || "");
  }
}
