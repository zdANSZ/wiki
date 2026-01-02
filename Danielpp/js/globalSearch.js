window.initGlobalSearch = function() {
  const triggerBtn = document.getElementById('searchTrigger');
  const overlay = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('closeSearch');
  const input = document.getElementById('globalSearchInput');
  const resultsBox = document.getElementById('globalSearchResults');

  if (!triggerBtn || !overlay || !input || !closeBtn) {
    console.warn("Elementos da Pesquisa não encontrados no Header injetado.");
    return;
  }

  // ABRIR
  triggerBtn.addEventListener('click', () => {
    overlay.hidden = false;
    overlay.style.display = 'flex'; // Força display flex
    input.value = '';
    resultsBox.innerHTML = '';
    setTimeout(() => input.focus(), 100);
    document.body.style.overflow = 'hidden';
  });

  // FECHAR
  function closeSearch() {
    overlay.hidden = true;
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeSearch);

  // ESC para fechar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display === 'flex') closeSearch();
  });

  // DIGITAÇÃO
  input.addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase();
    
    if (query.length < 2) {
      resultsBox.innerHTML = '';
      return;
    }

    // Carrega dados se necessário
    if (window.loadEntitiesOnce) await window.loadEntitiesOnce();
    if (!window.EntityStore || !window.EntityStore.entities) return;

    const results = window.EntityStore.entities.filter(e =>
      e.name.toLowerCase().includes(query) ||
      (e.tags && Array.isArray(e.tags) && e.tags.some(t => t.toLowerCase().includes(query)))
    );

    if (results.length === 0) {
      resultsBox.innerHTML = `<p style="padding:20px; text-align:center; color:#888;">Nenhum resultado.</p>`;
      return;
    }

    resultsBox.innerHTML = results.map(e => `
      <a href="entidade.html?slug=${e.slug}" class="search-result-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #333; color:#fff; text-decoration:none;">
        <div>
          <div style="font-weight:bold; font-size:1.1rem;">${e.name}</div>
          <div style="font-size:0.8rem; color:#aaa; text-transform:uppercase;">${e.type}</div>
        </div>
        <div style="color:#666;">➔</div>
      </a>
    `).join('');

    // Adiciona evento de clique nos links gerados
    resultsBox.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeSearch);
    });
  });
  
  console.log("Pesquisa Global inicializada.");
};