import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  compileRdfDocumentToProlog,
  compileRdfToProlog,
  extractRdfFromProlog,
  parseNQuads,
  serializeRdfFromProlog,
} from '../src/index.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const examplesDir = path.resolve(here, '../examples');
const names = await fs.readdir(examplesDir);
const inputFiles = names
  .map((name) => /^(.*)-input\.(ttl|trig)$/.exec(name))
  .filter(Boolean)
  .map((match) => ({ base: match[1], ext: match[2] }))
  .sort((a, b) => a.base.localeCompare(b.base));

assert.equal(inputFiles.length, 14, 'expected exactly 14 RDF examples');
const dirs = [];
for (const name of names) {
  const stat = await fs.stat(path.join(examplesDir, name));
  if (stat.isDirectory()) dirs.push(name);
}
assert.deepEqual(dirs, [], 'examples/ must stay flat');

let passed = 0;
let skipped = 0;
function ok(name) { passed++; console.log(`ok - ${name}`); }
function skip(name, reason) { skipped++; console.log(`skip - ${name} (${reason})`); }

function datasetSignature(nquads) {
  const quads = parseNQuads(nquads, { scope: 'comparison' });
  const blankNodes = new Map();
  let blankIndex = 0;

  function term(value) {
    if (value.kind === 'namedNode') return `I<${value.value}>`;
    if (value.kind === 'defaultGraph') return 'G<default>';
    if (value.kind === 'blankNode') {
      const key = `${value.scope}\0${value.value}`;
      if (!blankNodes.has(key)) blankNodes.set(key, `B${blankIndex++}`);
      return blankNodes.get(key);
    }
    if (value.kind === 'literal') {
      return `L${JSON.stringify([value.value, value.language ?? '', value.direction ?? '', value.datatype ?? ''])}`;
    }
    if (value.kind === 'triple') {
      return `T(${term(value.subject)},${term(value.predicate)},${term(value.object)})`;
    }
    throw new Error(`unsupported RDF term kind: ${value?.kind}`);
  }

  return quads
    .map((quad) => `${term(quad.subject)} ${term(quad.predicate)} ${term(quad.object)} ${term(quad.graph)}`)
    .sort();
}

function assertSameDataset(actual, expected, label) {
  assert.deepEqual(datasetSignature(actual), datasetSignature(expected), label);
}

// prolog-to-rdf emits a deliberately simple absolute-IRI Turtle/TriG subset.
// Convert that canonical syntax back to N-Quads here so the checked-in outputs
// are roundtripped even when optional rdf-parse is unavailable.
function canonicalOutputToNQuads(source, ext) {
  const lines = String(source).split(/\r?\n/);
  const out = [];
  let graph = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || /^VERSION\s+"1\.2"$/.test(line)) continue;
    if (ext === 'trig' && line.endsWith('{')) {
      graph = line.slice(0, -1).trim();
      continue;
    }
    if (ext === 'trig' && line === '}') {
      graph = null;
      continue;
    }
    assert.ok(line.endsWith(' .'), `canonical ${ext} triple must end in " .": ${line}`);
    if (graph) out.push(`${line.slice(0, -2)} ${graph} .`);
    else out.push(line);
  }
  return out.length ? `${out.join('\n')}\n` : '';
}

let rdfParseAvailable = true;
try {
  await import('rdf-parse');
} catch (error) {
  if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  rdfParseAvailable = false;
}

for (const { base, ext } of inputFiles) {
  const inputRdfPath = path.join(examplesDir, `${base}-input.${ext}`);
  const inputPlPath = path.join(examplesDir, `${base}-input.pl`);
  const rulesPath = path.join(examplesDir, `${base}-rules.pl`);
  const outputPlPath = path.join(examplesDir, `${base}-output.pl`);
  const outputRdfPath = path.join(examplesDir, `${base}-output.${ext}`);

  for (const required of [inputRdfPath, inputPlPath, rulesPath, outputPlPath, outputRdfPath]) {
    await fs.access(required);
  }
  ok(`${base}: five-file layout`);

  const [inputPl, rules, outputPl, outputRdf] = await Promise.all([
    fs.readFile(inputPlPath, 'utf8'),
    fs.readFile(rulesPath, 'utf8'),
    fs.readFile(outputPlPath, 'utf8'),
    fs.readFile(outputRdfPath, 'utf8'),
  ]);

  const inputNq = extractRdfFromProlog(inputPl);
  assert.ok(inputNq.trim(), `${base}: input.pl contains no rdf/4 facts`);
  const inputRoundtrip = extractRdfFromProlog(compileRdfToProlog(inputNq, { scope: `${base}:input` }));
  assertSameDataset(inputRoundtrip, inputNq, `${base}: input Prolog facts do not roundtrip`);
  ok(`${base}: input.pl RDF roundtrip`);

  assert.match(rules, /\bresult_rdf\s*\(/, `${base}: rules.pl must expose result_rdf/4`);
  assert.match(rules, /\bwrite_results\s*:-/, `${base}: rules.pl must expose write_results/0`);
  assert.doesNotMatch(
    rules,
    /\b(?:number_string|atom_string|string_concat)\s*\(/,
    `${base}: rules.pl contains a non-ISO string helper`,
  );
  ok(`${base}: ISO-style rules contract`);

  const outputNq = extractRdfFromProlog(outputPl);
  assert.ok(outputNq.trim(), `${base}: output.pl contains no rdf/4 result facts`);
  const serialized = serializeRdfFromProlog(outputPl, { format: ext });
  assert.equal(serialized, outputRdf, `${base}: output RDF is not the pl-to-rdf result`);
  ok(`${base}: output.pl -> output.${ext}`);

  const canonicalNq = canonicalOutputToNQuads(outputRdf, ext);
  assertSameDataset(canonicalNq, outputNq, `${base}: serialized RDF changed the output dataset`);
  const outputRoundtrip = extractRdfFromProlog(compileRdfToProlog(canonicalNq, { scope: `${base}:output` }));
  assertSameDataset(outputRoundtrip, outputNq, `${base}: output RDF -> Prolog -> RDF changed the dataset`);
  ok(`${base}: output RDF roundtrip`);

  const sourceTestName = `${base}: original ${ext.toUpperCase()} -> input.pl`;
  if (!rdfParseAvailable) {
    skip(sourceTestName, 'rdf-parse is not installed');
    continue;
  }

  const source = await fs.readFile(inputRdfPath, 'utf8');
  const sourceProgram = await compileRdfDocumentToProlog(source, {
    inputPath: inputRdfPath,
    scope: `${base}-input.${ext}`,
    baseIRI: pathToFileURL(inputRdfPath).href,
  });
  assertSameDataset(extractRdfFromProlog(sourceProgram), inputNq, `${base}: checked-in input.pl is stale`);
  ok(sourceTestName);
}

const visible = names.filter((name) => !name.startsWith('.'));
assert.equal(visible.length, 71, 'expected README + 14 x 5 example files');
ok('examples/: exactly README + 14 five-file examples');

console.log(`1..${passed + skipped}`);
console.log(`# pass ${passed}`);
if (skipped) console.log(`# skip ${skipped}`);
