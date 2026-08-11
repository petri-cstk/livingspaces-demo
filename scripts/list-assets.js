// Recursively list assets under the "livingspaces" folder.
const { apiRequest } = require('../../../tools/utils/api-client');

async function listFolderAssets(uid, label) {
  let skip = 0, total = 0, out = [];
  while (true) {
    const res = await apiRequest('GET',
      `/assets?folder=${uid}&include_count=true&limit=100&skip=${skip}`);
    const assets = (res.assets || []).filter((a) => !a.is_dir);
    out.push(...assets);
    total = res.count != null ? res.count : total + assets.length;
    skip += 100;
    if (skip >= total || assets.length === 0) break;
  }
  return out;
}

(async () => {
  const foldersRes = await apiRequest('GET', '/assets?include_folders=true&query=' +
    encodeURIComponent(JSON.stringify({ is_dir: true })) + '&limit=100');
  const dirs = (foldersRes.assets || []).filter((a) => a.is_dir);
  const ls = dirs.find((d) => /living\s*spaces/i.test(d.name));
  const subs = dirs.filter((d) => d.parent_uid === ls.uid);

  const targets = [{ uid: ls.uid, name: 'livingspaces (root)' },
    ...subs.map((s) => ({ uid: s.uid, name: `livingspaces / ${s.name}` }))];

  let grand = 0;
  for (const t of targets) {
    const assets = await listFolderAssets(t.uid, t.name);
    console.log(`\n=== ${t.name}  (${assets.length}) ===`);
    assets.forEach((a) => {
      const dim = a.dimension ? `${a.dimension.width}x${a.dimension.height}` : '?';
      console.log(`  ${a.title}  [${a.content_type} ${dim}]`);
    });
    grand += assets.length;
  }
  console.log(`\n>>> Grand total under livingspaces: ${grand}`);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
