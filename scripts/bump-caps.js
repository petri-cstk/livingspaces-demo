const { apiRequest } = require('../../../tools/utils/api-client');
async function bump(gfUid, fieldUid, max) {
  const g = (await apiRequest('GET', `/global_fields/${gfUid}`)).global_field;
  const f = g.schema.find(s => s.uid === fieldUid);
  const before = f.max_instance;
  f.max_instance = max;
  // PUT full definition back (round-trip preserves all other flags)
  const payload = { global_field: { title: g.title, uid: g.uid, schema: g.schema } };
  await apiRequest('PUT', `/global_fields/${gfUid}`, payload);
  console.log(`  ✓ ${gfUid}.${fieldUid} max_instance ${JSON.stringify(before)} -> ${max}`);
}
(async () => {
  await bump('cards', 'card', 4);
  await bump('image_grid', 'image', 12);
  console.log('Done bumping caps.');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
