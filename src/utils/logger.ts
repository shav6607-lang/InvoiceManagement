import { env } from '@/config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const log = (level: LogLevel, message: string, ...args: unknown[]) => {
  if (env.isProd && level === 'debug') return;
  console[level](`[${level.toUpperCase()}] ${message}`, ...args);
};

export const logger = {
  debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  error: (message: string, ...args: unknown[]) => log('error', message, ...args),
};
