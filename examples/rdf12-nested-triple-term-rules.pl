% Match nested RDF 1.2 triple terms and derive the innermost relationship.
result_rdf(S, iri('https://example.org/knows'), O, G) :-
  rdf(
    _,
    iri('https://example.org/reviews'),
    triple(
      _,
      iri('https://example.org/claims'),
      triple(S, iri('https://example.org/knows'), O)
    ),
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
