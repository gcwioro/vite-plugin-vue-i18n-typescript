/**
 * Enhanced error formatting utilities
 */

interface ErrorLocation {
  line: number;
  column: number;
}

/**
 * Parse JSON and provide enhanced error messages with line/column information
 */
export function parseJSONWithLocation(
  content: string,
  filePath: string
): any {
  try {
    return JSON.parse(content);
  } catch (error: any) {
    const location = extractJSONErrorLocation(error, content);
    throw createFormattedError(filePath, content, location, error.message);
  }
}

/**
 * Extract line and column from JSON parse error
 */
function extractJSONErrorLocation(
  error: Error,
  content: string
): ErrorLocation | null {
  const message = error.message;

  // Try to extract position from different error formats
  // Node.js: "Unexpected token } in JSON at position 123"
  const positionMatch = message.match(/at position (\d+)/);
  if (positionMatch) {
    const position = parseInt(positionMatch[1], 10);
    return getLineAndColumn(content, position);
  }

  // V8: "JSON.parse: unexpected character at line 5 column 12"
  const lineColMatch = message.match(/line (\d+) column (\d+)/);
  if (lineColMatch) {
    return {
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
    };
  }

  return null;
}

/**
 * Convert character position to line and column
 */
function getLineAndColumn(content: string, position: number): ErrorLocation {
  const lines = content.substring(0, position).split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;

  return {line, column};
}

/**
 * Create a formatted error with context
 */
function createFormattedError(
  filePath: string,
  content: string,
  location: ErrorLocation | null,
  originalMessage: string
): Error {
  if (!location) {
    // Fallback to simple error if we can't extract location
    const error = new Error(`Failed to parse JSON in ${filePath}\n${originalMessage}`);
    error.name = 'JSONParseError';
    return error;
  }

  const lines = content.split('\n');
  const {line, column} = location;

  // Get context lines (2 before, the error line, 2 after)
  const contextStart = Math.max(0, line - 3);
  const contextEnd = Math.min(lines.length, line + 2);
  const contextLines = lines.slice(contextStart, contextEnd);

  // Build error message with context
  const errorLines: string[] = [];
  errorLines.push(`\n❌ JSON Parse Error in ${filePath}:${line}:${column}`);
  errorLines.push('');
  errorLines.push(originalMessage);
  errorLines.push('');

  // Show context with line numbers
  contextLines.forEach((contextLine, index) => {
    const lineNum = contextStart + index + 1;
    const isErrorLine = lineNum === line;
    const prefix = isErrorLine ? '>' : ' ';
    const lineNumStr = String(lineNum).padStart(4, ' ');

    errorLines.push(`${prefix} ${lineNumStr} | ${contextLine}`);

    // Add pointer to error column
    if (isErrorLine && column > 0) {
      const pointer = ' '.repeat(8 + column) + '^';
      errorLines.push(pointer);
    }
  });

  errorLines.push('');

  const error = new Error(errorLines.join('\n'));
  error.name = 'JSONParseError';
  return error;
}

/**
 * Format a generic file error with location
 */
export function formatFileError(
  filePath: string,
  message: string,
  line?: number,
  column?: number
): Error {
  const location = line !== undefined ? `:${line}${column !== undefined ? `:${column}` : ''}` : '';
  const error = new Error(`\n❌ Error in ${filePath}${location}\n${message}\n`);
  error.name = 'FileError';
  return error;
}

/**
 * Wrap an error with file context
 */
export function wrapErrorWithFile(
  filePath: string,
  error: Error
): Error {
  if (error.name === 'JSONParseError' || error.name === 'FileError') {
    // Already formatted
    return error;
  }

  const wrappedError = new Error(
    `\n❌ Error processing ${filePath}\n${error.message}\n`
  );
  wrappedError.name = 'FileProcessingError';
  wrappedError.stack = error.stack;
  return wrappedError;
}
