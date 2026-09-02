# EyeProlog parser synchronization

`src/prolog-parser.mjs` is synchronized from
[`eyeprolog` v1.5.26](https://github.com/eyereasoner/eyeprolog/tree/v1.5.26),
commit `026307b10e2270e54f6f40d9b1fd63f9531d2249`.

The synchronization boundary is deliberately mechanical:

- `src/parser.js` becomes `src/prolog-parser.mjs`;
- `src/syntax-scan.js`, `src/iso-character.js`, and `src/iso-limits.js` become
  matching `.mjs` support modules;
- local import specifiers use the standalone `.mjs` filenames;
- `src/prolog-term.mjs` supplies only the term constants and constructors that
  the parser imports.

No solver code is copied. The roundtrip adapter parses complete Prolog source
so it can identify ground `rdf/4` facts, but it does not execute clauses.

When updating from a later EyeProlog release, copy those four source files,
apply only the import-specifier adaptation above, update the source revision in
this document, and run `npm test`. The parser parity tests pin recent normal
profile syntax as well as strict-ISO rejection boundaries.
