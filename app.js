import { atlasGraph, defaultInvalidation } from './src/data/atlas.mjs';
import { propagateInvalidation } from './src/core/propagate.mjs';

const baselineNodes = atlasGraph.nodes.map((node) => ({
  ...node,
  status: node.type === 'evidence' ? 'valid' : 'supported'
}));

const state = {
  selected: null,
  invalidated: false,
  nodes: baselineNodes,
  result: null
};

const layer = document.querySelector('#nodeLayer');
const edgeLayer = document.querySelector('#edgeLayer');
const inspector = document.querySelector('#inspector');
const invalidateBtn = document.querySelector('#invalidateBtn');
const invalidateForm = document.querySelector('#invalidateForm');

function nodeById(id) {
  return state.nodes.find((node) => node.id === id) || atlasGraph.nodes.find((node) => node.id === id);
}

function baselineNodeById(id) {
  return atlasGraph.nodes.find((node) => node.id === id);
}

function visualPoint(node) {
  const xByType = { evidence: 16, claim: 48, decision: 82, artifact: 82 };
  return { x: xByType[node.type] ?? node.x, y: node.y };
}

function svgPoint(node) {
  const point = visualPoint(node);
  return { x: (point.x / 100) * 1000, y: (point.y / 100) * 700 };
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

function openInspector() {
  inspector.classList.add('open');
  inspector.setAttribute('aria-hidden', 'false');
}

function closeInspector() {
  state.selected = null;
  inspector.classList.remove('open');
  inspector.setAttribute('aria-hidden', 'true');
  invalidateForm.classList.remove('open');
  renderNodes();
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
    const impact = target?.impact;
    if (!impact) return;

    const broken = impact.broken?.some((item) => item.from === path.dataset.from);
    const surviving = impact.surviving?.some((item) => item.from === path.dataset.from);

    if (broken && target.status === 'unsupported') path.classList.add('affected');
    else if (broken) path.classList.add('review');
    else if (surviving) path.classList.add('secondary');
  });
}

function renderNodes() {
  layer.innerHTML = '';
  for (const node of state.nodes) {
    const position = visualPoint(node);
    const element = document.createElement('button');
    element.className = `node ${node.status} ${state.selected === node.id ? 'selected' : ''}`;
    element.style.left = `${position.x}%`;
    element.style.top = `${position.y}%`;
    element.dataset.id = node.id;
    element.innerHTML = `
      <span class="node-copy">
        <span class="node-kind">${node.type.toUpperCase()} · ${displayId(node.id)}</span>
        <h3>${node.label}</h3>
        <p>${node.summary}</p>
      </span>`;
    element.addEventListener('click', () => selectNode(node.id));
    layer.appendChild(element);
  }
}

function renderDependencies(node) {
  const list = document.querySelector('#dependencyList');
  const meter = document.querySelector('#supportMeter');
  list.innerHTML = '';

  if (node.impact) {
    meter.classList.add('hidden');
    const rows = [
      ...node.impact.broken.map((item) => ({ ...item, kind: item.retainedFactor === 0 ? 'broken' : 'degraded', note: item.counterfactual || 'Support weakened after invalidation.' })),
      ...node.impact.surviving.map((item) => ({ ...item, kind: 'surviving', note: item.counterfactual || 'Independent support remains.' }))
    ];
    const weakened = rows.filter((row) => row.kind !== 'surviving').length;
    const surviving = rows.length - weakened;
    document.querySelector('#supportLabel').textContent = 'SUPPORT AFTER INVALIDATION';
    document.querySelector('#supportCount').textContent = `${weakened} weakened · ${surviving} survives`;
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
  document.querySelector('#selectedKind').textContent = node.type.toUpperCase();
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
  openInspector();
}

function renderImpact() {
  const businessItems = state.result.impacted.filter((node) => node.type === 'decision' || node.type === 'artifact');
  const actionItems = businessItems.filter((node) => node.status !== 'supported');
  const counts = {
    unsupported: businessItems.filter((node) => node.status === 'unsupported').length,
    needs_review: businessItems.filter((node) => node.status === 'needs_review').length,
    supported: businessItems.filter((node) => node.status === 'supported').length
  };

  document.querySelector('#unsupportedCount').textContent = counts.unsupported;
  document.querySelector('#reviewCount').textContent = counts.needs_review;
  document.querySelector('#supportedCount').textContent = counts.supported;
  document.querySelector('#affectedCount').textContent = state.result.impacted.filter((node) => node.status !== 'supported').length;
  document.querySelector('#decisionRiskCount').textContent = actionItems.filter((node) => node.type === 'decision').length;
  document.querySelector('#stillSupportedHero').textContent = counts.supported;

  const list = document.querySelector('#impactList');
  list.innerHTML = '';
  for (const node of actionItems) {
    const button = document.createElement('button');
    button.className = `impact-item ${node.status}`;
    const surviving = node.impact?.surviving?.[0];
    const detail = node.status === 'unsupported'
      ? 'Primary rationale lost'
      : `${surviving?.label || 'Independent support'} remains, but revalidation is required`;
    const weakenedCount = node.impact?.broken?.length || 0;
    const survivingCount = node.impact?.surviving?.length || 0;
    const pathSummary = survivingCount
      ? `${weakenedCount} weakened path${weakenedCount === 1 ? '' : 's'} · ${survivingCount} independent path${survivingCount === 1 ? '' : 's'} survives`
      : `${weakenedCount} support path${weakenedCount === 1 ? '' : 's'} broken`;
    button.innerHTML = `
      <b>${displayId(node.id)} · ${node.label}</b>
      <span>${detail}</span>
      <div class="loss">${statusLabel(node.status)} · ${pathSummary}</div>`;
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
  document.body.classList.add('is-fallout');

  const source = visualPoint(baselineNodeById('E17'));
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
    if (window.innerWidth <= 1100) {
      setTimeout(() => {
        const graph = document.querySelector('#graphStage');
        const top = graph.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
      }, 80);
    }
  }, 300);
}

function reset() {
  state.invalidated = false;
  state.selected = null;
  state.result = null;
  state.nodes = baselineNodes.map((node) => ({ ...node }));
  document.body.classList.remove('is-fallout');
  document.querySelector('#impactDrawer').classList.remove('open');
  invalidateForm.classList.remove('open');
  inspector.classList.remove('open');
  inspector.setAttribute('aria-hidden', 'true');
  renderNodes();
  updateEdgeStates();
}

invalidateBtn.addEventListener('click', () => invalidateForm.classList.toggle('open'));
document.querySelector('#confirmBtn').addEventListener('click', invalidate);
document.querySelector('#resetBtn').addEventListener('click', reset);
document.querySelector('#closeInspectorBtn').addEventListener('click', closeInspector);
document.querySelector('#primaryInvalidateCta').addEventListener('click', () => {
  selectNode('E17');
  invalidateForm.classList.add('open');
  if (window.innerWidth > 1100) {
    setTimeout(() => document.querySelector('#reason').focus(), 100);
  } else {
    setTimeout(() => inspector.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
});

document.querySelector('#impactNav').addEventListener('click', () => {
  if (state.invalidated) document.querySelector('#impactDrawer').scrollIntoView({ behavior: 'smooth', block: 'end' });
});

const architectureOverlay = document.querySelector('#architectureOverlay');
function openArchitecture() {
  architectureOverlay.classList.add('open');
  architectureOverlay.setAttribute('aria-hidden', 'false');
}
function closeArchitecture() {
  architectureOverlay.classList.remove('open');
  architectureOverlay.setAttribute('aria-hidden', 'true');
}
document.querySelector('#architectureBtn').addEventListener('click', openArchitecture);
document.querySelector('#architectureNav').addEventListener('click', openArchitecture);
document.querySelector('#closeArchitectureBtn').addEventListener('click', closeArchitecture);
architectureOverlay.addEventListener('click', (event) => {
  if (event.target === architectureOverlay) closeArchitecture();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeArchitecture();
    if (state.selected) closeInspector();
  }
});

document.querySelector('#workspaceName').textContent = atlasGraph.workspace;
renderEdges();
renderNodes();
