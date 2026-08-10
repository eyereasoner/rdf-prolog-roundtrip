% Join graph metadata in the default graph with data from the named graph.
result_rdf(S, iri('https://example.org/reportedBy'), Station, default_graph) :-
  rdf(
    iri('https://example.org/sensorGraph'),
    iri('https://example.org/reportedBy'),
    Station,
    default_graph
  ),
  rdf(
    S,
    iri('https://example.org/temperature'),
    _,
    iri('https://example.org/sensorGraph')
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
