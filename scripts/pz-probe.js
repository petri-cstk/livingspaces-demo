require('dotenv').config({ path: process.env.ENV_FILE });
const { resolvePersonalizeAuthToken } = require('../../../tools/utils/auth');
const PZ='https://personalize-api.contentstack.com';
const PID=process.env.CONTENTSTACK_PERSONALIZE_PROJECT_UID;
(async()=>{
  const tok=await resolvePersonalizeAuthToken({saveToEnv:false});
  const H={authtoken:tok,'x-project-uid':PID,'Content-Type':'application/json'};
  const tries = [
    { label:'PresetAttributeReference', ref:{ __type:'PresetAttributeReference', ref:'DEVICE_TYPE' } },
    { label:'StandardAttributeReference', ref:{ __type:'StandardAttributeReference', ref:'DEVICE_TYPE' } },
    { label:'PresetReference', ref:{ __type:'PresetReference', ref:'DEVICE_TYPE' } },
  ];
  for (const t of tries) {
    const body={ name:`__probe_${t.label}`, definition:{ __type:'Audience', rules:[{ __type:'Rule',
      attribute:t.ref, attributeMatchOptions:{ __type:'StringMatchOptions', value:'Mobile' }, attributeMatchCondition:'STRING_EQUALS' }] } };
    const r=await fetch(PZ+'/audiences',{method:'POST',headers:H,body:JSON.stringify(body)});
    const j=await r.json();
    console.log(`\n[${t.label}] status ${r.status}: ${JSON.stringify(j).slice(0,300)}`);
    if (r.status<300 && j.uid) { console.log('  -> created; deleting probe'); await fetch(PZ+`/audiences/${j.uid}`,{method:'DELETE',headers:H}); }
  }
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
