// Dump homepage + header entries and build an asset-map for livingspaces assets.
const fs = require('fs');
const path = require('path');
const { apiRequest } = require('../../../tools/utils/api-client');

async function getSingleEntry(ctUid) {
  const res = await apiRequest('GET', `/content_types/${ctUid}/entries?limit=1&locale=en`);
  return res.entries && res.entries[0];
}

(async () => {
  const outDir = path.join(__dirname, '..', 'cms-snapshot');
  fs.mkdirSync(outDir, { recursive: true });

  // Homepage
  const homeList = await apiRequest('GET', '/content_types/homepage/entries?limit=1&locale=en');
  const home = homeList.entries[0];
  const homeFull = await apiRequest('GET', `/content_types/homepage/entries/${home.uid}?locale=en`);
  fs.writeFileSync(path.join(outDir, 'homepage.json'), JSON.stringify(homeFull.entry, null, 2));
  console.log('homepage uid:', home.uid);
  console.log('homepage top-level fields:', Object.keys(homeFull.entry).filter(k => !k.startsWith('_') && !['uid','title','url','locale','tags','ACL','created_at','updated_at','created_by','updated_by','publish_details','_version','_in_progress'].includes(k)));
  console.log('modular_blocks count:', (homeFull.entry.modular_blocks || []).length);
  console.log('modular_blocks keys:', (homeFull.entry.modular_blocks || []).map(b => Object.keys(b)[0]));

  // Header
  const header = await getSingleEntry('header');
  const headerFull = await apiRequest('GET', `/content_types/header/entries/${header.uid}?locale=en`);
  fs.writeFileSync(path.join(outDir, 'header.json'), JSON.stringify(headerFull.entry, null, 2));
  console.log('\nheader uid:', header.uid);
  console.log('header menu_items:', (headerFull.entry.menu_items || []).map(m => m.text));

  // Config
  const config = await getSingleEntry('config');
  const configFull = await apiRequest('GET', `/content_types/config/entries/${config.uid}?locale=en`);
  fs.writeFileSync(path.join(outDir, 'config.json'), JSON.stringify(configFull.entry, null, 2));
  console.log('\nconfig uid:', config.uid);
  console.log('config fonts:', { header: configFull.entry.header_font, paragraph: configFull.entry.paragraph_font, button: configFull.entry.button_font });
  console.log('config audience:', configFull.entry.audience);

  // Asset map for livingspaces folder (recursive)
  const foldersRes = await apiRequest('GET', '/assets?include_folders=true&query=' +
    encodeURIComponent(JSON.stringify({ is_dir: true })) + '&limit=100');
  const dirs = (foldersRes.assets || []).filter((a) => a.is_dir);
  const ls = dirs.find((d) => /living\s*spaces/i.test(d.name));
  const subs = dirs.filter((d) => d.parent_uid === ls.uid);
  const map = {};
  for (const f of [ls, ...subs]) {
    let skip = 0, total = 0;
    while (true) {
      const res = await apiRequest('GET', `/assets?folder=${f.uid}&include_count=true&limit=100&skip=${skip}`);
      const assets = (res.assets || []).filter((a) => !a.is_dir);
      assets.forEach((a) => { map[a.title] = { uid: a.uid, url: a.url, content_type: a.content_type, folder: f.name }; });
      total = res.count != null ? res.count : total + assets.length;
      skip += 100;
      if (skip >= total || assets.length === 0) break;
    }
  }
  fs.writeFileSync(path.join(outDir, 'livingspaces-assets.json'), JSON.stringify(map, null, 2));
  console.log('\nwrote asset map:', Object.keys(map).length, 'assets ->', path.join('cms-snapshot','livingspaces-assets.json'));
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
