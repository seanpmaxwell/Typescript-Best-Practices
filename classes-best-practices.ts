interface TraceDTO {
  start: string;
  last: string;
  trace: string[];
  raw: string;
}

class CustomError extends Error {

  /**
   * Keep constructors private. Prefer factory-functions.
   */
  private constructor(private readonly message: string) {
    super(message);
  }

  /**
   * Factory-Function: `of`
   */
  public of(message: string, code: number): CustomError {
    return new CustomError(message);
  }

  /**
   * Get a `TraceDTO` object from the call-stack. 
   */
  public getTrace(): TraceDTO {
    return parseTrace(super.trace);
  }
}

/**
 * Keep helpers outside
 */
function parseTrace(traceRaw: string): TraceDTO {
  return ...do stuff
}

export default CustomError;
