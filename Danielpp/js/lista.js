const listContainer = document.getElementById('entityList');

function getFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return { type: params.get('type'), tag: params.get('tag') };
}

function renderBreadcrumb(type, tag) {
  const current = document.getElementById('breadcrumbCurrent');
  if (!current) return;
  let text = EntityLabels[type] || type;
  if (tag) text += ` › ${tag}`;
  current.textContent = text;
}

async function loadEntityList() {
  const { type, tag } = getFiltersFromUrl();
  if (!type) { listContainer.innerHTML = `<p>Tipo de entidade não informado.</p>`; return; }
  renderBreadcrumb(type, tag);
  await loadEntitiesOnce();
  let entities = EntityStore.byType.get(type) || [];
  if (tag) entities = entities.filter(e => e.tags?.includes(tag));
  if (!entities.length) {
    listContainer.innerHTML = `<p>Nenhum registro encontrado.</p>`; return;
  }
  listContainer.innerHTML = entities.map(e => `
    <a href="entidade.html?slug=${e.slug}" class="list__item">
      <strong>${e.name}</strong>
      <span>${e.shortDesc || ''}</span>
    </a>
  `).join('');
}

document.addEventListener('DOMContentLoaded', loadEntityList);
