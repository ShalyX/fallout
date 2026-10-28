import { atlasGraph, defaultInvalidation } from './src/data/atlas.mjs';
import { propagateInvalidation } from './src/core/propagate.mjs';

const baselineNodes = atlasGraph.nodes.map((node) => ({
  ...node,
  status: node.type === 'evidence' ? 'valid' : 'supported'
}));

const state = {
  selected: 'E17',
  invalidated: false,
  nodes: baselineNodes,
  result: null
};

const layer = document.querySelector('#nodeLayer');
const edgeLayer = document.querySelector('#edgeLayer');
const invalidateBtn = document.querySelector('#invalidateBtn');
const invalidateForm = document.querySelector('#invalidateForm');

function nodeById(id) {
  return state.nodes.find((node) => node.id === id) || atlasGraph.nodes.find((node) => node.id === id);
}

function baselineNodeById(id) {
  return atlasGraph.nodes.find((node) => node.id === id);
}

function svgPoint(node) {
  return { x: (node.x / 100) * 1000, y: (node.y / 100) * 700 };
}

function statusLabel(status) {
  return ({
    valid: 'VALID',
    supported: 'SUPPORTED',
    needs_review: 'NEEDS REVIEW',
    unsupported: 'UNSUPPORTED',
    invalidated: 'INVALIDATED'
  })[status] || status.toUpperCase();
}

function displayId(id) {
  return id.replace(/^([A-Z])(\d+)$/, '$1-$2');
}

function renderEdges() {
  edgeLayer.innerHTML = '';
  for (const edge of atlasGraph.edges) {
    const a = svgPoint(baselineNodeById(edge.from));
    const b = svgPoint(baselineNodeById(edge.to));
    const c1x = a.x + (b.x - a.x) * 0.52;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${a.x} ${a.y} C ${c1x} ${a.y}, ${c1x} ${b.y}, ${b.x} ${b.y}`);
    path.setAttribute('class', 'edge');
    path.dataset.from = edge.from;
    path.dataset.to = edge.to;
    path.dataset.id = edge.id;
    edgeLayer.appendChild(path);
  }
  updateEdgeStates();
}

function updateEdgeStates() {
  edgeLayer.querySelectorAll('.edge').forEach((path) => {
    path.classList.remove('affected', 'review', 'secondary');
    if (!state.result) return;
    const target = nodeById(path.dataset.to);
    const targetImpact = target?.impact;
    if (!targetImpact?.path?.includes(path.dataset.from) || !targetImpact.path.includes(path.dataset.to)) return;
    if (target.status === 'unsupported') path.classList.add('affected');
    else if (target.status === 'needs_review') path.classList.add('review');
    else if (target.status === 'supported') path.classList.add('secondary');
  });
}

function renderNodes() {
  layer.innerHTML = '';
  for (const node of state.nodes) {
    const element = document.createElement('button');
    element.className = `node ${node.status} ${state.selected === node.id ? 'selected' : ''}`;
    element.style.left = `${node.x}%`;
    element.style.top = `${node.y}%`;
    element.dataset.id = node.id;
    element.innerHTML = `
      <div class="node-top">
        <span class="node-kind">${node.type.toUpperCase()} · ${node.id}</span>
        <span class="node-state"></span>
      </div>
      <h3>${node.label}</h3>
      <p>${node.summary}</p>`;
    element.addEventListener('click', () => selectNode(node.id));
    layer.appendChild(element);
  }
}

function renderDependencies(node) {
  const list = document.querySelector('#dependencyList');
  const meter = document.querySelector('#supportMeter');
  list.innerHTML = '';

  if (node.impact) {
    meter.classList.remove('hidden');
    const retained = Math.max(0, 1 - node.impact.supportLossRatio);
    const fill = document.querySelector('#supportMeterFill');
    fill.style.width = `${Math.round(retained * 100)}%`;
    fill.className = `support-meter-fill ${node.status}`;
    document.querySelector('#supportRemaining').textContent = `${Math.round(retained * 100)}% support retained`;
    document.querySelector('#supportLost').textContent = `${Math.round(node.impact.supportLossRatio * 100)}% lost`;

    const rows = [
      ...node.impact.broken.map((item) => ({ ...item, kind: item.retainedFactor === 0 ? 'broken' : 'degraded', note: item.counterfactual || 'Support weakened after invalidation.' })),
      ...node.impact.surviving.map((item) => ({ ...item, kind: 'surviving', note: item.counterfactual || 'Independent support remains.' }))
    ];
    document.querySelector('#supportLabel').textContent = 'SUPPORT AFTER INVALIDATION';
    document.querySelector('#supportCount').textContent = `${rows.length} incoming edges`;
    list.innerHTML = rows.map((row) => `
      <div class="dependency-row ${row.kind === 'surviving' ? '' : row.kind}">
        <b>${row.kind === 'surviving' ? 'SURVIVES' : row.kind === 'broken' ? 'BROKEN' : 'DEGRADED'} · ${row.label}</b>
        <span>${row.note}</span>
      </div>`).join('');
    return;
  }

  meter.classList.add('hidden');
  const incoming = atlasGraph.edges.filter((edge) => edge.to === node.id && edge.verified);
  const outgoing = atlasGraph.edges.filter((edge) => edge.from === node.id && edge.verified);
  const edges = incoming.length ? incoming : outgoing;
  document.querySelector('#supportLabel').textContent = incoming.length ? 'VERIFIED SUPPORT' : 'DOWNSTREAM SUPPORT';
  document.querySelector('#supportCount').textContent = `${edges.length} ${edges.length === 1 ? 'edge' : 'edges'}`;

  if (!edges.length) {
    list.innerHTML = '<div class="dependency-row"><b>NO VERIFIED EDGES</b><span>This node is isolated in the current fixture.</span></div>';
    return;
  }

  list.innerHTML = edges.map((edge) => {
    const otherId = incoming.length ? edge.from : edge.to;
    const other = baselineNodeById(otherId);
    return `
      <div class="dependency-row">
        <b>${incoming.length ? 'SUPPORTED BY' : 'SUPPORTS'} · ${other.label}</b>
        <span>${edge.counterfactual}</span>
      </div>`;
  }).join('');
}

function selectNode(id) {
  state.selected = id;
  renderNodes();
  const node = nodeById(id);
  document.querySelector('#selectedKind').textContent = `SELECTED ${node.type.toUpperCase()}`;
  document.querySelector('#selectedId').textContent = displayId(id);
  document.querySelector('#selectedTitle').textContent = node.label;
  document.querySelector('#selectedSummary').textContent = node.summary;
  document.querySelector('#sourceMeta').textContent = `${node.source.file} · ${node.source.section}`;
  document.querySelector('#sourceExcerpt').textContent = `“${node.source.excerpt}”`;

  const pill = document.querySelector('#statusPill');
  pill.textContent = statusLabel(node.status);
  pill.className = `status-pill ${node.status === 'invalidated' ? 'invalid' : node.status}`;

  const canInvalidate = node.type === 'evidence' && node.id === 'E17' && !state.invalidated;
  invalidateBtn.classList.toggle('hidden', !canInvalidate);
  if (!canInvalidate) invalidateForm.classList.remove('open');
  renderDependencies(node);
}

function renderImpact() {
  const businessItems = state.result.impacted.filter((node) => node.type === 'decision' || node.type === 'artifact');
  const counts = {
    unsupported: businessItems.filter((node) => node.status === 'unsupported').length,
    needs_review: businessItems.filter((node) => node.status === 'needs_review').length,
    supported: businessItems.filter((node) => node.status === 'supported').length
  };

  document.querySelector('#impactHeadline').textContent = `${businessItems.length} downstream items changed`; 
  document.querySelector('#unsupportedCount').textContent = counts.unsupported;
  document.querySelector('#reviewCount').textContent = counts.needs_review;
  document.querySelector('#supportedCount').textContent = counts.supported;

  const list = document.querySelector('#impactList');
  list.innerHTML = '';
  for (const node of businessItems) {
    const button = document.createElement('button');
    button.className = `impact-item ${node.status}`;
    const surviving = node.impact?.surviving?.[0];
    const detail = node.status === 'unsupported'
      ? 'Primary rationale lost'
      : node.status === 'needs_review'
        ? `${surviving?.label || 'Independent support'} remains`
        : 'Primary independent support intact';
    button.innerHTML = `
      <b>${node.label}</b>
      <span>${statusLabel(node.status)} · ${detail}</span>
      <div class="loss">${Math.round((node.impact?.supportLossRatio || 0) * 100)}% support lost</div>`;
    button.addEventListener('click', () => selectNode(node.id));
    list.appendChild(button);
  }
  document.querySelector('#impactDrawer').classList.add('open');
}

function invalidate() {
  const reason = document.querySelector('#reason').value.trim() || defaultInvalidation.reason;
  state.result = propagateInvalidation(atlasGraph, 'E17', reason);
  state.nodes = state.result.nodes;
  state.invalidated = true;
  state.selected = 'E17';
  invalidateForm.classList.remove('open');

  const dot = document.querySelector('#rail-dot-E17');
  dot.classList.remove('valid');
  dot.classList.add('invalid');

  const source = baselineNodeById('E17');
  const ripple = document.querySelector('#ripple');
  ripple.style.left = `${source.x}%`;
  ripple.style.top = `${source.y}%`;
  ripple.classList.remove('play');
  void ripple.offsetWidth;
  ripple.classList.add('play');

  setTimeout(() => {
    renderNodes();
    updateEdgeStates();
    selectNode('E17');
    renderImpact();
  }, 280);
}

function reset() {
  state.invalidated = false;
  state.selected = 'E17';
  state.result = null;
  state.nodes = baselineNodes.map((node) => ({ ...node }));
  document.querySelector('#impactDrawer').classList.remove('open');
  invalidateForm.classList.remove('open');
  const dot = document.querySelector('#rail-dot-E17');
  dot.classList.add('valid');
  dot.classList.remove('invalid');
  renderNodes();
  updateEdgeStates();
  selectNode('E17');
}

invalidateBtn.addEventListener('click', () => invalidateForm.classList.toggle('open'));
document.querySelector('#confirmBtn').addEventListener('click', invalidate);
document.querySelector('#resetBtn').addEventListener('click', reset);
document.querySelectorAll('[data-select]').forEach((button) => button.addEventListener('click', () => selectNode(button.dataset.select)));

const architectureOverlay = document.querySelector('#architectureOverlay');
document.querySelector('#architectureBtn').addEventListener('click', () => {
  architectureOverlay.classList.add('open');
  architectureOverlay.setAttribute('aria-hidden', 'false');
});
document.querySelector('#closeArchitectureBtn').addEventListener('click', () => {
  architectureOverlay.classList.remove('open');
  architectureOverlay.setAttribute('aria-hidden', 'true');
});
architectureOverlay.addEventListener('click', (event) => {
  if (event.target === architectureOverlay) {
    architectureOverlay.classList.remove('open');
    architectureOverlay.setAttribute('aria-hidden', 'true');
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    architectureOverlay.classList.remove('open');
    architectureOverlay.setAttribute('aria-hidden', 'true');
  }
});

document.querySelector('#workspaceName').textContent = atlasGraph.workspace;
document.querySelector('#workspaceMeta').textContent = `${atlasGraph.nodes.length} nodes · ${atlasGraph.edges.length} verified edges`;
renderEdges();
renderNodes();
selectNode('E17');
