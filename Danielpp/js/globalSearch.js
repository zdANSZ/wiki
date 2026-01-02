window.initGlobalSearch = function() {
  const triggerBtn = document.getElementById('searchTrigger');
  const overlay = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('closeSearch');
  const input = document.getElementById('globalSearchInput');
  const resultsBox = document.getElementById('globalSearchResults');

  if (!triggerBtn || !overlay || !input) return;

  // Abrir Busca
  triggerBtn.addEventListener('click', () => {
    overlay.hidden = false;
    input.value = ''; // Limpa busca anterior
    resultsBox.innerHTML = '';
    setTimeout(() => input.focus(), 100); // Foca no input após abrir
    document.body.style.overflow = 'hidden'; // Impede rolagem da página de trás
  });

  // Fechar Busca
  const closeSearch = () => {
    overlay.hidden = true;
    document.body.style.overflow = ''; // Restaura rolagem
  };

  closeBtn.addEventListener('click', closeSearch);

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeSearch();
  });

  // Lógica de Pesquisa
  input.addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase();
    
    if (query.length < 2) {
      resultsBox.innerHTML = '';
      return;
    }

    await loadEntitiesOnce(); // Garante que dados existem
    
    const results = EntityStore.entities.filter(e =>
      e.name.toLowerCase().includes(query) ||
      (e.tags && e.tags.some(t => t.toLowerCase().includes(query)))
    );

    if (results.length === 0) {
      resultsBox.innerHTML = `<p style="color: var(--color-text-muted); text-align:center; margin-top:20px;">Nenhum resultado encontrado.</p>`;
      return;
    }

    // Renderização dos Resultados (Lista Vertical Limpa)
    resultsBox.innerHTML = results.map(e => `
      <a href="entidade.html?slug=${e.slug}" class="search-result-item">
        <div class="search-result-info">
          <span class="search-result-name">${e.name}</span>
          <span class="search-result-type">${window.EntityLabels ? window.EntityLabels[e.type] : e.type}</span>
        </div>
        <div style="margin-left: auto; color: var(--color-text-muted);">
           ➔
        </div>
      </a>
    `).join('');
    
    // Adiciona evento de clique nos links para fechar o overlay e permitir a navegação
    resultsBox.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            closeSearch();
        });
    });
  });
};