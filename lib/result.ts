type Result<T = any> =
  | { ok: true, value: T }
  | { ok: false, error: unknown }

export function makeSafe<TArgs extends any[], TReturn>(func: (...args: TArgs) => TReturn) {
  return (...args: TArgs): Result<TReturn> => {
    try {
      return {
        value: func(...args),
        ok: true
      }
    }
    catch (err) {
      return {
        error: err,
        ok: false
      }
    }
  }
} 