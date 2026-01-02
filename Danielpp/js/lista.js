const listContainer = document.getElementById('entityList');

function getFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return { type: params.get('type'), tag: params.get('tag') };
}

async function loadEntityList() {
  const { type, tag } = getFiltersFromUrl();
  const titleEl = document.querySelector('.page-title');
  
  if (!type) { 
    if(listContainer) listContainer.innerHTML = `<p>Selecione uma categoria no menu.</p>`; 
    return; 
  }

  // Atualiza Título
  if(titleEl && window.EntityLabels) titleEl.textContent = window.EntityLabels[type] || type;

  // Carrega Dados
  await loadEntitiesOnce();
  
  let entities = EntityStore.byType.get(type) || [];
  
  // Filtra por tag se existir
  if (tag) {
    const searchTag = tag.toLowerCase();
    entities = entities.filter(e => e.tags && e.tags.map(t=>t.toLowerCase()).includes(searchTag));
  }

  if (!entities.length) {
    listContainer.innerHTML = `<p class="text-muted">Nenhum registo encontrado.</p>`; 
    return;
  }

  listContainer.innerHTML = entities.map(e => `
    <a href="entidade.html?slug=${e.slug}" class="list__item">
      <strong>${e.name}</strong>
      <span>${e.shortDesc || 'Sem descrição'}</span>
      <div style="margin-top:auto; padding-top:10px;">
         <span class="tag" style="font-size:0.7rem">${window.EntityLabels[e.type] || e.type}</span>
      </div>
    </a>
  `).join('');
}

document.addEventListener('DOMContentLoaded', loadEntityList);