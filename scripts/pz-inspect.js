require('dotenv').config({ path: process.env.ENV_FILE });
const { resolvePersonalizeAuthToken } = require('../../../tools/utils/auth');
const PZ='https://personalize-api.contentstack.com';
const PID=process.env.CONTENTSTACK_PERSONALIZE_PROJECT_UID||process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;
(async()=>{
  const tok=await resolvePersonalizeAuthToken({saveToEnv:false});
  const H={authtoken:tok,'x-project-uid':PID,'Content-Type':'application/json'};
  for(const p of ['/attributes','/events','/audiences']){
    const r=await fetch(PZ+p,{headers:H}); const j=await r.json();
    const arr=Array.isArray(j)?j:(j[p.slice(1)]||j.data||[]);
    console.log(`\n=== ${p} (${arr.length}) ===`);
    arr.forEach(a=>console.log(`  ${a.name||a.key||a.title} | uid=${a.uid} ${a.key?'key='+a.key:''} ${a.__type||a.type||''}`));
  }
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
