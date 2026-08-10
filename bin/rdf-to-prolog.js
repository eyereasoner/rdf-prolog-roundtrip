#!/usr/bin/env node
import { rdfToPrologCli } from '../src/rdf-to-prolog.mjs';
rdfToPrologCli().catch((error) => {
  process.stderr.write(`rdf-to-prolog: ${error.message}\n`);
  process.exitCode = 1;
});
