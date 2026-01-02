const headerContainer = document.getElementById('entityHeader');
const attributesContainer = document.getElementById('entityAttributes');
const contentContainer = document.getElementById('entityContent');

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

async function loadEntity() {
  const slug = getSlug();
  if (!slug) { headerContainer.innerHTML = `<p>Entidade não encontrada.</p>`; return; }
  await loadEntitiesOnce();
  const entity = EntityStore.bySlug.get(slug);
  if (!entity) { headerContainer.innerHTML = `<p>Entidade não encontrada.</p>`; return; }

  renderHeader(entity);
  renderAttributes(entity);
  renderEntityByType(entity);
  initAccordion();
}

function renderHeader(e) {
  headerContainer.innerHTML = `
    <div class="entity__header">
      ${e.image ? `<img src="${e.image}" alt="${e.name}" class="entity-image">` : ''}
      <h1 class="entity-title"><a href="#">${e.name}</a></h1>
      <p class="entity-shortdesc">${e.shortDesc || ''}</p>
      <div class="entity-tags">
        <a class="tag tag--type" href="lista.html?type=${e.type}">${EntityLabels[e.type]}</a>
        ${e.tags?.map(tag => `<a class="tag" href="lista.html?type=${e.type}&tag=${encodeURIComponent(tag)}">${tag}</a>`).join('')}
      </div>
    </div>
  `;
}

function renderAttributes(e) {
  if (!e.attributes) { attributesContainer.innerHTML=''; return; }
  attributesContainer.innerHTML = `
    <div class="card info-grid">
      ${Object.entries(e.attributes).map(([k,v]) => `<div><strong>${k}</strong><p class="text-muted">${v}</p></div>`).join('')}
    </div>
  `;
}

function renderEntityByType(e){
  switch(e.type){
    case 'npc': renderAccordionNpc(e); break;
    case 'item': renderAccordionItem(e); break;
    case 'monster': renderAccordionMonster(e); break;
    default: contentContainer.innerHTML=`<div class="card"><p>Sem informações específicas.</p></div>`;
  }
}

function renderAccordionNpc(n){
  contentContainer.innerHTML = `
    <div class="accordion__item"><div class="accordion__title">Localização</div><div class="accordion__content"><p>${n.location||'Desconhecida'}</p></div></div>
    <div class="accordion__item"><div class="accordion__title">Serviços</div><div class="accordion__content"><ul>${n.services?.map(s=>`<li>${s}</li>`).join('')||'<li>Nenhum</li>'}</ul></div></div>
    <div class="accordion__item"><div class="accordion__title">Diálogo</div><div class="accordion__content"><blockquote>${n.dialogue||'—'}</blockquote></div></div>
  `;
}

function renderAccordionItem(i){
  contentContainer.innerHTML = `
    <div class="accordion__item"><div class="accordion__title">Requisitos</div><div class="accordion__content"><ul>${i.requirements?.map(r=>`<li>${r}</li>`).join('')||'<li>Nenhum</li>'}</ul></div></div>
    <div class="accordion__item"><div class="accordion__title">Efeitos</div><div class="accordion__content"><ul>${i.effects?.map(e=>`<li>${e}</li>`).join('')||'<li>Nenhum</li>'}</ul></div></div>
  `;
}

function renderAccordionMonster(m){
  contentContainer.innerHTML = `
    <div class="accordion__item"><div class="accordion__title">Habitat</div><div class="accordion__content"><p>${m.habitat||'Desconhecido'}</p></div></div>
    <div class="accordion__item"><div class="accordion__title">Drops</div><div class="accordion__content"><ul>${m.drops?.map(d=>`<li>${d}</li>`).join('')||'<li>Nenhum</li>'}</ul></div></div>
    <div class="accordion__item"><div class="accordion__title">Fraquezas</div><div class="accordion__content"><ul>${m.weaknesses?.map(w=>`<li>${w}</li>`).join('')||'<li>Nenhuma</li>'}</ul></div></div>
  `;
}

function initAccordion() {
  document.querySelectorAll('.accordion__title').forEach(title => {
    title.addEventListener('click', () => {
      title.parentElement.classList.toggle('is-open');
    });
  });
}

document.addEventListener('DOMContentLoaded', loadEntity);
