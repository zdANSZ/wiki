const headerContainer = document.getElementById('entityHeader');
const attributesContainer = document.getElementById('entityAttributes');
const contentContainer = document.getElementById('entityContent');

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

  await loadEntitiesOnce();
  const entity = EntityStore.bySlug.get(slug);
  
  if (!entity) { 
    if(headerContainer) headerContainer.innerHTML = `<p>Entidade não encontrada.</p>`; 
    return; 
  }

  // Atualizar breadcrumb
  const breadcrumbSpan = document.getElementById('breadcrumbCurrent'); // Se existir no HTML
  if(breadcrumbSpan) breadcrumbSpan.textContent = entity.name;

  renderHeader(entity);
  renderAttributes(entity);
  renderEntityByType(entity);
  initAccordion();
}

function renderHeader(e) {
  headerContainer.innerHTML = `
    <div class="entity-header-content">
      ${e.image ? `<img src="${e.image}" alt="${e.name}" class="entity-image">` : ''}
      <div>
        <h1 class="entity-title">${e.name}</h1>
        <p class="entity-shortdesc">${e.shortDesc || ''}</p>
        <div class="entity-tags">
          <a class="tag tag--type" href="lista.html?type=${e.type}">${window.EntityLabels[e.type] || e.type}</a>
          ${e.tags.map(tag => `<a class="tag" href="lista.html?type=${e.type}&tag=${encodeURIComponent(tag)}">${tag}</a>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderAttributes(e) {
  // Se attributes estiver vazio ou for objeto vazio
  if (!e.attributes || Object.keys(e.attributes).length === 0) { 
    attributesContainer.innerHTML = ''; 
    return; 
  }
  
  attributesContainer.innerHTML = `
    <div class="card info-grid">
      ${Object.entries(e.attributes).map(([k,v]) => `
        <div class="info-item">
          <strong class="info-label">${k}</strong>
          <span class="info-value">${v}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderEntityByType(e){
  switch(e.type){
    case 'npc': renderAccordionNpc(e); break;
    case 'item': renderAccordionItem(e); break;
    case 'monster': renderAccordionMonster(e); break;
    case 'guide': renderAccordionGuide(e); break;
    default: contentContainer.innerHTML = '';
  }
}

// Helpers de Renderização (Verifique se as propriedades existem)
function renderAccordionNpc(n){
  contentContainer.innerHTML = `
    ${accordionItem('Localização', n.location)}
    ${accordionList('Serviços', n.services)}
    ${accordionItem('Diálogo', n.dialogue, true)}
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
   // Exemplo simples para guias
   contentContainer.innerHTML = `<div class="card"><p>Ver detalhes completos no guia externo ou descrição longa.</p></div>`;
}

// Funções utilitárias para gerar HTML do Accordion
function accordionItem(title, content, isQuote = false) {
  if (!content) return '';
  const body = isQuote ? `<blockquote>${content}</blockquote>` : `<p>${content}</p>`;
  return `
    <div class="accordion__item">
      <div class="accordion__title">${title}</div>
      <div class="accordion__content">${body}</div>
    </div>`;
}

function accordionList(title, list) {
  if (!list || list.length === 0) return '';
  return `
    <div class="accordion__item">
      <div class="accordion__title">${title}</div>
      <div class="accordion__content"><ul>${list.map(i => `<li>${i}</li>`).join('')}</ul></div>
    </div>`;
}

function initAccordion() {
  document.querySelectorAll('.accordion__title').forEach(title => {
    title.addEventListener('click', () => {
      const item = title.parentElement;
      const isOpen = item.classList.contains('is-open');
      
      // Fecha outros (opcional - estilo "Accordion")
      document.querySelectorAll('.accordion__item').forEach(i => i.classList.remove('is-open'));

      if (!isOpen) item.classList.add('is-open');
    });
  });
}

document.addEventListener('DOMContentLoaded', loadEntity);