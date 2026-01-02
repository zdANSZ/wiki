const listContainer = document.getElementById('entityList');
const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
const pageTitle = document.querySelector('.page-title'); // Se houver um título na página
const pageDescription = document.querySelector('.page-description');

function getFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return { 
    type: params.get('type'), 
    tag: params.get('tag') 
  };
}

function updateHeader(type, tag) {
  const typeLabel = window.EntityLabels ? (window.EntityLabels[type] || type) : type;
  
  // Atualiza Título da Página (se elemento existir)
  if (pageTitle) {
    pageTitle.textContent = tag ? `${typeLabel}: ${tag}` : typeLabel;
  }
  
  // Atualiza Descrição (se elemento existir)
  if (pageDescription) {
    pageDescription.textContent = tag 
      ? `Listando todos os registros de ${typeLabel} com a tag "${tag}".`
      : `Explorar todos os registros de ${typeLabel}.`;
  }

  // Atualiza Breadcrumb
  // Estrutura esperada no HTML: <nav class="breadcrumb"> ... <span id="breadcrumbCurrent"></span> </nav>
  if (breadcrumbCurrent) {
    const nav = breadcrumbCurrent.parentElement;
    
    // Reconstrói o breadcrumb para garantir formato correto
    let html = `
      <a href="index.html">Home</a>
      <span class="breadcrumb__sep">/</span>
      <a href="lista.html?type=${type}">${typeLabel}</a>
    `;

    if (tag) {
      html += `
        <span class="breadcrumb__sep">/</span>
        <span class="breadcrumb__current">${tag}</span>
      `;
    }

    nav.innerHTML = html;
  }
}

async function loadEntityList() {
  const { type, tag } = getFiltersFromUrl();

  if (!type) {
    if (listContainer) listContainer.innerHTML = `<p style="color:var(--color-text-muted)">Selecione uma categoria no menu para começar.</p>`;
    return;
  }

  // 1. Atualiza textos e breadcrumb
  updateHeader(type, tag);

  // 2. Garante que os dados foram carregados
  if (window.loadEntitiesOnce) await window.loadEntitiesOnce();
  
  if (!window.EntityStore || !window.EntityStore.byType) {
    console.error("EntityStore não inicializado.");
    return;
  }

  // 3. Filtra as entidades
  let entities = window.EntityStore.byType.get(type) || [];

  if (tag) {
    const searchTag = tag.toLowerCase();
    // Filtra verificando se a tag existe no array de tags da entidade
    entities = entities.filter(e => 
      e.tags && Array.isArray(e.tags) && e.tags.some(t => t.toLowerCase() === searchTag)
    );
  }

  // 4. Renderiza
  if (!entities.length) {
    listContainer.innerHTML = `<p style="color:var(--color-text-muted)">Nenhum registro encontrado nesta categoria.</p>`;
    return;
  }

  listContainer.innerHTML = entities.map(e => `
    <a href="entidade.html?slug=${e.slug}" class="card list__item">
      <div class="list__content">
        <strong class="list__title">${e.name}</strong>
        <p class="list__desc">${e.shortDesc || 'Sem descrição disponível.'}</p>
        
        <div style="margin-top:auto; padding-top:10px;">
           <span class="tag tag--type" style="font-size:0.7rem; padding:2px 8px; border-radius:4px;">
             ${window.EntityLabels ? window.EntityLabels[e.type] : e.type}
           </span>
        </div>
      </div>
    </a>
  `).join('');
}

document.addEventListener('DOMContentLoaded', loadEntityList);