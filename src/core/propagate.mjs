const STATUS_FACTOR = {
  valid: 1,
  supported: 1,
  needs_review: 0.5,
  unsupported: 0,
  invalidated: 0
};

function topologicalOrder(nodes, edges) {
  const indegree = new Map(nodes.map((n) => [n.id, 0]));
  const outgoing = new Map(nodes.map((n) => [n.id, []]));
  for (const edge of edges) {
    indegree.set(edge.to, (indegree.get(edge.to) || 0) + 1);
    outgoing.get(edge.from)?.push(edge.to);
  }
  const queue = [...nodes.filter((n) => (indegree.get(n.id) || 0) === 0).map((n) => n.id)];
  const order = [];
  while (queue.length) {
    const id = queue.shift();
    order.push(id);
    for (const next of outgoing.get(id) || []) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }
  if (order.length !== nodes.length) throw new Error('Verified support graph must be acyclic for deterministic propagation');
  return order;
}

function pathFromSource(sourceId, targetId, edges) {
  const queue = [[sourceId]];
  const seen = new Set([sourceId]);
  while (queue.length) {
    const path = queue.shift();
    const tail = path[path.length - 1];
    if (tail === targetId) return path;
    for (const edge of edges.filter((e) => e.from === tail)) {
      if (!seen.has(edge.to)) {
        seen.add(edge.to);
        queue.push([...path, edge.to]);
      }
    }
  }
  return [];
}

export function propagateInvalidation(graph, sourceId, reason = '') {
  const nodes = new Map(graph.nodes.map((n) => [n.id, { ...n }]));
  const edges = graph.edges.filter((e) => e.relation === 'supports' && e.verified);
  if (!nodes.has(sourceId)) throw new Error(`Unknown source node: ${sourceId}`);

  const reachable = new Set([sourceId]);
  const reachQueue = [sourceId];
  while (reachQueue.length) {
    const from = reachQueue.shift();
    for (const edge of edges.filter((e) => e.from === from)) {
      if (!reachable.has(edge.to)) {
        reachable.add(edge.to);
        reachQueue.push(edge.to);
      }
    }
  }

  const source = nodes.get(sourceId);
  source.status = 'invalidated';
  source.invalidationReason = reason;

  const order = topologicalOrder(graph.nodes, edges);
  for (const id of order) {
    if (id === sourceId || !reachable.has(id)) continue;
    const node = nodes.get(id);
    const incoming = edges.filter((e) => e.to === id);
    if (!incoming.length) continue;

    const baseline = incoming.reduce((sum, edge) => sum + edge.weight, 0);
    const supports = incoming.map((edge) => {
      const parent = nodes.get(edge.from);
      const factor = STATUS_FACTOR[parent.status] ?? 1;
      return { edge, parent, factor, effective: edge.weight * factor };
    });
    const remaining = supports.reduce((sum, item) => sum + item.effective, 0);
    const lost = Math.max(0, baseline - remaining);
    const lostRatio = baseline ? lost / baseline : 0;

    if (lostRatio >= 0.70 && remaining < 0.45) {
      node.status = 'unsupported';
    } else if (lostRatio >= 0.30) {
      node.status = 'needs_review';
    } else {
      node.status = 'supported';
    }

    const broken = supports.filter((item) => item.factor < 1).map((item) => ({
      from: item.parent.id,
      label: item.parent.label,
      weight: item.edge.weight,
      retainedFactor: item.factor,
      counterfactual: item.edge.counterfactual || ''
    }));
    const surviving = supports.filter((item) => item.factor === 1).map((item) => ({
      from: item.parent.id,
      label: item.parent.label,
      weight: item.edge.weight,
      counterfactual: item.edge.counterfactual || ''
    }));

    node.impact = {
      baselineSupport: Number(baseline.toFixed(3)),
      remainingSupport: Number(remaining.toFixed(3)),
      supportLoss: Number(lost.toFixed(3)),
      supportLossRatio: Number(lostRatio.toFixed(3)),
      broken,
      surviving,
      path: pathFromSource(sourceId, id, edges)
    };
  }

  const impacted = [...nodes.values()]
    .filter((n) => n.id !== sourceId && reachable.has(n.id))
    .sort((a, b) => {
      const severity = { unsupported: 3, needs_review: 2, supported: 1 };
      return (severity[b.status] - severity[a.status]) || ((b.impact?.supportLossRatio || 0) - (a.impact?.supportLossRatio || 0));
    });

  return { source, nodes: [...nodes.values()], impacted };
}
