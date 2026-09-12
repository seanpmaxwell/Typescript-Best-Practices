// ========================================================================= //
//                                     TYPES                                 //
// ========================================================================= //

type LogLevel = 'warn' | 'error';

interface Logger {
  warn(msg: string): void;
  error(msg: string): void;
}

interface ReportOptions {
  maxMessageLength?: number;
  maxStackFrames?: number;
  redactPatterns?: RegExp[];
}

// Everything `formatReport` needs from the instance, copied out as plain
// data so the helper never has to touch `this`.
interface ReportInput {
  name: string;
  statusCode: number;
  message: string;
  cause: unknown;
  stack: string | undefined;
}

// ========================================================================= //
//                                  CONSTANTS                                //
// ========================================================================= //

const DefaultRedactPatterns: readonly RegExp[] = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g,          // auth tokens
  /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g,            // emails
  /\b(?:\d[ -]*?){13,16}\b/g,                 // card-like digit runs
];

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

  // Only the parts that genuinely need `this` stay in the class: guarding and
  // flipping the private flag, and reading the instance's own fields. All the
  // formatting logic is delegated to the pure function declarations below.
  report(logger: Logger, options: ReportOptions = {}): void {
    if (this.#reported) return;
    this.#reported = true;
    const input: ReportInput = {
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      cause: this.cause,
      stack: this.stack,
    };
    const levelFn = levelFor(this.statusCode);
    const formattedReport = formatReport(input, options);
    logger[levelFn](formattedReport);
  }
}

// ========================================================================= //
//                                   FUNCTIONS                               //
// ========================================================================= //
// Pure helpers. No `this`, no class state, individually unit-testable.

function levelFor(statusCode: number): LogLevel {
  return statusCode >= 500 ? 'error' : 'warn';
}

function formatReport(input: ReportInput, options: ReportOptions): string {
  const {
    maxMessageLength = 200,
    maxStackFrames = 5,
    redactPatterns = DefaultRedactPatterns,
  } = options;
  const message = truncate(redact(input.message, redactPatterns), maxMessageLength);
  const header = `${timestamp()} ${input.name} ${input.statusCode}: ${message}`;
  const causeLines = flattenCauses(input.cause).map(
    (c) => `  caused by: ${redact(describeCause(c), redactPatterns)}`,
  );
  const frameLines = trimStack(input.stack, maxStackFrames).map((f) => `    ${f}`);
  return [header, ...causeLines, ...frameLines].join('\n');
}

function timestamp(): string {
  return new Date().toISOString();
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : `${str.slice(0, max - 1)}…`;
}

function redact(str: string, patterns: readonly RegExp[]): string {
  return patterns.reduce((acc, re) => acc.replace(re, '[REDACTED]'), str);
}

// Walks `err.cause -> err.cause.cause -> ...`, stopping on cycles.
function flattenCauses(cause: unknown): unknown[] {
  const seen = new Set<unknown>();
  const chain: unknown[] = [];
  let current = cause;
  while (current !== undefined && current !== null && !seen.has(current)) {
    seen.add(current);
    chain.push(current);
    current = current instanceof Error ? current.cause : undefined;
  }
  return chain;
}

function describeCause(cause: unknown): string {
  if (cause instanceof Error) return `${cause.name}: ${cause.message}`;
  if (typeof cause === 'string') return cause;
  try {
    return JSON.stringify(cause);
  } catch {
    return String(cause);
  }
}

// Drops the "Name: message" first line, keeps only `at ...` frames.
function trimStack(stack: string | undefined, max: number): string[] {
  if (!stack) return [];
  return stack
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('at '))
    .slice(0, max);
}

// ========================================================================= //
//                                    EXPORT                                 //
// ========================================================================= //

export default HttpErr;



// ========================================================================= //
//                                    Usage                                  //
// ========================================================================= //

const dbErr = new Error('connection refused', { cause: 'ECONNREFUSED 10.0.0.5:5432' });
const err = HttpErr.of(503, 'Could not load profile for alice@example.com', { cause: dbErr });

err.report(console, { maxStackFrames: 2 });
// 2026-09-12T14:03:11.482Z HttpErr 503: Could not load profile for [REDACTED]
//   caused by: Error: connection refused
//   caused by: ECONNREFUSED 10.0.0.5:5432
//     at handler (/app/routes/profile.ts:42:11)
//     at Layer.handle (/app/node_modules/express/lib/router/layer.js:95:5)

err.report(console);                          // no-op — already reported
console.log(err.isClientError());             // false
