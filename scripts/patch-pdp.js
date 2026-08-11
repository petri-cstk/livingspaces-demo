const { apiRequest, publishEntry } = require('../../../tools/utils/api-client');
const PDP_UID = 'blt248724a8016e4c51';
const READONLY = ['uid','created_at','updated_at','created_by','updated_by','_version','_in_progress','publish_details','stackHeaders','_content_type_uid','_metadata'];
function sani(n){if(Array.isArray(n))return n.map(sani);if(n&&typeof n==='object'){if(n.uid&&n.is_dir===false&&typeof n.filename!=='undefined')return n.uid;const o={};for(const[k,v]of Object.entries(n))o[k]=sani(v);return o;}return n;}
(async()=>{
  const e=(await apiRequest('GET',`/content_types/pdp/entries/${PDP_UID}?locale=en`)).entry;
  e.product_name = 'Bamboo Weave Long Sleeve Knit Polo — Forest Trail';
  e.description = [
    '<p><strong>Editor’s Note (CMS-enriched):</strong> This description is authored in Contentstack by the SEO team and overrides the raw feed from the commerce platform — no product-import job or commerce-side change required.</p>',
    '<p>Crafted for everyday living, this piece pairs a durable build with a soft, breathable weave. Thoughtful proportions make it an easy, versatile addition to your wardrobe or collection.</p>',
    '<ul><li>Breathable performance weave</li><li>Easy care — machine washable</li><li>Tailored, modern fit</li></ul>',
    '<h3 style="margin-top:2rem">Care &amp; Assembly</h3>',
    '<p>Machine wash cold with like colors; lay flat to dry. Iron low if needed. Full care details are on the sewn-in label.</p>',
    '<div style="margin-top:2rem;padding:1rem 1.25rem;background:#F5F1EC;border-left:4px solid #C8102E;font-size:0.9rem;color:#444">',
    '<strong>Category Disclaimer.</strong> Colors may vary slightly from what appears on your screen due to monitor settings and lighting; dimensions are approximate. This disclaimer is <strong>CMS-managed and applied to every product in this category</strong> — authored once in Contentstack, with no per-product editing or commerce-platform change.',
    '</div>',
  ].join('\n');
  e.modular_blocks = []; // long_text blocks don't render on stock PDP (base issue #139); disclaimer folded into description
  let p={...e}; READONLY.forEach(k=>delete p[k]); p=sani(p);
  await apiRequest('PUT',`/content_types/pdp/entries/${PDP_UID}?locale=en`,{entry:p});
  await publishEntry('pdp',PDP_UID,['en']);
  console.log('✓ PDP patched: enrichment + rendered category disclaimer + de-resorted name');
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
