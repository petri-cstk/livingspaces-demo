const { apiRequest } = require('../../../tools/utils/api-client');
const sum = (e) => {
  const clean = JSON.parse(JSON.stringify(e, (k,v)=> (v&&v.filename&&v.url)?`<asset ${v.title}>`:v));
  return clean;
};
(async () => {
  for (const ct of ['plp','pdp']) {
    const list = await apiRequest('GET', `/content_types/${ct}/entries?locale=en`);
    console.log(`\n===== ${ct.toUpperCase()} (${list.entries.length} entries) =====`);
    for (const e of list.entries) {
      const full = (await apiRequest('GET', `/content_types/${ct}/entries/${e.uid}?locale=en`)).entry;
      console.log(`- ${full.title} (uid ${full.uid}) url=${full.url}`);
      console.log('  fields:', Object.keys(full).filter(k=>!k.startsWith('_')&&!['created_at','updated_at','created_by','updated_by','publish_details','ACL','tags','locale','uid','title','url'].includes(k)).join(', '));
      if (ct==='plp') console.log('  modular_blocks_top:', (full.modular_blocks_top||[]).map(b=>Object.keys(b)[0]), '| modular_blocks_bottom:', (full.modular_blocks_bottom||[]).map(b=>Object.keys(b)[0]), '| entry_products:', (full.entry_products||[]).length);
      if (ct==='pdp') console.log('  modular_blocks:', (full.modular_blocks||[]).map(b=>Object.keys(b)[0]), '| has description:', !!full.description, '| category field:', full.category||full.product_category||'(none)');
    }
  }
  // schema for pdp/plp: check for a disclaimer/category field
  for (const ct of ['pdp','plp']) {
    const s = (await apiRequest('GET', `/content_types/${ct}`)).content_type;
    console.log(`\n${ct} schema fields:`, s.schema.map(f=>`${f.uid}:${f.data_type}`).join(', '));
  }
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
