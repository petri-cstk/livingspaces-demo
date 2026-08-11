/**
 * Author the Living Spaces homepage, header, config, hero, and décor articles.
 * Idempotent-ish: replaces modular_blocks wholesale with the LS composition.
 * Run: ENV_FILE=demos/livingspaces/.env.local node demos/livingspaces/scripts/author-homepage.js
 */
const { apiRequest, publishEntry } = require('../../../tools/utils/api-client');

// ---- Asset UIDs (from cms-snapshot/livingspaces-assets.json + logo upload) ----
const A = {
  heroSummer: 'amfd00d46eab8bb548', citra: 'amd85d5d576d776569',
  naLiving: 'amf2ed68293fbbe13e', naBedroom: 'am06f4361a724b4e91', naDining: 'amb7272d7f7005684f', naOutdoor: 'am962e57a6a8e10678',
  sleep: 'am9c1c5c95f4a412ed', outdoor: 'am64ce2a953a950986', kids: 'am0be3fb355066309e',
  whiteInterior: 'amf540f4d6f2266088', colorSofas: 'am6865cf03f734fa69', curved: 'am052df5c391d3f30e',
  njHero: 'am60f3a224ca1a3664', njLiving: 'am0201a9a7fc836c15', njDining: 'am7e57e4364ae80cf1', njModern: 'am6952438912937c41',
  coastal: 'am2b4c915b25d6c38e', cottage: 'ame747f5f4688611e2', traditional: 'am4477aeadb59e7cc4', scandi: 'am92ea2c67f8447b71', cozy: 'am13f3b2cc53595975',
  crypton: 'amf0561f855e4be2fa', flexsteel: 'am984d15c631c41291', dean: 'am510fe04e79c8950a', jolene: 'am46694e46fb4b9462',
  alton: 'ambc16b3e056b6fbe9', pierce: 'am1c279957973bce4c', luca: 'am4165c663a85c66c3', jaxon: 'amb487a198d77fbc8a',
  jess: 'am8ae68fc34d51773f', riley: 'am8e3cc2bfb5fbf58c', brooke: 'am1e6008ec00331785',
  design: 'am54b64fbb1d16c422', trade: 'am4c2181bcb177302f', careers: 'am5eb1f7dda671c518', social: 'am96c0fe216473406b',
  nightstands: 'ambfa207dfa60c06cd', ottoman: 'am79f071ecd1b73231', neutral: 'am78884c6d45dbf7e3',
  logoDark: 'am9d72e8905bb8ab14', logoLight: 'am283f1b8cec9f8da0',
};
const PLP = [{ uid: 'bltb28b2896f523c3a0', _content_type_uid: 'plp' }]; // /plp (single working listing page)

const hex = () => Math.floor(Math.random() * 16).toString(16);
const meta = () => ({ uid: 'cs' + Array.from({ length: 16 }, hex).join('') });
const cream = { hex: '#F5F1EC', rgb: { r: 245, g: 241, b: 236, a: 1 }, hsl: { h: 33, s: 0.31, l: 0.94, a: 1 }, source: 'hex' };
const white = { hex: '#ffffff', rgb: { r: 255, g: 255, b: 255, a: 1 }, hsl: { h: 0, s: 0, l: 1, a: 1 }, source: 'hex' };

const tile = (text, img) => ({ text, _metadata: meta(), image: img, page: PLP });
const card = (headline, body, button_text, img, bg = white) => ({
  image: img, _metadata: meta(), headline, body, button_text, page: PLP, card_background_color: bg,
});
const textBlock = (headline, body) => ({ text_block: { headline, body: body || '', _metadata: meta() } });
const imageGrid = (tiles) => ({ image_grid: { image: tiles, _metadata: meta() } });
const halfImage = (headline, body, button_text, image, media_align) => ({
  text_and_image: { headline, body, button_text, page: PLP, media_align, image, _metadata: meta(),
    video_options: { video: null, video_controls: null, in_loop: false }, vertical_margin: false },
});

const MODULAR_BLOCKS = [
  // 1. Promo strip
  { cards: { card: [
    card('SUMMER DEALS', 'Save big this season on sofas, sectionals & more.', 'Shop Deals', A.colorSofas, cream),
    card('OUTDOOR LIVING', 'Patio, seating & décor to create your oasis.', 'Shop Outdoor', A.outdoor, cream),
    card('NEW ARRIVALS', 'See our latest designs, just landed.', 'Shop New', A.naBedroom, cream),
  ], _metadata: meta(), background_color: cream } },
  // 2-3. Shop by Room
  textBlock('Shop by Room', 'Everything you need, room by room.'),
  imageGrid([
    tile('Living Room', A.naLiving), tile('Bedroom', A.naBedroom), tile('Dining Room', A.naDining),
    tile('Home Office', A.whiteInterior), tile('Outdoor', A.outdoor), tile('Kids + Teens', A.kids),
  ]),
  // 4. Sleep Center feature
  halfImage('The Sleep Center', 'Find your rest essentials — mattresses, adjustable bases and bedding built for better sleep. Free delivery on select mattresses.', 'Shop Mattresses', A.sleep, 'Right'),
  // 5. Designer collection
  halfImage('Nate + Jeremiah for Living Spaces', 'Shop the designer collection — timeless silhouettes and elevated everyday pieces, curated by Nate Berkus and Jeremiah Brent.', 'Shop the Collection', A.njHero, 'Left'),
  // 6-7. UGC
  textBlock('Your Style, Brought to Life', 'Tag @livingspaces to be featured.'),
  imageGrid([
    tile('@TheRileyMelvin', A.riley), tile('@thebrookesnest', A.brooke),
    tile('@h0mewithjess5', A.jess), tile('@livingspaces', A.whiteInterior),
  ]),
  // 8-9. Shop by Style
  textBlock('Shop by Style', 'Find the look that feels like you.'),
  imageGrid([
    tile('Coastal', A.coastal), tile('Cottage', A.cottage), tile('Traditional', A.traditional),
    tile('Scandinavian', A.scandi), tile('Modern', A.njModern), tile('Boho', A.cozy),
  ]),
  // 10-11. Shop by Collection
  textBlock('Shop by Collection', 'Signature collections, made to mix and match.'),
  imageGrid([
    tile('Crypton', A.crypton), tile('Flexsteel', A.flexsteel), tile('Dean', A.dean), tile('Jolene', A.jolene),
    tile('Alton', A.alton), tile('Pierce', A.pierce), tile('Luca', A.luca), tile('Jaxon', A.jaxon),
  ]),
  // 12. Editorial
  { article_banner: { heading: 'Keep Things Fresh & Fun', _metadata: meta(), articles: [
    { uid: 'bltf4e8519a5ca8be4e', _content_type_uid: 'article' },
    { uid: 'blt4842f1334c24931d', _content_type_uid: 'article' },
    { uid: 'blt78d7a62195172f5c', _content_type_uid: 'article' },
  ] } },
  // 13-14. Service band
  textBlock('How Can We Help?', 'From design help to trade partnerships.'),
  { cards: { card: [
    card('Designing Spaces', 'Get virtual design help from our experts.', 'Book a Session', A.design),
    card('Commercial + Trade Program', 'Let us help bring your vision to life.', 'Learn More', A.trade),
    card("We're Hiring", 'Furnish your future and join the journey.', 'View Careers', A.careers),
  ], _metadata: meta(), background_color: white } },
];

// ---- Entry update helper: fetch -> mutate -> strip readonly -> PUT ----
const READONLY = ['uid', 'created_at', 'updated_at', 'created_by', 'updated_by', '_version', '_in_progress', 'publish_details', 'stackHeaders', '_content_type_uid', '_metadata'];
// Deep-convert resolved asset objects to bare UID strings (CMA rejects full asset blobs on write).
function sanitizeAssets(node) {
  if (Array.isArray(node)) return node.map(sanitizeAssets);
  if (node && typeof node === 'object') {
    if (node.uid && node.is_dir === false && typeof node.filename !== 'undefined') return node.uid;
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = sanitizeAssets(v);
    return out;
  }
  return node;
}
async function updateEntry(ct, uid, mutate, label) {
  const res = await apiRequest('GET', `/content_types/${ct}/entries/${uid}?locale=en`);
  const entry = res.entry;
  mutate(entry);
  let payload = { ...entry };
  READONLY.forEach((k) => delete payload[k]);
  payload = sanitizeAssets(payload);
  await apiRequest('PUT', `/content_types/${ct}/entries/${uid}?locale=en`, { entry: payload });
  await publishEntry(ct, uid, ['en']);
  console.log(`  ✓ ${label} (${ct}/${uid})`);
}

(async () => {
  // 1. config — fonts + audience
  const cfg = (await apiRequest('GET', '/content_types/config/entries?limit=1&locale=en')).entries[0];
  await updateEntry('config', cfg.uid, (e) => {
    e.header_font = 'Cormorant';
    e.paragraph_font = 'Open_Sans';
    e.button_font = 'Raleway';
    e.audience = ['Not Set', 'sunbelt', 'northern', 'mobile', 'bedroom_intent', 'living_intent', 'returning', 'trade_pro'];
  }, 'config fonts + audiences');

  // 2. header — logos + LS nav
  const hdr = (await apiRequest('GET', '/content_types/header/entries?limit=1&locale=en')).entries[0];
  await updateEntry('header', hdr.uid, (e) => {
    e.light_logo = A.logoLight;
    e.dark_logo = A.logoDark;
    e.image_width = 'Auto';
    const item = (text, subs) => ({ text, _metadata: meta(), page: PLP, sub_items: subs || [] });
    e.menu_items = [
      item('Living Room'), item('Bedroom'), item('Mattresses'), item('Dining'),
      item('Outdoor'), item('Rugs & Décor'), item('Clearance'),
    ];
  }, 'header nav + logos');

  // 3. hero_banner
  await updateEntry('hero_banner', 'blt6f578a8f3015c287', (e) => {
    e.header = 'Summer, Brought to Life';
    e.body = "Discover the season's most-loved looks — airy, effortless and made for the way you live.";
    e.button_text = 'Shop the Look';
    e.page = PLP;
    e.image_options = { image: A.naLiving, image_height: e.image_options?.image_height || 'h-screen' };
    e.media_overlay = '50%';
    e.header_overlay = true;
    e.text_position = 'Center';
    e.alignment = 'Center';
  }, 'hero banner');

  // 4. homepage
  const home = (await apiRequest('GET', '/content_types/homepage/entries?limit=1&locale=en')).entries[0];
  await updateEntry('homepage', home.uid, (e) => {
    e.modular_blocks = MODULAR_BLOCKS;
    e.title = 'Living Spaces';
    if (e.seo) {
      e.seo.title = 'Living Spaces | Home, Décor & Outdoor Furniture Store';
      e.seo.description = 'Shop furniture and décor for every room. Your style, brought to life — with free design help, financing and fast delivery.';
      if (e.seo.og_meta_tags) {
        e.seo.og_meta_tags.description = e.seo.description;
        e.seo.og_meta_tags.title = e.seo.title;
      }
    }
  }, 'homepage modular_blocks');

  // 5. décor articles (dump keys once, then re-author title/teaser/banner)
  const decor = [
    { uid: 'bltf4e8519a5ca8be4e', title: 'Summer Décor Ideas to Brighten Your Home', teaser: 'Easy, breezy updates to refresh every room for the season.', img: A.ottoman },
    { uid: 'blt4842f1334c24931d', title: "15 Bedroom Ideas That'll Keep You Cool & Stylish", teaser: 'Layered neutrals, natural textures and calm palettes for better rest.', img: A.nightstands },
    { uid: 'blt78d7a62195172f5c', title: "6 Essentials for a Comfortable Night's Sleep", teaser: 'From the right mattress to the perfect bedding — build your sleep sanctuary.', img: A.neutral },
  ];
  let dumped = false;
  for (const art of decor) {
    await updateEntry('article', art.uid, (e) => {
      if (!dumped) { console.log('  article fields:', Object.keys(e).filter((k) => !k.startsWith('_') && !['created_at','updated_at','created_by','updated_by','publish_details','ACL','tags','locale','uid'].includes(k))); dumped = true; }
      e.title = art.title;
      if ('teaser' in e) e.teaser = art.teaser;
      if ('banner_image' in e) e.banner_image = art.img;
      else if ('image' in e) e.image = art.img;
    }, `article: ${art.title.slice(0, 30)}`);
  }

  console.log('\nDone. Homepage authored + published to dev (en).');
})().catch((e) => { console.error('ERROR:', e.message, e.stack); process.exit(1); });
