type LogicOperator = "and" | "or";
type ComparisonOperator = "=" | "!=" | "<" | ">" | "<=" | ">=" | "<>" | "><";
export type NextWordType = "variable" | "operator" | "literal value" | "logical operator";
export type LastToken = {
  type: NextWordType;
  content: string;
};

type Token =
  | { type: "lparen"; raw: "(" }
  | { type: "rparen"; raw: ")" }
  | { type: "operator"; raw: ComparisonOperator | "==" }
  | { type: "special"; raw: string }
  | { type: "word"; raw: string };

export type ConditionAst =
  | { type: "empty" }
  | {
      type: "comparison";
      variable: string;
      operator: ComparisonOperator;
      value: string;
    }
  | {
      type: "special";
      variable: string;
      operator: string;
      value?: string;
    }
  | {
      type: "not";
      condition: ConditionAst;
    }
  | {
      type: "logic";
      operator: LogicOperator;
      terms: ConditionAst[];
    }
  | {
      type: "group";
      expression: ConditionAst;
    }
  | {
      type: "invalid";
      reason: string;
      source: string;
    };

const connectorWords = new Set(["and", "or"]);
const twoCharOperators = ["<=", ">=", "!=", "<>", "><", "=="] as const;

export function parseConditions(source: string): ConditionAst {
  const trimmed = source.trim();
  if (!trimmed) return { type: "empty" };

  const parser = new Parser(tokenize(trimmed), trimmed);
  const ast = parser.parseExpression();

  if (parser.hasMore()) {
    return {
      type: "invalid",
      reason: "Unexpected trailing tokens",
      source: parser.remainingSource(),
    };
  }

  return ast;
}

class Parser {
  private index = 0;
  private readonly tokens: Token[];
  private readonly source: string;

  constructor(tokens: Token[], source: string) {
    this.tokens = tokens;
    this.source = source;
  }

  parseExpression(): ConditionAst {
    return this.parseOr();
  }

  hasMore(): boolean {
    return this.index < this.tokens.length;
  }

  remainingSource(): string {
    return joinTokens(this.tokens.slice(this.index));
  }

  private parseOr(): ConditionAst {
    const left = this.parseAnd();
    const terms: ConditionAst[] = [left];

    while (this.isConnector("or")) {
      this.index += 1;
      const right = this.parseAnd();
      terms.push(right);
    }

    if (terms.length === 1) return left;
    return { type: "logic", operator: "or", terms };
  }

  private parseAnd(): ConditionAst {
    const left = this.parseNot();
    const terms: ConditionAst[] = [left];

    while (this.isConnector("and")) {
      this.index += 1;
      const right = this.parseNot();
      terms.push(right);
    }

    if (terms.length === 1) return left;
    return { type: "logic", operator: "and", terms };
  }

  private parseNot(): ConditionAst {
    const token = this.peek();
    if (token?.type === "word" && token.raw.toLowerCase() === "not") {
      this.index += 1;
      return { type: "not", condition: this.parseNot() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ConditionAst {
    const token = this.peek();
    if (!token) {
      return {
        type: "invalid",
        reason: "Unexpected end of input",
        source: this.source,
      };
    }

    if (token.type === "lparen") {
      this.index += 1;
      const expression = this.parseExpression();
      if (this.peek()?.type !== "rparen") {
        return {
          type: "invalid",
          reason: "Missing closing parenthesis",
          source: this.source,
        };
      }
      this.index += 1;
      return { type: "group", expression };
    }

    return this.parseClause();
  }

  private parseClause(): ConditionAst {
    const subjectTokens: Token[] = [];

    while (true) {
      const token = this.peek();
      if (!token || token.type === "rparen" || isConnectorToken(token)) {
        return {
          type: "invalid",
          reason: "Missing operator",
          source: joinTokens(subjectTokens) || this.source,
        };
      }

      if (token.type === "operator" || token.type === "special") {
        break;
      }

      subjectTokens.push(token);
      this.index += 1;
    }

    const variable = joinTokens(subjectTokens).trim();
    if (!variable) {
      return {
        type: "invalid",
        reason: "Missing variable",
        source: this.source,
      };
    }

    const operatorToken = this.next();
    if (!operatorToken) {
      return {
        type: "invalid",
        reason: "Missing operator",
        source: this.source,
      };
    }

    const valueTokens = this.readUntilBoundary();
    const value = joinTokens(valueTokens).trim();

    if (operatorToken.type === "special") {
      return value
        ? { type: "special", variable, operator: operatorToken.raw, value }
        : { type: "special", variable, operator: operatorToken.raw };
    }

    if (!value) {
      return {
        type: "invalid",
        reason: "Missing value",
        source: `${variable} ${operatorToken.raw}`,
      };
    }

    return {
      type: "comparison",
      variable,
      operator: normalizeComparisonOperator(operatorToken.raw as any),
      value,
    };
  }

  private readUntilBoundary(): Token[] {
    const tokens: Token[] = [];

    while (true) {
      const token = this.peek();
      if (!token || token.type === "rparen" || isConnectorToken(token)) {
        break;
      }
      tokens.push(token);
      this.index += 1;
    }

    return tokens;
  }

  private isConnector(expected: LogicOperator): boolean {
    const token = this.peek();
    return (
      token?.type === "word" &&
      token.raw.toLowerCase() === expected &&
      connectorWords.has(token.raw.toLowerCase())
    );
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private next(): Token | undefined {
    const token = this.tokens[this.index];
    this.index += 1;
    return token;
  }
}

export function getLastToken(source: string, cursor = source.length): LastToken {
  const head = source.slice(0, cursor);
  const tokens = tokenize(head);
  if (tokens.length === 0) {
    return { type: "variable", content: "" };
  }

  const hasTrailingWhitespace = /\s$/.test(head);
  const committed = hasTrailingWhitespace ? tokens : tokens.slice(0, -1);
  const current = hasTrailingWhitespace ? undefined : tokens[tokens.length - 1];

  let mode: NextWordType = "variable";
  let literalValueHasToken = false;

  for (const token of committed) {
    const word = token.type === "word" ? token.raw.toLowerCase() : undefined;

    if (token.type === "lparen") {
      mode = "variable";
      literalValueHasToken = false;
      continue;
    }

    if (token.type === "rparen") {
      mode = "logical operator";
      literalValueHasToken = false;
      continue;
    }

    if (mode === "variable") {
      if (word === "not") continue;
      if (token.type === "word") {
        mode = "operator";
      }
      continue;
    }

    if (mode === "operator") {
      if (token.type === "word") continue;
      if (token.type === "operator") {
        mode = "literal value";
        literalValueHasToken = false;
        continue;
      }
      if (token.type === "special") {
        mode = "logical operator";
      }
      continue;
    }

    if (mode === "literal value") {
      if (word && connectorWords.has(word)) {
        mode = "variable";
        literalValueHasToken = false;
        continue;
      }
      if ((token.type as any) === "rparen") {
        mode = "logical operator";
        literalValueHasToken = false;
        continue;
      }
      literalValueHasToken = true;
      continue;
    }

    if (mode === "logical operator") {
      if (word && connectorWords.has(word)) {
        mode = "variable";
        literalValueHasToken = false;
      }
      continue;
    }
  }

  if (hasTrailingWhitespace && mode === "literal value" && literalValueHasToken) {
    return { type: "logical operator", content: "" };
  }

  if (current) {
    return {
      type: mode,
      content: current.raw,
    };
  }

  return {
    type: mode,
    content: "",
  };
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];
    if (!char) break;

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "(") {
      tokens.push({ type: "lparen", raw: "(" });
      index += 1;
      continue;
    }

    if (char === ")") {
      tokens.push({ type: "rparen", raw: ")" });
      index += 1;
      continue;
    }

    const two = source.slice(index, index + 2);
    if (twoCharOperators.includes(two as (typeof twoCharOperators)[number])) {
      tokens.push({
        type: "operator",
        raw: two as ComparisonOperator | "==",
      });
      index += 2;
      continue;
    }

    if (["=", "<", ">"].includes(char)) {
      tokens.push({ type: "operator", raw: char as ComparisonOperator });
      index += 1;
      continue;
    }

    if (char === "$") {
      const match = source.slice(index).match(/^\$[a-z_]+/i);
      if (match) {
        tokens.push({ type: "special", raw: match[0] });
        index += match[0].length;
        continue;
      }
    }

    if (char === "'" || char === '"') {
      const quote = char;
      let end = index + 1;
      while (end < source.length) {
        const next = source[end];
        if (next === quote && source[end - 1] !== "\\") {
          end += 1;
          break;
        }
        end += 1;
      }
      tokens.push({ type: "word", raw: source.slice(index, end) });
      index = end;
      continue;
    }

    if (char === "{") {
      let end = index + 1;
      while (end < source.length && source[end] !== "}") {
        end += 1;
      }
      end = end < source.length ? end + 1 : end;
      tokens.push({ type: "word", raw: source.slice(index, end) });
      index = end;
      continue;
    }

    let end = index + 1;
    while (end < source.length) {
      const next = source[end];
      if (!next || /\s/.test(next) || "()<>!=\"'${}".includes(next)) {
        break;
      }
      end += 1;
    }

    tokens.push({ type: "word", raw: source.slice(index, end) });
    index = end;
  }

  return tokens;
}

function isConnectorToken(token: Token): boolean {
  return token.type === "word" && connectorWords.has(token.raw.toLowerCase());
}

function normalizeComparisonOperator(operator: ComparisonOperator | "=="): ComparisonOperator {
  return operator === "==" ? "=" : operator;
}

function joinTokens(tokens: Token[]): string {
  return tokens
    .map((token) => token.raw)
    .join(" ")
    .trim();
}
