require('dotenv').config({ path: process.env.ENV_FILE });
const { resolvePersonalizeAuthToken } = require('../../../tools/utils/auth');
const PZ='https://personalize-api.contentstack.com';
const PID=process.env.CONTENTSTACK_PERSONALIZE_PROJECT_UID;
(async()=>{
  const tok=await resolvePersonalizeAuthToken({saveToEnv:false});
  const H={authtoken:tok,'x-project-uid':PID,'Content-Type':'application/json'};
  const r=await fetch(PZ+'/audiences/6a79ce1cab6f53720f56dcdb',{headers:H});
  console.log('status',r.status); console.log(JSON.stringify(await r.json(),null,1));
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
