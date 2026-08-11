/**
 * Requirement capabilities (CMS-doable with management token):
 *  #2 PLP: CMS content above/below the product grid (category-targeted, no listing-logic change)
 *  #5 PDP: content enrichment over the commerce snapshot (CMS overrides/augments product data)
 *  #1 PDP: a category disclaimer block (demonstrated on the PDP; scalable pattern noted)
 *  + de-resort the homepage aeo structured-data Q&A
 */
const { apiRequest, publishEntry } = require('../../../tools/utils/api-client');

const PLP_UID = 'bltb28b2896f523c3a0';
const PDP_UID = 'blt248724a8016e4c51';
const HOME_UID = 'bltdbd0f366fe371d41';

const hex = () => Math.floor(Math.random() * 16).toString(16);
const meta = () => ({ uid: 'cs' + Array.from({ length: 16 }, hex).join('') });
const cream = { hex: '#F5F1EC', rgb: { r: 245, g: 241, b: 236, a: 1 }, hsl: { h: 33, s: 0.31, l: 0.94, a: 1 }, source: 'hex' };
const textBlock = (headline, body) => ({ text_block: { headline, body, _metadata: meta() } });

const READONLY = ['uid', 'created_at', 'updated_at', 'created_by', 'updated_by', '_version', '_in_progress', 'publish_details', 'stackHeaders', '_content_type_uid', '_metadata'];
function sanitizeAssets(node) {
  if (Array.isArray(node)) return node.map(sanitizeAssets);
  if (node && typeof node === 'object') {
    if (node.uid && node.is_dir === false && typeof node.filename !== 'undefined') return node.uid;
    const out = {}; for (const [k, v] of Object.entries(node)) out[k] = sanitizeAssets(v); return out;
  }
  return node;
}
async function updateEntry(ct, uid, mutate, label) {
  const entry = (await apiRequest('GET', `/content_types/${ct}/entries/${uid}?locale=en`)).entry;
  mutate(entry);
  let payload = { ...entry }; READONLY.forEach((k) => delete payload[k]); payload = sanitizeAssets(payload);
  await apiRequest('PUT', `/content_types/${ct}/entries/${uid}?locale=en`, { entry: payload });
  await publishEntry(ct, uid, ['en']);
  console.log(`  ✓ ${label}`);
}

(async () => {
  // ---- #2 PLP: CMS content above & below the grid (category-targeted) ----
  // PLP blocks allow: image_grid, cards, category_banner, hero_banner, etc. (NOT text_block)
  const white = { hex: '#ffffff', rgb: { r: 255, g: 255, b: 255, a: 1 }, hsl: { h: 0, s: 0, l: 1, a: 1 }, source: 'hex' };
  const gridTile = (text, img) => ({ text, _metadata: meta(), image: img, page: [] });
  const guideCard = (headline, body, img) => ({ image: img, _metadata: meta(), headline, body, button_text: 'Learn More', page: [], card_background_color: white });
  await updateEntry('plp', PLP_UID, (e) => {
    e.title = 'Living Room';
    e.headline = 'Living Room Furniture';
    e.show_category_hero = true;
    // ABOVE the grid — CMS-managed merchandising banner, targeted to this category, no listing-logic change
    e.modular_blocks_top = [
      { image_grid: { _metadata: meta(), image: [
        gridTile('Summer Living Room Event — Save up to 40%', 'am6865cf03f734fa69'),
        gridTile('Free Design Help & Financing', 'am54b64fbb1d16c422'),
      ] } },
    ];
    // BELOW the grid — SEO / buying-guide content the merchandising & SEO teams own
    e.modular_blocks_bottom = [
      { cards: { _metadata: meta(), background_color: white, card: [
        guideCard('How to Choose the Right Sofa', 'Start with your room’s dimensions and traffic flow, then choose a frame and fabric that fit your life. This CMS-authored guide is versioned in Contentstack independently of the commerce catalog that powers the grid above.', 'am79f071ecd1b73231'),
        guideCard('Design Trends We Love', 'Curved silhouettes, warm neutrals and performance textiles are defining the season. Our editors publish fresh guides here without any commerce-platform change.', 'ambfa207dfa60c06cd'),
      ] } },
    ];
  }, '#2 PLP modular_blocks_top + _bottom (category-targeted CMS content)');

  // ---- #5 PDP: enrichment over the commerce snapshot ----
  await updateEntry('pdp', PDP_UID, (e) => {
    // CMS-authored SEO body that OVERRIDES the commerce description (entry.description ?? product.description)
    e.description = [
      '<p><strong>Editor’s Note (CMS-enriched):</strong> This description is authored in Contentstack by the SEO team and overrides the raw feed from the commerce platform — no product-import job or commerce-side change required.</p>',
      '<p>Crafted for everyday living, this piece pairs a durable hardwood frame with a soft, family-friendly performance weave. Thoughtful proportions make it a natural fit for both apartments and open-plan living rooms.</p>',
      '<ul><li>Kiln-dried hardwood frame</li><li>Stain-resistant performance fabric</li><li>Assembles in under 20 minutes</li></ul>',
    ].join('\n');
    // Augment with CMS modular content beneath the buy-box: enrichment + a category disclaimer (#1)
    const longText = (title, body) => ({ long_text: { title, two_columns: false, body, _metadata: meta() } });
    e.modular_blocks = [
      longText('Care & Assembly',
        'Vacuum weekly and blot spills promptly with a clean, damp cloth. Rotate seat cushions monthly for even wear. Full assembly instructions and hardware list are included in the box.'),
      longText('Important Product Disclaimer',
        'Colors may vary slightly from what appears on your screen due to monitor settings and lighting. Dimensions are approximate. This disclaimer is CMS-managed and, in the scalable pattern, is applied to every product in its category from a single Contentstack entry — no per-product editing.'),
    ];
  }, '#5 PDP CMS enrichment (description override) + #1 category disclaimer block');

  // ---- De-resort homepage AEO structured-data Q&A ----
  await updateEntry('homepage', HOME_UID, (e) => {
    if (e.aeo && Array.isArray(e.aeo.questions)) {
      e.aeo.questions = [
        { title: 'Does Living Spaces offer free design help?', answer: 'Yes — our design experts offer free in-store and virtual consultations to help you plan any room.', _metadata: meta() },
        { title: 'Does Living Spaces deliver and assemble furniture?', answer: 'Yes. We offer professional delivery and assembly, plus fast pickup options at our showrooms.', _metadata: meta() },
        { title: 'Does Living Spaces offer financing?', answer: 'Yes, flexible financing is available on qualifying orders so you can furnish your space on your terms.', _metadata: meta() },
      ];
    }
  }, 'homepage aeo Q&A de-resorted');

  console.log('\nDone. Requirements #1/#2/#5 authored + homepage aeo de-resorted (published to dev/en).');
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
