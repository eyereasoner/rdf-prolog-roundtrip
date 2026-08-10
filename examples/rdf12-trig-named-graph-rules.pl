% Derive relationships inside the named graph that supplied the source data.
result_rdf(S, iri('https://example.org/ancestor'), O, G) :-
  rdf(S, iri('https://example.org/parent'), O, G).

result_rdf(S, iri('https://example.org/ancestor'), O, G) :-
  rdf(S, iri('https://example.org/parent'), M, G),
  rdf(M, iri('https://example.org/parent'), O, G).
%% goal: result_rdf(_, _, _, _)

% ISO Prolog helper: print the complete test result as rdf/4 facts.
write_results :-
  result_rdf(S, P, O, G),
  write_term(rdf(S, P, O, G), [quoted(true)]),
  write('.'),
  nl,
  fail.
write_results.
