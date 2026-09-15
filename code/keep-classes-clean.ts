// Class version (HttpErr.class.ts)

// ========================================================================= //
//                                     TYPES                                 //
// ========================================================================= //

interface Logger {
  warn(msg: string): void;
  error(msg: string): void;
}

// Everything the helpers need from the instance, handed over as plain data
// so they never touch `this`.
interface ReportInput {
  name: string;
  statusCode: number;
  message: string;
  cause: unknown;
}

// ========================================================================= //
//                                    CLASS                                  //
// ========================================================================= //

class HttpErr extends Error {
  readonly statusCode: number;
  #reported = false;

  protected constructor(statusCode: number, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'HttpErr';
    this.statusCode = statusCode;
    Error.captureStackTrace?.(this, HttpErr.of);
  }

  static of(statusCode: number, message: string, options?: ErrorOptions): HttpErr {
    if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
      throw new RangeError(`Invalid HTTP status code: ${statusCode}`);
    }
    return new HttpErr(statusCode, message, options);
  }

  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  // Only what needs `this` stays here: the private flag and the instance
  // reads. Formatting is delegated to the pure helpers below.
  report(logger: Logger): void {
    if (this.#reported) return;
    this.#reported = true;

    const input: ReportInput = {
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      cause: this.cause,
    };

    const level = this.statusCode >= 500 ? 'error' : 'warn';
    logger[level](formatReport(input));
  }
}

// ========================================================================= //
//                                   FUNCTIONS                               //
// ========================================================================= //
// Pure helpers. No `this`, no class state, individually unit-testable.

function formatReport(input: ReportInput): string {
  const header = `${new Date().toISOString()} ${input.name} ${input.statusCode}: ${input.message}`;
  const causeLine = describeCause(input.cause);
  return causeLine ? `${header}\n  caused by: ${causeLine}` : header;
}

function describeCause(cause: unknown): string | undefined {
  if (cause === undefined || cause === null) return undefined;
  if (cause instanceof Error) return `${cause.name}: ${cause.message}`;
  if (typeof cause === 'string') return cause;
  return JSON.stringify(cause);
}


// ----------- Usage

const dbErr = new Error('connection refused');
const err = HttpErr.of(503, 'Could not load profile', { cause: dbErr });

err.report(console);
// 2026-09-15T14:03:11.482Z HttpErr 503: Could not load profile
//   caused by: Error: connection refused

err.report(console);              // no-op — already reported
console.log(err.isClientError()); // false
