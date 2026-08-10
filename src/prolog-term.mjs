// Minimal term model required by the extracted EyeProlog parser.
// The RDF adapter only needs parsed term shape: type, name, args, and arity.
export class Term {
  constructor(type, name, args = []) {
    this.type = type;
    this.name = String(name ?? '');
    this.args = args;
  }
  get arity() { return this.args.length; }
}

export function atom(name) { return new Term('atom', name); }
export function numberTerm(name) { return new Term('number', name); }
export function variable(name) { return new Term('var', name); }
export function compound(name, args = []) { return new Term('compound', name, args); }
export function emptyList() { return atom('[]'); }
export function cons(head, tail) { return compound('.', [head, tail]); }
