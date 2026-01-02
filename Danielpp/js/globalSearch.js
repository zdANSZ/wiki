const input = document.getElementById('globalSearchInput');
const resultsBox = document.getElementById('globalSearchResults');

if (input) {
  input.addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) {
      resultsBox.innerHTML = '';
      return;
    }
    await loadEntitiesOnce();
    const results = EntityStore.entities.filter(e =>
      e.name.toLowerCase().includes(query) ||
      e.tags?.some(t => t.toLowerCase().includes(query))
    ).slice(0,8);

    if (results.length === 0) {
      resultsBox.innerHTML = `<p class="text-muted">Nenhum resultado encontrado</p>`;
      return;
    }

    resultsBox.innerHTML = results.map(e => `
      <a href="entidade.html?slug=${e.slug}" class="search-result">
        <strong>${e.name}</strong>
        <span>${EntityLabels[e.type]}</span>
      </a>
    `).join('');
  });
}
