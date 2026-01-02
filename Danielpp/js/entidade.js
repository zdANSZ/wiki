const headerContainer = document.getElementById('entityHeader');
const attributesContainer = document.getElementById('entityAttributes');
const contentContainer = document.getElementById('entityContent');
const breadcrumbContainer = document.querySelector('.breadcrumb');

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

async function loadEntity() {
  const slug = getSlug();
  
  if (!slug) { 
    if(headerContainer) headerContainer.innerHTML = `<p>Entidade não especificada.</p>`; 
    return; 
  }

  // Garante carregamento
  if (window.loadEntitiesOnce) await window.loadEntitiesOnce();
  const entity = window.EntityStore ? window.EntityStore.bySlug.get(slug) : null;
  
  if (!entity) { 
    if(headerContainer) headerContainer.innerHTML = `<p>Entidade não encontrada.</p>`; 
    return; 
  }

  // Renderização
  renderBreadcrumb(entity);
  renderHeader(entity);
  renderAttributes(entity);
  renderEntityByType(entity);
  
  initAccordion();
}

function renderBreadcrumb(e) {
  if (!breadcrumbContainer) return;
  
  const typeLabel = window.EntityLabels ? (window.EntityLabels[e.type] || e.type) : e.type;
  
  // Tag principal para o breadcrumb
  let tagHtml = '';
  if (e.tags && e.tags.length > 0) {
    const mainTag = e.tags[0]; 
    tagHtml = `
      <span class="breadcrumb__sep">/</span>
      <a href="lista.html?type=${e.type}&tag=${encodeURIComponent(mainTag)}">${mainTag}</a>
    `;
  }

  breadcrumbContainer.innerHTML = `
    <a href="index.html">Home</a>
    <span class="breadcrumb__sep">/</span>
    <a href="lista.html?type=${e.type}">${typeLabel}</a>
    ${tagHtml}
    <span class="breadcrumb__sep">/</span>
    <span class="breadcrumb__current">${e.name}</span>
  `;
}

function renderHeader(e) {
  // Tags
  const tagsHtml = (e.tags || []).map(tag => 
    `<a class="tag" href="lista.html?type=${e.type}&tag=${encodeURIComponent(tag)}">${tag}</a>`
  ).join('');

  // CORREÇÃO VISUAL: Envolvemos tudo numa div com a classe 'entity-header'
  // Isso aplica a margem inferior e a borda que estavam faltando.
  headerContainer.innerHTML = `
    <div class="entity-header">
      <h1 class="entity-title">${e.name}</h1>
      <p class="entity-meta">${e.shortDesc || 'Sem descrição disponível.'}</p>
      <div class="tag-container">
        <a class="tag tag--type" href="lista.html?type=${e.type}">
          ${window.EntityLabels ? window.EntityLabels[e.type] : e.type}
        </a>
        ${tagsHtml}
      </div>
    </div>
  `;
}

function renderAttributes(e) {
  // Suporta Array (novo formato) ou Objeto (formato legado)
  if (!e.attributes || (Array.isArray(e.attributes) && e.attributes.length === 0) || Object.keys(e.attributes).length === 0) { 
    attributesContainer.innerHTML = ''; 
    return; 
  }
  
  // Normaliza para array de objetos {label, value}
  let attrs = [];
  if (Array.isArray(e.attributes)) {
    attrs = e.attributes;
  } else {
    attrs = Object.entries(e.attributes).map(([k,v]) => ({label: k, value: v}));
  }

  attributesContainer.innerHTML = `
    <div class="info-grid">
      ${attrs.map(attr => `
        <div class="info-box">
          <span class="info-label">${attr.label}</span>
          <span class="info-value">${attr.value}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// Renderização de conteúdo específico por tipo
function renderEntityByType(e){
  switch(e.type){
    case 'npc': renderAccordionNpc(e); break;
    case 'item': renderAccordionItem(e); break;
    case 'monster': renderAccordionMonster(e); break;
    case 'guide': renderAccordionGuide(e); break;
    default: contentContainer.innerHTML = '';
  }
}

// Helpers de Accordion
function accordionItem(title, content) {
  if (!content) return '';
  return `
    <div class="accordion__item">
      <button class="accordion__title">
        ${title}
        <span class="accordion__icon">+</span>
      </button>
      <div class="accordion__content"><p>${content}</p></div>
    </div>`;
}

function accordionList(title, list) {
  if (!list || list.length === 0) return '';
  return `
    <div class="accordion__item">
      <button class="accordion__title">
        ${title}
        <span class="accordion__icon">+</span>
      </button>
      <div class="accordion__content">
        <ul>${list.map(i => `<li>${i}</li>`).join('')}</ul>
      </div>
    </div>`;
}

function renderAccordionNpc(n){
  contentContainer.innerHTML = `
    ${accordionItem('Localização', n.location)}
    ${accordionList('Serviços', n.services)}
    ${accordionItem('Diálogo', n.dialogue ? `"${n.dialogue}"` : null)}
  `;
}
function renderAccordionItem(i){
  contentContainer.innerHTML = `
    ${accordionList('Requisitos', i.requirements)}
    ${accordionList('Efeitos', i.effects)}
  `;
}
function renderAccordionMonster(m){
  contentContainer.innerHTML = `
    ${accordionItem('Habitat', m.habitat)}
    ${accordionList('Drops', m.drops)}
    ${accordionList('Fraquezas', m.weaknesses)}
  `;
}
function renderAccordionGuide(g){
   contentContainer.innerHTML = `<div class="card" style="padding:1rem"><p>Conteúdo do guia...</p></div>`;
}

function initAccordion() {
  const titles = document.querySelectorAll('.accordion__title');
  titles.forEach(title => {
    title.addEventListener('click', () => {
      title.parentElement.classList.toggle('is-open');
    });
  });
}

document.addEventListener('DOMContentLoaded', loadEntity);