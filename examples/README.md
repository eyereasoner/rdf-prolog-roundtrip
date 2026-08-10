# Examples

There are 14 examples. They are deliberately flat: every example is the same
five-file pipeline.

```text
<name>-input.ttl|trig   RDF input
<name>-input.pl         rdf-to-prolog result
<name>-rules.pl         ISO Prolog rules
<name>-output.pl        Prolog test result as ground rdf/4 facts
<name>-output.ttl|trig  prolog-to-rdf result
```

Every `*-rules.pl` exposes the same two predicates:

```prolog
result_rdf(S, P, O, G).  % enumerate the result
write_results.           % print every result as an rdf/4 fact
```

## Example: trust flow

The five files are:

```text
odrl-dpv-fpv-trust-flow-input.ttl
odrl-dpv-fpv-trust-flow-input.pl
odrl-dpv-fpv-trust-flow-rules.pl
odrl-dpv-fpv-trust-flow-output.pl
odrl-dpv-fpv-trust-flow-output.ttl
```

Regenerate the input Prolog facts:

```sh
rdf-to-prolog examples/odrl-dpv-fpv-trust-flow-input.ttl \
  -o examples/odrl-dpv-fpv-trust-flow-input.pl
```

Load the input and rules in an ISO-style Prolog engine and query:

```prolog
?- result_rdf(S, P, O, G).
```

Or run `write_results/0` to print the complete result as `rdf/4` facts. For
example, using SWI-Prolog as the command-line host:

```sh
swipl -q \
  -s examples/odrl-dpv-fpv-trust-flow-input.pl \
  -s examples/odrl-dpv-fpv-trust-flow-rules.pl \
  -g write_results -t halt \
  > examples/odrl-dpv-fpv-trust-flow-output.pl
```

The rules themselves use ISO-style Prolog; only the `swipl` command-line flags
above are SWI-specific.

Convert the Prolog result back to RDF:

```sh
prolog-to-rdf examples/odrl-dpv-fpv-trust-flow-output.pl \
  -o examples/odrl-dpv-fpv-trust-flow-output.ttl
```

For TriG inputs, the final filename is `*-output.trig` and named graphs are
preserved.
