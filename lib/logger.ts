const isDev = process.env.NODE_ENV !== 'production'

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.log(...args)
  },
  error: (...args: unknown[]) => {
    console.error(...args)
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args)
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.log('[DEBUG]', ...args)
  },
}
