document.addEventListener('DOMContentLoaded', async () => {
  const headerContainer = document.getElementById('header');
  if (!headerContainer) return;

  // 1. Injetar Header
  try {
    const res = await fetch('partials/header.html');
    const html = await res.text();
    headerContainer.innerHTML = html;
    
    // 2. Inicializar Componentes do Header
    initSidebar();
    if (window.initGlobalSearch) window.initGlobalSearch();
    
    // 3. Avisar a aplicação que o header está pronto (opcional, mas boa prática)
    document.dispatchEvent(new Event('HeaderReady'));
    
  } catch (e) {
    console.error('Erro ao carregar header:', e);
  }
});

function initSidebar() {
  const menuBtn = document.querySelector('.header__btn--menu');
  const drawer = document.querySelector('.drawer');
  const overlay = document.querySelector('.overlay');

  if (menuBtn && drawer && overlay) {
    menuBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      overlay.hidden = false;
    });
    
    // Fechar ao clicar no overlay ou num link
    const closeMenu = () => {
      drawer.classList.remove('open');
      overlay.hidden = true;
    };

    overlay.addEventListener('click', closeMenu);
    drawer.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  }
}