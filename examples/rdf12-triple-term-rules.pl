% Project an RDF 1.2 triple term into an ordinary asserted relationship.
result_rdf(S, iri('https://example.org/knows'), O, G) :-
  rdf(
    _,
    iri('https://example.org/claims'),
    triple(S, iri('https://example.org/knows'), O),
    G
  ).
%% goal: result_rdf(_, _, _, _)

% ISO Prolog helper: print the complete test result as rdf/4 facts.
write_results :-
  result_rdf(S, P, O, G),
  write_term(rdf(S, P, O, G), [quoted(true)]),
  write('.'),
  nl,
  fail.
write_results.
