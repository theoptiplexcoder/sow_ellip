// Minimal safe arithmetic evaluator for formula fields. No eval()/Function() —
// field references like {hourlyRate} are substituted with numbers (dates are
// converted to a day count so `{endDate} - {startDate}` yields a day span),
// then the resulting `+ - * / ( )` expression is evaluated with a small
// recursive-descent parser.

const FIELD_REF = /\{([a-zA-Z0-9_.]+)\}/g;

export function extractFormulaRefs(expression: string): string[] {
  const refs = new Set<string>();
  for (const match of expression.matchAll(FIELD_REF)) refs.add(match[1]);
  return [...refs];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}/;

function toNumeric(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'string' && DATE_RE.test(value)) {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? 0 : ms / 86400000; // days since epoch
  }
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(n) ? 0 : n;
}

function substitute(expression: string, values: Record<string, unknown>): string {
  return expression.replace(FIELD_REF, (_, key: string) => `(${toNumeric(values[key])})`);
}

class ExpressionParser {
  private pos = 0;
  constructor(private readonly src: string) {}

  parse(): number {
    const value = this.parseExpr();
    this.skipSpace();
    if (this.pos < this.src.length) throw new Error(`Unexpected token at ${this.pos}`);
    return value;
  }

  private skipSpace() {
    while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) this.pos += 1;
  }

  private parseExpr(): number {
    let value = this.parseTerm();
    for (;;) {
      this.skipSpace();
      const op = this.src[this.pos];
      if (op === '+' || op === '-') {
        this.pos += 1;
        const rhs = this.parseTerm();
        value = op === '+' ? value + rhs : value - rhs;
      } else break;
    }
    return value;
  }

  private parseTerm(): number {
    let value = this.parseFactor();
    for (;;) {
      this.skipSpace();
      const op = this.src[this.pos];
      if (op === '*' || op === '/') {
        this.pos += 1;
        const rhs = this.parseFactor();
        value = op === '*' ? value * rhs : value / rhs;
      } else break;
    }
    return value;
  }

  private parseFactor(): number {
    this.skipSpace();
    if (this.src[this.pos] === '-') {
      this.pos += 1;
      return -this.parseFactor();
    }
    if (this.src[this.pos] === '(') {
      this.pos += 1;
      const value = this.parseExpr();
      this.skipSpace();
      if (this.src[this.pos] !== ')') throw new Error('Expected )');
      this.pos += 1;
      return value;
    }
    const match = /^\d+(\.\d+)?/.exec(this.src.slice(this.pos));
    if (!match) throw new Error(`Expected number at ${this.pos}`);
    this.pos += match[0].length;
    return Number(match[0]);
  }
}

export function evaluateFormula(expression: string, values: Record<string, unknown>): number | null {
  if (!expression.trim()) return null;
  try {
    const substituted = substitute(expression, values);
    if (!/^[\d\s+\-*/().]*$/.test(substituted)) return null;
    return new ExpressionParser(substituted).parse();
  } catch {
    return null;
  }
}
