% Recover an asserted triple together with its RDF 1.2 annotations.
%% goal: result_rdf(_, _, _, _)

annotated_claim(S, P, O, Reifier, Source, Date) :-
  rdf(S, P, O, default_graph),
  rdf(
    Reifier,
    iri('http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies'),
    triple(S, P, O),
    default_graph
  ),
  rdf(
    Reifier,
    iri('https://example.org/statedBy'),
    Source,
    default_graph
  ),
  rdf(
    Reifier,
    iri('https://example.org/recorded'),
    Date,
    default_graph
  ).

% RDF form of the recovered annotated claim.
result_rdf(S, P, O, default_graph) :-
  annotated_claim(S, P, O, _Reifier, _Source, _Date).
result_rdf(Reifier, iri('http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies'), triple(S, P, O), default_graph) :-
  annotated_claim(S, P, O, Reifier, _Source, _Date).
result_rdf(Reifier, iri('https://example.org/statedBy'), Source, default_graph) :-
  annotated_claim(_S, _P, _O, Reifier, Source, _Date).
result_rdf(Reifier, iri('https://example.org/recorded'), Date, default_graph) :-
  annotated_claim(_S, _P, _O, Reifier, _Source, Date).

% ISO Prolog helper: print the complete test result as rdf/4 facts.
write_results :-
  result_rdf(S, P, O, G),
  write_term(rdf(S, P, O, G), [quoted(true)]),
  write('.'),
  nl,
  fail.
write_results.
