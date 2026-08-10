% Preserve RDF 1.2 base-direction metadata while deriving display labels.
%% goal: result_rdf(_, _, _, _)

result_rdf(S, iri('https://example.org/displayLabel'), Label, G) :-
  rdf(S, iri('https://example.org/label'), Label, G).

% ISO Prolog helper: print the complete test result as rdf/4 facts.
write_results :-
  result_rdf(S, P, O, G),
  write_term(rdf(S, P, O, G), [quoted(true)]),
  write('.'),
  nl,
  fail.
write_results.
