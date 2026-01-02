const headerContainer = document.getElementById('entityHeader');
const attributesContainer = document.getElementById('entityAttributes');
const contentContainer = document.getElementById('entityContent');
const breadcrumbContainer = document.querySelector('.breadcrumb');

function getSlug() { return new URLSearchParams(window.location.search).get('slug'); }

async function loadEntity() {
  const slug = getSlug();
  if (!slug) return showMessage("Entidade não especificada.");

  if (window.loadEntitiesOnce) await window.loadEntitiesOnce();
  const entity = window.EntityStore ? window.EntityStore.bySlug.get(slug) : null;
  
  if (!entity) return showMessage("Entidade não encontrada.");

  renderBreadcrumb(entity);
  renderHeader(entity);
  renderAttributes(entity);
  
  // Renderiza a Descrição Longa (se existir) antes dos accordions
  if (entity.description) {
    const descDiv = document.createElement('div');
    descDiv.className = 'card';
    descDiv.style.marginBottom = 'var(--space-md)';
    descDiv.style.padding = 'var(--space-md)';
    descDiv.style.lineHeight = '1.8';
    descDiv.innerHTML = `<h3 style="margin-bottom:10px; color:var(--color-primary)">Sobre</h3><p>${entity.description}</p>`;
    // Insere antes do container de accordions, ou dentro dele no topo
    contentContainer.innerHTML = ''; // Limpa antes
    contentContainer.appendChild(descDiv);
  } else {
    contentContainer.innerHTML = '';
  }

  renderEntityByType(entity);
  initAccordion();
}

function showMessage(msg) { if(headerContainer) headerContainer.innerHTML = `<p>${msg}</p>`; }

function renderBreadcrumb(e) {
  if (!breadcrumbContainer) return;
  const typeLabel = window.EntityLabels ? (window.EntityLabels[e.type] || e.type) : e.type;
  let tagHtml = '';
  if (e.tags && e.tags.length > 0) {
    tagHtml = `<span class="breadcrumb__sep">/</span><a href="lista.html?type=${e.type}&tag=${encodeURIComponent(e.tags[0])}">${e.tags[0]}</a>`;
  }
  breadcrumbContainer.innerHTML = `<a href="index.html">Home</a><span class="breadcrumb__sep">/</span><a href="lista.html?type=${e.type}">${typeLabel}</a>${tagHtml}<span class="breadcrumb__sep">/</span><span class="breadcrumb__current">${e.name}</span>`;
}

function renderHeader(e) {
  const tagsHtml = (e.tags || []).map(tag => `<a class="tag" href="lista.html?type=${e.type}&tag=${encodeURIComponent(tag)}">${tag}</a>`).join('');
  headerContainer.innerHTML = `
    <div class="entity-header">
      <h1 class="entity-title">${e.name}</h1>
      <p class="entity-meta">${e.shortDesc || ''}</p>
      <div class="tag-container">
        <a class="tag tag--type" href="lista.html?type=${e.type}">${window.EntityLabels ? window.EntityLabels[e.type] : e.type}</a>
        ${tagsHtml}
      </div>
    </div>`;
}

function renderAttributes(e) {
  if (!e.attributes || e.attributes.length === 0) { attributesContainer.innerHTML = ''; return; }
  attributesContainer.innerHTML = `<div class="info-grid">${e.attributes.map(attr => `<div class="info-box"><span class="info-label">${attr.label}</span><span class="info-value">${attr.value}</span></div>`).join('')}</div>`;
}

function renderEntityByType(e){
  // O conteúdo base já foi limpo no loadEntity, agora adicionamos os accordions
  // Usamos append para não apagar a "description" que já adicionamos lá em cima
  const tempDiv = document.createElement('div');
  
  switch(e.type){
    case 'class': renderAccordionClass(e, tempDiv); break; // NOVO
    case 'npc': renderAccordionNpc(e, tempDiv); break;
    case 'item': renderAccordionItem(e, tempDiv); break;
    case 'monster': renderAccordionMonster(e, tempDiv); break;
    case 'guide': tempDiv.innerHTML += `<div class="card" style="padding:1rem"><p>Ver guia completo...</p></div>`; break;
  }
  
  contentContainer.appendChild(tempDiv);
}

// --- RENDERIZADORES ESPECÍFICOS ---

function renderAccordionClass(c, container) {
  // Progressão
  if (c.progression) {
    container.innerHTML += accordionItem('Progressão & Evolução', c.progression);
  }
  
  // Habilidades (Skills) - Usando lista formatada
  if (c.skills && c.skills.length > 0) {
    const skillsHtml = `<ul>${c.skills.map(s => `
      <li style="margin-bottom:8px;">
        <strong style="color:var(--color-primary)">${s.label}</strong>: 
        <span style="color:var(--color-text-muted)">${s.value}</span>
      </li>`).join('')}</ul>`;
    
    container.innerHTML += `
      <div class="accordion__item">
        <button class="accordion__title">Habilidades de Classe <span class="accordion__icon">+</span></button>
        <div class="accordion__content">${skillsHtml}</div>
      </div>`;
  }
  
  // Requisitos da Classe
  if (c.requirements && c.requirements.length > 0) {
    container.innerHTML += accordionList('Requisitos', c.requirements);
  }
}

function renderAccordionNpc(n, container){
  container.innerHTML += `
    ${accordionItem('Localização', n.location)}
    ${accordionList('Serviços', n.services)}
    ${accordionItem('Diálogo', n.dialogue ? `"${n.dialogue}"` : null)}
  `;
}
function renderAccordionItem(i, container){
  container.innerHTML += `
    ${accordionList('Requisitos', i.requirements)}
    ${accordionList('Efeitos', i.effects)}
  `;
}
function renderAccordionMonster(m, container){
  container.innerHTML += `
    ${accordionItem('Habitat', m.habitat)}
    ${renderDropList(m.drops)} 
    ${accordionList('Fraquezas', m.weaknesses)}
  `;
}

// NOVA FUNÇÃO: Renderiza os drops buscando os dados do item
function renderDropList(drops) {
  if (!drops || drops.length === 0) return '';

  // Gera o HTML de cada drop
  const dropsHtml = drops.map(dropSlug => {
    // 1. Tenta achar o item pelo slug
    const item = window.EntityStore.bySlug.get(dropSlug);

    // 2. Se achar o item, monta um card completo
    if (item) {
      // Pega os 3 primeiros atributos para não poluir
      const stats = (item.attributes || []).slice(0, 3).map(a => 
        `<span class="drop-stat">${a.label}: ${a.value}</span>`
      ).join('');

      return `
        <a href="entidade.html?slug=${item.slug}" class="drop-card">
          <div class="drop-info">
            <strong class="drop-name">${item.name}</strong>
            <div class="drop-stats">${stats}</div>
          </div>
          <span class="drop-arrow">➔</span>
        </a>
      `;
    } 
    
    // 3. Se NÃO achar o item (link quebrado ou ainda não cadastrado), mostra só o nome/slug
    else {
      return `
        <div class="drop-card missing">
          <div class="drop-info">
            <strong class="drop-name">${dropSlug}</strong>
            <span class="drop-stat" style="color:#d55">Item não cadastrado</span>
          </div>
        </div>
      `;
    }
  }).join('');

  return `
    <div class="accordion__item">
      <button class="accordion__title">Drops (Espólios) <span class="accordion__icon">+</span></button>
      <div class="accordion__content">
        <div class="drops-grid">
          ${dropsHtml}
        </div>
      </div>
    </div>`;
}

// Helpers
function accordionItem(title, content) {
  if (!content) return '';
  return `<div class="accordion__item"><button class="accordion__title">${title}<span class="accordion__icon">+</span></button><div class="accordion__content"><p>${content}</p></div></div>`;
}
function accordionList(title, list) {
  if (!list || list.length === 0) return '';
  return `<div class="accordion__item"><button class="accordion__title">${title}<span class="accordion__icon">+</span></button><div class="accordion__content"><ul>${list.map(i => `<li>${i}</li>`).join('')}</ul></div></div>`;
}

function initAccordion() {
  document.querySelectorAll('.accordion__title').forEach(title => {
    title.addEventListener('click', () => title.parentElement.classList.toggle('is-open'));
  });
}

document.addEventListener('DOMContentLoaded', loadEntity);