window.EntityStore = {
  loaded: false,
  entities: [],
  bySlug: new Map(),
  byType: new Map()
};

// Funções auxiliares para limpar os dados "sujos" do JSON
const parseList = (str) => typeof str === 'string' ? str.split(/[,;]/).map(s => s.trim()).filter(s => s) : (str || []);
const parseAttributes = (str) => {
  if (typeof str !== 'string') return str || {};
  const attrs = {};
  str.split(';').forEach(pair => {
    const [key, val] = pair.split(':');
    if (key && val) attrs[key.trim()] = val.trim();
  });
  return attrs;
};

async function loadEntitiesOnce() {
  if (EntityStore.loaded) return EntityStore.entities;

  try {
    const res = await fetch('data/entidades.json');
    const data = await res.json();
    
    // Normalização dos dados
    EntityStore.entities = data.entities.map(e => ({
      ...e,
      tags: parseList(e.tags),
      drops: parseList(e.drops),
      weaknesses: parseList(e.weaknesses),
      services: parseList(e.services),
      requirements: parseList(e.requirements),
      effects: parseList(e.effects),
      attributes: parseAttributes(e.attributes)
    }));

    EntityStore.entities.forEach(e => {
      EntityStore.bySlug.set(e.slug, e);
      if (!EntityStore.byType.has(e.type)) EntityStore.byType.set(e.type, []);
      EntityStore.byType.get(e.type).push(e);
    });

    EntityStore.loaded = true;
    return EntityStore.entities;
  } catch (error) {
    console.error("Erro ao carregar entidades:", error);
    return [];
  }
}