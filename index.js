const jsonResponse = (data, status = 200, extraHeaders = {}) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json",...extraHeaders }
  });
};
const DEFAULT_MAX_TEXT = 3000;
const DEFAULTS = {
  site_name:'TAI EE KI Moundang', city:'Bonabéri / Douala, Cameroun', phone:'+237 675 19 82 09', whatsapp:'+237675198209',
  hero_eyebrow:'BONABÉRI • DOUALA', hero_title:'Unis par nos origines,<br><span>forts par notre solidarité.</span>',
  hero_lead:'TAI EE KI Moundang rassemble les Moundang de Bonabéri et de Douala pour favoriser la rencontre, l’échange, le partage, la solidarité et la transmission aux jeunes générations.',
  association_title:'Une communauté réunie autour de valeurs communes',
  association_p1:'TAI EE KI Moundang a vocation à créer un espace de rencontre et de fraternité entre les membres de la communauté Moundang vivant à Bonabéri et plus largement à Douala.',
  association_p2:'L’association encourage les échanges, le partage d’expériences et l’entraide, tout en accordant une place importante à la jeunesse et à la transmission de l’identité Moundang.',
  culture_title:'Culture & patrimoine Moundang', culture_text:'Cette rubrique pourra présenter progressivement l’histoire, la langue, les traditions, les coutumes, les personnalités et le patrimoine Moundang.',
  youth_title:'La jeunesse au cœur de la transmission', contact_intro:'Pour toute question, information ou prise de contact avec l’association, vous pouvez joindre le secrétaire sur le numéro officiel de contact.', logo:''
};
const SESSION_TTL = 8 * 60 * 60;
const rate = new Map();
const enc = new TextEncoder();
const dec = new TextDecoder();
function clean(v,max=DEFAULT_MAX_TEXT){return String(v?? '').trim().slice(0,max)}
function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}})}
function security(h){h.set('X-Content-Type-Options','nosniff');h.set('X-Frame-Options','SAMEORIGIN');h.set('Referrer-Policy','strict-origin-when-cross-origin');h.set('Permissions-Policy','geolocation=(),camera=(),microphone=()');h.set('Strict-Transport-Security','max-age=31536000; includeSubDomains');return h}
function cookies(req){const out={};for(const p of (req.headers.get('Cookie')||'').split(';')){const i=p.indexOf('=');if(i>0)out[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim())}return out}
function b64u(bytes){let s='';const a=new Uint8Array(bytes);for(const b of a)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function ub64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s);return Uint8Array.from(bin,c=>c.charCodeAt(0))}
async function hmac(secret,data){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);return crypto.subtle.sign('HMAC',key,enc.encode(data))}
async function signSession(secret){const payload=b64u(enc.encode(JSON.stringify({exp:Math.floor(Date.now()/1000)+SESSION_TTL})));return payload+'.'+b64u(await hmac(secret,payload))}
async function verifySession(secret,token){try{const [p,s]=String(token||'').split('.');if(!p||!s)return false;const good=await crypto.subtle.verify('HMAC',await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']),ub64u(s),enc.encode(p));if(!good)return false;return JSON.parse(dec.decode(ub64u(p))).exp>Date.now()/1000}catch{return false}}
async function hashPassword(password,saltBytes){const salt=saltBytes||crypto.getRandomValues(new Uint8Array(16));const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'},key,256);return {salt:b64u(salt),hash:b64u(bits)}}
async function verifyPassword(password,row){const p=await hashPassword(password,ub64u(row.salt));const a=ub64u(p.hash),b=ub64u(row.password_hash);if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a[i]^b[i];return x===0}
async function body(req){try{return await req.json()}catch{return {}}}
async function all(db,sql,...args){const r=await db.prepare(sql).bind(...args).all();return r.results||[]}
async function first(db,sql,...args){return await db.prepare(sql).bind(...args).first()}
async function exec(db,sql,...args){return db.prepare(sql).bind(...args).run()}
async function getSettings(db){const rows=await all(db,'SELECT key,value FROM settings');return Object.fromEntries(rows.map(r=>[r.key,r.value]))}
async function requireAuth(req,env){
  if(env.ADMIN_SETUP_MODE === 'true') return;
  const c=cookies(req);
  if(!(await verifySession(env.SESSION_SECRET,c.session)))throw new Error('UNAUTHORIZED');
}
async function initAdmin(env){const row=await first(env.DB,'SELECT id FROM admin WHERE id=1');if(!row){if(!env.ADMIN_PASSWORD)throw new Error('ADMIN_PASSWORD secret is missing');const p=await hashPassword(env.ADMIN_PASSWORD);await exec(env.DB,'INSERT INTO admin(id,password_hash,salt) VALUES(1,?,?)',p.hash,p.salt)}}
async function api(req,env,url){
  const db=env.DB; const method=req.method; const path=url.pathname;
  if(path==='/api/public/settings'&&method==='GET')return json(await getSettings(db));
  if(path==='/api/public/events'&&method==='GET')return json(await all(db,'SELECT id,title,description,date,location FROM events ORDER BY date ASC,id DESC'));
  if(path==='/api/public/meetings'&&method==='GET')return json(await all(db,'SELECT * FROM meetings ORDER BY id'));
  if(path==='/api/public/bureau'&&method==='GET')return json(await all(db,'SELECT id,role,name,photo,sort_order FROM bureau ORDER BY sort_order,id'));
  if(path==='/api/public/gallery'&&method==='GET')return json(await all(db,'SELECT id,title,image_url,description FROM gallery ORDER BY id DESC'));
  if(path==='/api/members'&&method==='POST'){
    const x=await body(req);if(!clean(x.nom,120)||!clean(x.telephone,40))return json({error:'Nom et téléphone sont requis.'},400);
    await exec(db,'INSERT INTO members(name,phone,area,activity,message) VALUES(?,?,?,?,?)',clean(x.nom,120),clean(x.telephone,40),clean(x.lieu,120),clean(x.profession,120),clean(x.message,1200));
    return json({ok:true,message:'Votre demande a bien été enregistrée. Merci!'},201);
      }
  if(path==='/api/admin/login'&&method==='POST'){
  const ip=req.headers.get('CF-Connecting-IP')||'unknown';
  const now=Date.now();
  const a=rate.get(ip)||{n:0,until:0};

  if(a.until>now)
    return json({error:'Trop de tentatives. Réessayez dans quelques minutes.'},429);

  await initAdmin(env);

  const x=await body(req);
  const supplied=clean(x.password,200);
  const row=await first(db,'SELECT * FROM admin WHERE id=1');

  if(env.ADMIN_SETUP_MODE==='true'){
    const secretPresent=typeof env.ADMIN_PASSWORD==='string' && env.ADMIN_PASSWORD.length>0;
    const suppliedEqualsSecret=secretPresent && supplied===env.ADMIN_PASSWORD;
    const hashMatches=!!row && await verifyPassword(supplied,row);
    const secretMatchesHash=!!row && secretPresent && await verifyPassword(env.ADMIN_PASSWORD,row);

    return json({
      diagnostic:true,
      adminExists:!!row,
      adminId:row?.id??null,
      secretPresent,
      suppliedEqualsSecret,
      hashMatches,
      secretMatchesHash,
      hashLength:row?.password_hash?.length??0,
      saltLength:row?.salt?.length??0
    });
  }

  if(!(await verifyPassword(supplied,row))){
    a.n++;
    if(a.n>=5){
      a.n=0;
      a.until=now+10*60*1000
    }
    rate.set(ip,a);
    return json({error:'Mot de passe incorrect.'},401)
  }

  rate.delete(ip);
  const token=await signSession(env.SESSION_SECRET);

  return json(
    {ok:true},
    200,
    {'Set-Cookie':`session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL}`}
  );
  }
  if(path==='/api/admin/logout'&&method==='POST'){await requireAuth(req,env);return json({ok:true},200,{'Set-Cookie':'session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'})}
  if(path==='/api/admin/me'&&method==='GET'){await requireAuth(req,env);return json({ok:true})}
  if(path.startsWith('/api/admin/')){
    try{await requireAuth(req,env)}catch{return json({error:'Non autorisé'},401)}
    if(path==='/api/admin/settings'&&method==='GET')return json(await getSettings(db));
    if(path==='/api/admin/settings'&&method==='PATCH'){
      const x=await body(req),up=db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
      for(const [k,v] of Object.entries(x||{}))if(Object.hasOwn(DEFAULTS,k)&&typeof v==='string')await up.bind(k,clean(v,k==='logo'?1500000:3000)).run();
      return json({ok:true});
    }
    if(path==='/api/admin/password'&&method==='POST'){
      const x=await body(req),next=clean(x.newPassword,200),row=await first(db,'SELECT * FROM admin WHERE id=1');
      if(next.length<10)return json({error:'Le nouveau mot de passe doit contenir au moins 10 caractères.'},400);
      if(!(await verifyPassword(clean(x.oldPassword,200),row)))return json({error:'Ancien mot de passe incorrect.'},401);
      const p=await hashPassword(next);await exec(db,'UPDATE admin SET password_hash=?,salt=?,updated_at=CURRENT_TIMESTAMP WHERE id=1',p.hash,p.salt);return json({ok:true});
    }
    if(path==='/api/admin/members'&&method==='GET')return json(await all(db,'SELECT * FROM members ORDER BY id DESC'));
    let m=path.match(/^\/api\/admin\/members\/(\d+)$/);if(m&&method==='PATCH'){const x=await body(req),s=['pending','approved','rejected'].includes(x.status)?x.status:'pending';await exec(db,'UPDATE members SET status=? WHERE id=?',s,Number(m[1]));return json({ok:true})}if(m&&method==='DELETE'){await exec(db,'DELETE FROM members WHERE id=?',Number(m[1]));return json({ok:true})}
    if(path==='/api/admin/events'&&method==='GET')return json(await all(db,'SELECT * FROM events ORDER BY date ASC,id DESC'));
    if(path==='/api/admin/events'&&method==='POST'){const x=await body(req);if(!clean(x.title,160))return json({error:'Titre requis'},400);const r=await exec(db,'INSERT INTO events(title,description,date,location) VALUES(?,?,?,?)',clean(x.title,160),clean(x.description,1200),clean(x.date,60),clean(x.location,200));return json({id:r.meta?.last_row_id},201)}
    m=path.match(/^\/api\/admin\/events\/(\d+)$/);if(m&&method==='PATCH'){const x=await body(req);await exec(db,'UPDATE events SET title=?,description=?,date=?,location=? WHERE id=?',clean(x.title,160),clean(x.description,1200),clean(x.date,60),clean(x.location,200),Number(m[1]));return json({ok:true})}if(m&&method==='DELETE'){await exec(db,'DELETE FROM events WHERE id=?',Number(m[1]));return json({ok:true})}
    if(path==='/api/admin/meetings'&&method==='GET')return json(await all(db,'SELECT * FROM meetings ORDER BY id'));
    m=path.match(/^\/api\/admin\/meetings\/(\d+)$/);if(m&&method==='PATCH'){const x=await body(req);await exec(db,'UPDATE meetings SET title=?,day=?,time=?,location=?,details=? WHERE id=?',clean(x.title,160),clean(x.day,80),clean(x.time,80),clean(x.location,200),clean(x.details,700),Number(m[1]));return json({ok:true})}
    if(path==='/api/admin/bureau'&&method==='GET')return json(await all(db,'SELECT * FROM bureau ORDER BY sort_order,id'));
    if(path==='/api/admin/bureau'&&method==='POST'){const x=await body(req);if(!clean(x.role,100))return json({error:'Fonction requise'},400);const r=await exec(db,'INSERT INTO bureau(role,name,photo,sort_order) VALUES(?,?,?,?)',clean(x.role,100),clean(x.name,120),clean(x.photo,500),Number(x.sort_order)||0);return json({id:r.meta?.last_row_id},201)}
    m=path.match(/^\/api\/admin\/bureau\/(\d+)$/);if(m&&method==='PATCH'){const x=await body(req);await exec(db,'UPDATE bureau SET role=?,name=?,photo=?,sort_order=? WHERE id=?',clean(x.role,100),clean(x.name,120),clean(x.photo,500),Number(x.sort_order)||0,Number(m[1]));return json({ok:true})}if(m&&method==='DELETE'){await exec(db,'DELETE FROM bureau WHERE id=?',Number(m[1]));return json({ok:true})}
    if(path==='/api/admin/gallery'&&method==='GET')return json(await all(db,'SELECT * FROM gallery ORDER BY id DESC'));
    if(path==='/api/admin/gallery'&&method==='POST'){const x=await body(req),u=clean(x.image_url,500);if(!/^(https?:\/\/|data:image\/)/i.test(u))return json({error:'URL ou image valide requis'},400);const r=await exec(db,'INSERT INTO gallery(title,image_url,description) VALUES(?,?,?)',clean(x.title,160),u,clean(x.description,600));return json({id:r.meta?.last_row_id},201)}
    m=path.match(/^\/api\/admin\/gallery\/(\d+)$/);if(m&&method==='DELETE'){await exec(db,'DELETE FROM gallery WHERE id=?',Number(m[1]));return json({ok:true})}
  }
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        const r = await api(request, env, url);
        if (r) {
          const hh = new Headers(r.headers);
          security(hh);
          return new Response(r.body, { status: r.status, headers: hh });
        }
        return json({ error: 'Route introuvable' }, 404);
      } catch (e) {
        console.error(e);
        if (e.message === 'UNAUTHORIZED') return json({ error: 'Non autorisé' }, 401);
        return jsonResponse({ error: 'VRAIE ERREUR: ' + e.message }, 500);
      }
    }

    // Partie site public - assets
    try {
      if (env.ASSETS && env.ASSETS.fetch) {
        const res = await env.ASSETS.fetch(request);
        const headers = new Headers(res.headers);
        security(headers);
        return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
      }
    } catch (e) {
      console.error("ASSETS error", e);
    }
    return new Response("Not found", { status: 404 });
  }
};
