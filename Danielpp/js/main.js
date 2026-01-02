document.addEventListener('DOMContentLoaded', async () => {
  const headerContainer = document.getElementById('header');

  if (!headerContainer) {
    console.error("ERRO: Elemento #header não encontrado no index.html");
    return;
  }

  // --- CORREÇÃO: Menu e Overlay agora estão FORA do <header> ---
  const headerHTML = `
    <header class="header">
      <button class="header__btn header__btn--menu" aria-label="Abrir Menu">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <h1 class="header__logo">
        <a href="index.html">Grind Hero</a>
      </h1>

      <button id="searchTrigger" class="header__btn" aria-label="Pesquisar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </header> 
    <nav class="drawer">
      <div class="drawer__header">
        <span>Menu</span>
        <button id="closeSidebar" style="font-size:1.5rem; padding:0 10px; background:none; border:none; color:#fff; cursor:pointer;">&times;</button>
      </div>
      <ul class="drawer__menu">
        <li><a href="index.html">Home</a></li>
        <li><a href="lista.html?type=class">Classes</a></li>
        <li><a href="lista.html?type=item">Equipamentos</a></li>
        <li><a href="lista.html?type=monster">Monstros</a></li>
        <li><a href="lista.html?type=map">Mapas</a></li>
        <li><a href="lista.html?type=system">Sistemas</a></li>
        <li><a href="lista.html?type=guide">Guias</a></li>
      </ul>
    </nav>

    <div class="overlay" hidden></div>

    <div id="searchOverlay" class="search-overlay" hidden style="display: none;">
      <div class="search-header">
        <input type="text" id="globalSearchInput" placeholder="Digite para buscar..." autocomplete="off">
        <button id="closeSearch" class="header__btn" style="width: auto; margin-left: 10px; font-size: 0.9rem;">Cancelar</button>
      </div>
      <div id="globalSearchResults" class="search-results-container"></div>
    </div>
  `;

  headerContainer.innerHTML = headerHTML;
  console.log("Estrutura HTML corrigida injetada.");

  setTimeout(() => {
    initSidebar();
    if (window.initGlobalSearch) window.initGlobalSearch();
  }, 50);
});

function initSidebar() {
  const menuBtn = document.querySelector('.header__btn--menu');
  const drawer = document.querySelector('.drawer');
  const overlay = document.querySelector('.overlay');
  const closeBtn = document.getElementById('closeSidebar');

  if (!menuBtn || !drawer || !overlay) {
    console.error("Elementos do menu não encontrados.");
    return;
  }

  function toggleMenu(show) {
    if (show) {
      drawer.classList.add('open');
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('open');
      overlay.hidden = true;
      document.body.style.overflow = '';
    }
  }

  menuBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(true); });
  overlay.addEventListener('click', () => toggleMenu(false));
  if (closeBtn) closeBtn.addEventListener('click', () => toggleMenu(false));
  drawer.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
}