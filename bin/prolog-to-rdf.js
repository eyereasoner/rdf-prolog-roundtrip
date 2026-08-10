#!/usr/bin/env node
import { prologToRdfCli } from '../src/prolog-to-rdf.mjs';
prologToRdfCli().catch((error) => {
  process.stderr.write(`prolog-to-rdf: ${error.message}\n`);
  process.exitCode = 1;
});
