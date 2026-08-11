const { apiRequest } = require('../../../tools/utils/api-client');
(async () => {
  // Are cards/image_grid global fields?
  const gfs = await apiRequest('GET', '/global_fields?include_count=true');
  const names = (gfs.global_fields||[]).map(g=>g.uid);
  console.log('global fields:', names.join(', '));
  for (const u of ['cards','image_grid']) {
    if (names.includes(u)) {
      const g = await apiRequest('GET', `/global_fields/${u}`);
      const sub = g.global_field.schema.find(f=>['card','image'].includes(f.uid));
      console.log(`GF ${u}.${sub && sub.uid}: multiple=${sub&&sub.multiple} max_instance=${sub && JSON.stringify(sub.max_instance)}`);
    } else {
      console.log(`${u} is NOT a global field (inline in homepage modular_blocks)`);
    }
  }
})().catch(e=>{console.error(e.message);process.exit(1);});
