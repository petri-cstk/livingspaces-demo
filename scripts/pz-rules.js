require('dotenv').config({ path: process.env.ENV_FILE });
const { resolvePersonalizeAuthToken } = require('../../../tools/utils/auth');
const PZ='https://personalize-api.contentstack.com';
const PID=process.env.CONTENTSTACK_PERSONALIZE_PROJECT_UID;
(async()=>{
  const tok=await resolvePersonalizeAuthToken({saveToEnv:false});
  const H={authtoken:tok,'x-project-uid':PID,'Content-Type':'application/json'};
  const g=async p=>(await (await fetch(PZ+p,{headers:H})).json());
  // A stock custom audience definition (Couple)
  console.log('=== stock custom audience (Couple) definition ===');
  console.log(JSON.stringify((await g('/audiences/6a79ce1cab6f53720f56dcdb')).definition, null, 1));
  // Preset attribute details
  const attrs = await g('/attributes');
  for (const key of ['REGION','DEVICE_TYPE','COUNTRY']) {
    const a = (Array.isArray(attrs)?attrs:attrs.attributes||[]).find(x=>x.uid===key);
    console.log(`\n=== preset attribute ${key} ===`); console.log(JSON.stringify(a, null, 1));
  }
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
