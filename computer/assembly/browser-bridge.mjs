const BASE=globalThis.localStorage?.getItem('synthia.wholeComputer.base')||'http://127.0.0.1:43121';
async function request(path,opts={}){const r=await fetch(BASE+path,{...opts,headers:{'content-type':'application/json',...(opts.headers||{})}});const j=await r.json();if(!r.ok)throw new Error(j.error||`${r.status}`);return j;}
const api={
  base:BASE,
  status:()=>request('/api/status'),
  providers:()=>request('/api/providers'),
  send:(capability,input={},options={})=>request('/api/dispatch',{method:'POST',body:JSON.stringify({capability,input,...options}),headers:options.consentToken?{'x-synthia-consent':options.consentToken}:{}}),
  resolveNeed:(need)=>request('/api/resolve-need',{method:'POST',body:JSON.stringify(need)}),
  grantEndpointConsent:(scope=['task_exchange'],subjectId='local-user')=>request('/api/consent/grant',{method:'POST',body:JSON.stringify({scope,subjectId})}),
  buildTree:(pos=[0,0,0])=>api.send('world.command',{order:{cmd:'place_tree',pos}}),
  sentence:(sentence)=>api.send('world.sentence',{sentence})
};
globalThis.SynthiaWholeComputer=api;
async function paint(){
  let online=false;try{const s=await api.status();online=!!s.ok;globalThis.dispatchEvent(new CustomEvent('synthia-whole-computer-ready',{detail:s}));}catch{}
  const el=document.querySelector('#runtime-status');if(el){const base=String(el.textContent||'runtime').replace(/ · whole (online|local-only)$/,'');el.textContent=`${base} · whole ${online?'online':'local-only'}`;}
}
paint();setInterval(paint,10000);
