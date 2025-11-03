import type {LogErrorOptions, Logger, LoggerOptions, LogLevel, LogOptions, LogType} from "vite";

import pc from 'picocolors';

/**
 * Create a simple console logger compatible with Vite's Logger interface
 */
export function createConsoleLogger(debugEnabled: boolean = false, prefix: string = ` i18n-typescript`): Logger {
  const warnedMessages = new Set<string>();


  return {
    info: (msg: string) => {


      if (debugEnabled) {
        console.log(`[${pc.dim(prefix)}] ${msg}`);
      }
    },
    warn: (msg: string) => {
      console.warn(`[${pc.dim(prefix)}] ${msg}`);
    },
    error: (msg: string) => {
      console.error(`[${pc.dim(prefix)}] ${msg}`);
    },
    warnOnce: (msg: string) => {
      if (!warnedMessages.has(msg)) {
        warnedMessages.add(msg);
        console.warn(`[${pc.dim(prefix)}] ${msg}`);
      }
    },
    clearScreen: () => {
    },
    hasErrorLogged: () => false,
    hasWarned: false,
  };
}

// decorator of Logger with prefix and colored output
export function createColoredLogger(level?: LogLevel | 'debug', options?: LoggerOptions) {

  const logger: Logger = options?.customLogger ?? createConsoleLogger(true, options?.prefix)
  const prefix = options?.prefix ?? `vue-i18n-typescript`;

  return {
    debug: (msg: string, options?: LogOptions) => {
      if (level !== 'debug') return
      logger.info(`${pc.dim(pc.cyanBright(prefix))} ${pc.gray(msg)}`, options);
    },
    info: (msg: string, options?: LogOptions) => {

      logger.info(`${pc.dim(pc.blueBright(prefix))} ${msg}`, options);

    },
    warn: (msg: string, options?: LogOptions) => {

      logger.warn(`${pc.dim(prefix)} ${pc.yellow(msg)}`, options);
    },
    error: (msg: string, options?: LogErrorOptions) => {
      logger.clearScreen("info")
      logger.error(`${pc.bold(prefix)} ${pc.red(msg)}`, options);
      // red console color
    },
    warnOnce: (msg: string, options?: LogOptions) => {
      logger.clearScreen("info")
      logger.warnOnce(`${pc.bold(prefix)} ${pc.yellow(msg)}`, options);
    },
    clearScreen: (type: LogType) => {
      logger.clearScreen(type);
    },
    hasErrorLogged: (error: Error) => logger.hasErrorLogged(error),
    hasWarned: logger.hasWarned,
  };
}
