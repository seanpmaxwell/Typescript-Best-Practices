// ========================================================================= //
//                     1. Factory-function version (HttpErr.ff.ts)          //
// ========================================================================= //

interface IHttpErr extends Error {
  readonly statusCode: number;
  isClientError(): boolean;
  report(log: (msg: string) => void): void;
}

// INHERITANCE: a shared prototype whose own prototype is Error.prototype.
// Methods here are allocated once and shared by every instance.
const HttpErrProto: Pick<IHttpErr, 'name' | 'isClientError'> = Object.setPrototypeOf(
  {
    name: 'HttpErr',
    isClientError(this: IHttpErr) {
      return this.statusCode >= 400 && this.statusCode < 500;
    },
  },
  Error.prototype,
);

// Public factory. `create` does the assembly; `of` adds the things a caller
// should never have to think about: argument validation and a clean stack.
function of(statusCode: number, message: string, options?: ErrorOptions): IHttpErr {
  if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
    throw new RangeError(`Invalid HTTP status code: ${statusCode}`);
  }
  const err = create(statusCode, message, options);
  // Passing `of` drops its frame and every frame above it — including
  // `create` — so the trace starts at the caller.
  Error.captureStackTrace?.(err, of);
  return err;
}

// Builds a complete IHttpErr. Both OOP pillars live here:
//
//   INHERITANCE  — construct a real Error so `.stack` and `options.cause`
//                  work, then re-parent it onto HttpErrProto so it picks up
//                  `name` and `isClientError` via the prototype chain.
//   ENCAPSULATION — `reported` lives only in this closure. `report` must be
//                  a per-instance method because it closes over that flag.
function create(statusCode: number, message: string, options?: ErrorOptions): IHttpErr {
  let reported = false;
  const parent = new Error(message, options);
  const __proto__ = Object.setPrototypeOf(parent, HttpErrProto);
  const err: IHttpErr = Object.assign(
    __proto__,
    {
      statusCode,
      report(log: (msg: string) => void) {
        if (reported) return;
        reported = true;
        log(`${err.name} ${statusCode}: ${err.message}`);
      },
    },
  );
  return err;
}

// No constructor → no `instanceof HttpErr`. Provide a guard instead.
function is(val: unknown): val is IHttpErr {
  return HttpErrProto.isPrototypeOf(val);
}

// Module-object. `of` and `is` are hoisted function declarations, so this
// can sit above them without hitting the TDZ. `create` is an internal
// helper and stays off the public surface.
export default { of, is } as const;

// Usage
import HttpErr from './HttpErr.ff.ts';
const ffErr = HttpErr.of(404, 'User not found');
ffErr.report(console.error);                  // logs once
ffErr.report(console.error);                  // no-op — flag is private
console.log(ffErr.isClientError());           // true
console.log(ffErr instanceof Error);          // true
console.log(HttpErr.is(ffErr));               // true
console.log(String(ffErr));                   // "HttpErr: User not found"
console.log((ffErr as any).reported);         // undefined — not on the object at all
// HttpErr.of(999, 'nope');                   // RangeError: Invalid HTTP status code: 999


/ ========================================================================= //
//                        2. Class version (HttpErr.class.ts)               //
// ========================================================================= //

class HttpErr extends Error {
  readonly statusCode: number;
  #reported = false; // ENCAPSULATION: hard-private, still shares prototype methods

  protected constructor(statusCode: number, message: string, options?: ErrorOptions) {
    super(message, options);                  // INHERITANCE: wires Error.prototype for us
    this.name = 'HttpErr';
    this.statusCode = statusCode;
    Error.captureStackTrace?.(this, HttpErr.of);
  }

  static of(statusCode: number, message: string, options?: ErrorOptions): HttpErr {
    return new HttpErr(statusCode, message, options);
  }

  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  report(log: (msg: string) => void): void {
    if (this.#reported) return;
    this.#reported = true;
    log(`${this.name} ${this.statusCode}: ${this.message}`);
  }
}

// Usage
const classErr = HttpErr.of(404, 'User not found');
classErr.report(console.error);               // logs once
classErr.report(console.error);               // no-op
console.log(classErr.isClientError());        // true
console.log(classErr instanceof HttpErr);     // true — works without a custom guard
console.log(classErr instanceof Error);       // true
console.log(String(classErr));                // "HttpErr: User not found"
// classErr.#reported                         // SyntaxError: private field
