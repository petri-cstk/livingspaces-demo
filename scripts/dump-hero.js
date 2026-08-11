const { apiRequest } = require('../../../tools/utils/api-client');
(async () => {
  const h = await apiRequest('GET', '/content_types/hero_banner/entries/blt6f578a8f3015c287?locale=en');
  const e = h.entry;
  // print structure without full asset blobs
  const clean = JSON.parse(JSON.stringify(e));
  console.log('KEYS:', Object.keys(clean));
  console.log(JSON.stringify(clean, (k, v) => {
    if (v && typeof v === 'object' && v.filename && v.url) return `<asset ${v.title}>`;
    return v;
  }, 2));
})().catch(e => { console.error(e.message); process.exit(1); });
