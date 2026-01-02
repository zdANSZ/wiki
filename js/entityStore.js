window.EntityStore = {
  loaded: false,
  entities: [],
  bySlug: new Map(),
  byType: new Map()
};

// Converte string "tag1, tag2" em array
const parseList = (str) => typeof str === 'string' ? str.split(/[,;]/).map(s => s.trim()).filter(s => s) : (str || []);

// CORREÇÃO: Retorna Array de objetos para permitir chaves duplicadas (ex: XP:11 e XP:12)
const parseAttributes = (str) => {
  if (typeof str !== 'string') return [];
  
  return str.split(';').map(pair => {
    const parts = pair.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim(); // Garante que se o valor tiver ':', não quebre
      if (key && val) return { label: key, value: val };
    }
    return null;
  }).filter(item => item !== null);
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
      attributes: parseAttributes(e.attributes) // Agora retorna array
    }));

    EntityStore.entities.forEach(e => {
      EntityStore.bySlug.set(e.slug, e);
      if (!EntityStore.byType.has(e.type)) EntityStore.byType.set(e.type, []);
      EntityStore.byType.get(e.type).push(e);
    });

    EntityStore.loaded = true;
    return EntityStore.entities;
  } catch (error) {
    console.error("Erro fatal ao carregar JSON:", error);
    return [];
  }
}