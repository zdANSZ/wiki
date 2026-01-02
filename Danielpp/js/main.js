document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('partials/header.html');
  const html = await res.text();
  document.getElementById('header').innerHTML = html;

  const menuBtn = document.querySelector('.header__btn--menu');
  const drawer = document.querySelector('.drawer');
  const overlay = document.querySelector('.overlay');

  if (menuBtn && drawer && overlay) {
    menuBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      overlay.hidden = false;
    });
    overlay.addEventListener('click', () => {
      drawer.classList.remove('open');
      overlay.hidden = true;
    });
  }
});
