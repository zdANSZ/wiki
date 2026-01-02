window.EntityStore = {
  loaded: false,
  entities: [],
  bySlug: new Map(),
  byType: new Map()
};

async function loadEntitiesOnce() {
  if (EntityStore.loaded) return EntityStore.entities;

  const res = await fetch('data/entidades.json');
  const data = await res.json();
  EntityStore.entities = data.entities;

  data.entities.forEach(e => {
    EntityStore.bySlug.set(e.slug, e);
    if (!EntityStore.byType.has(e.type)) EntityStore.byType.set(e.type, []);
    EntityStore.byType.get(e.type).push(e);
  });

  EntityStore.loaded = true;
  return EntityStore.entities;
}
