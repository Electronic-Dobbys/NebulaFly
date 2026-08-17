import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const clamp01=v=>clamp(v,0,1);
const lum=(r,g,b)=>(0.2126*r+0.7152*g+0.0722*b)/255;

const renderer=new THREE.WebGLRenderer({canvas:$('view'),antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setClearColor(0x000000,1);
renderer.outputColorSpace=THREE.SRGBColorSpace;

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(48,1,.05,5000);
const HOME_Z=115; camera.position.set(0,0,HOME_Z); scene.add(camera);
const controls=new PointerLockControls(camera,document.body);
const root=new THREE.Group(); scene.add(root);

let currentImage=null,currentUrl='./assets/orion.png',currentAnalysis=null;
let externalStarlessImage=null;
let externalStarlessName='';
let externalSvgText=null;
let externalSvgName='';

function resetExternalAnalysisSources(){
  externalStarlessImage=null;
  externalStarlessName='';
  externalSvgText=null;
  externalSvgName='';

  const starlessInput=$('starlessInput');
  const svgInput=$('svgInput');
  if(starlessInput) starlessInput.value='';
  if(svgInput) svgInput.value='';

  if($('starlessState')){
    $('starlessState').textContent='Starless: automático (PSF + inpainting) para la imagen actual.';
  }
  if($('svgState')){
    $('svgState').textContent='SVG: no cargado. Se usará vectorización automática para la imagen actual.';
  }
}
let starsCore=null,starsGlow=null,plane=null;
const nebulaGroup=new THREE.Group();root.add(nebulaGroup);
const keys=new Set();

addEventListener('keydown',e=>keys.add(e.code)); addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('resize',fit);
function fit(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()} fit();

function bind(id){const el=$(id),out=$(id+'Val');const f=()=>out.textContent=el.value;el.addEventListener('input',f);f()}
['sigmaThreshold','fwhmMin','fwhmMax','elongMax','coreScale','glowScale','glowIntensity','traceDetail','tracePathOmit','traceColors','vectorColors','vectorBlur','maxForms','minArea','smooth','spherize','cloudNoise','nebulaEmission','nebulaGlow','thickness','innerOpacity','outerOpacity','nebulaDepth','svgMaxPaths','svgMinArea','svgRound','gasParticles','noiseScale','noiseWarp','procDensity','procFalloff','volumeThickness','gasPointSize','procEmission','planeZ','planeOpacity'].forEach(bind);

function status(s){$('status').textContent=s}
$('imageInput').onchange=async e=>{
  const f=e.target.files?.[0];
  if(!f)return;

  // IMPORTANT: a new base image must never inherit the starless/SVG
  // of IC434/NGC3576 or any previously loaded target.
  resetExternalAnalysisSources();

  if(currentUrl.startsWith('blob:')) URL.revokeObjectURL(currentUrl);
  currentUrl=URL.createObjectURL(f);

  status(`Nueva imagen: ${f.name} · reiniciando PSF, starless y vectorización…`);
  await loadImage(currentUrl,{preserveExternal:true});
};

$('loadOrionBtn').onclick=async()=>{
  resetExternalAnalysisSources();
  await loadImage('./assets/orion.png',{preserveExternal:true});
};

$('loadStatueBtn').onclick=async()=>{
  // Demo resources are deliberately paired, so preserve them while loading.
  externalStarlessImage=await loadRawImage('./assets/ngc3576_starless.png');
  externalStarlessName='ngc3576_starless.png';
  externalSvgText=null;
  externalSvgName='';
  $('starlessState').textContent='Starless externo asociado: ngc3576_starless.png';
  $('svgState').textContent='SVG: no cargado. Se usará vectorización automática.';
  await loadImage('./assets/ngc3576.png',{preserveExternal:true});
};
$('starlessInput').onchange=async e=>{
  const f=e.target.files?.[0]; if(!f)return;
  const url=URL.createObjectURL(f);
  try{ externalStarlessImage=await loadRawImage(url); externalStarlessName=f.name; $('starlessState').textContent='Starless externo asociado: '+f.name; }
  finally{ setTimeout(()=>URL.revokeObjectURL(url),1000); }
  if(currentImage) await analyze(currentImage);
};


$('svgInput').onchange=async e=>{
  const f=e.target.files?.[0]; if(!f)return;
  externalSvgText=await f.text();
  externalSvgName=f.name;
  $('svgState').textContent='SVG cargado: '+f.name;
  if(currentImage) await analyze(currentImage);
};

$('loadIC434SvgBtn').onclick=async()=>{
  externalStarlessImage=await loadRawImage('./assets/IC434_starless.png');
  externalStarlessName='IC434_starless.png';
  externalSvgText=await (await fetch('./assets/IC434_starless.svg')).text();
  externalSvgName='IC434_starless.svg';
  $('starlessState').textContent='Starless externo asociado: IC434_starless.png';
  $('svgState').textContent='SVG asociado: IC434_starless.svg';
  // Demo without separate original-with-stars: use starless as base deliberately.
  currentImage=externalStarlessImage;
  await analyze(currentImage);
};

$('rebuildBtn').onclick=()=>currentImage&&analyze(currentImage);
$('resetSourcesBtn').onclick=async()=>{
  resetExternalAnalysisSources();
  if(currentImage){
    status('Fuentes externas descartadas · recalculando PSF, starless y vectorización automática…');
    await analyze(currentImage);
  }
};
$('homeBtn').onclick=home;$('travelBtn').onclick=()=>controls.lock();
$('showPlane').onchange=()=>{if(plane)plane.visible=$('showPlane').checked};
$('planeZ').oninput=()=>{if(plane)plane.position.z=+$('planeZ').value};
$('planeOpacity').oninput=()=>{if(plane)plane.material.opacity=+$('planeOpacity').value};
$('showWire').onchange=()=>nebulaGroup.traverse(o=>{if(o.material && 'wireframe' in o.material)o.material.wireframe=$('showWire').checked});

async function loadRawImage(url){
  const img=new Image();
  img.decoding='async';
  img.src=url;
  await img.decode();
  return img;
}

async function loadImage(url,{preserveExternal=false}={}){
  if(!preserveExternal) resetExternalAnalysisSources();
  status('Cargando imagen…');
  const img=await loadRawImage(url);
  currentImage=img;
  await analyze(img);
}

function makeCanvas(img){
  const maxDim=640,s=Math.min(1,maxDim/Math.max(img.naturalWidth,img.naturalHeight));
  const w=Math.max(128,Math.round(img.naturalWidth*s)),h=Math.max(128,Math.round(img.naturalHeight*s));
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return {c,ctx,w,h}
}
function blurData(src,px){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.filter=`blur(${px}px)`;ctx.drawImage(src,0,0);return ctx.getImageData(0,0,c.width,c.height).data}
function robustStats(a){const x=[...a].sort((a,b)=>a-b),m=x[x.length>>1],d=x.map(v=>Math.abs(v-m)).sort((a,b)=>a-b),mad=d[d.length>>1]||1e-6;return {median:m,sigma:1.4826*mad}}

function detectStars(data,w,h,canvas){
  const bg=blurData(canvas,5),s1=blurData(canvas,1.1),s2=blurData(canvas,2.6),sample=[];
  for(let y=0;y<h;y+=3)for(let x=0;x<w;x+=3){const i=(y*w+x)*4;sample.push(lum(s1[i],s1[i+1],s1[i+2])-lum(s2[i],s2[i+1],s2[i+2]))}
  const st=robustStats(sample),thr=st.median + +$('sigmaThreshold').value*st.sigma,cand=[];
  for(let y=5;y<h-5;y++)for(let x=5;x<w-5;x++){
    const i=(y*w+x)*4,d=lum(s1[i],s1[i+1],s1[i+2])-lum(s2[i],s2[i+1],s2[i+2]);if(d<thr)continue;
    let mx=true;for(let yy=-1;yy<=1&&mx;yy++)for(let xx=-1;xx<=1;xx++){if(!xx&&!yy)continue;const j=((y+yy)*w+x+xx)*4,dj=lum(s1[j],s1[j+1],s1[j+2])-lum(s2[j],s2[j+1],s2[j+2]);if(dj>d){mx=false;break}} if(!mx)continue;
    let sw=0,cx=0,cy=0;const R=5;
    for(let yy=-R;yy<=R;yy++)for(let xx=-R;xx<=R;xx++){const j=((y+yy)*w+x+xx)*4,v=Math.max(0,lum(data[j],data[j+1],data[j+2])-lum(bg[j],bg[j+1],bg[j+2]));sw+=v;cx+=v*xx;cy+=v*yy}
    if(sw<1e-7)continue;cx/=sw;cy/=sw;let a=0,b=0,c=0;
    for(let yy=-R;yy<=R;yy++)for(let xx=-R;xx<=R;xx++){const j=((y+yy)*w+x+xx)*4,v=Math.max(0,lum(data[j],data[j+1],data[j+2])-lum(bg[j],bg[j+1],bg[j+2])),dx=xx-cx,dy=yy-cy;a+=v*dx*dx;b+=v*dy*dy;c+=v*dx*dy}
    a/=sw;b/=sw;c/=sw;const tr=a+b,det=a*b-c*c,disc=Math.sqrt(Math.max(0,tr*tr/4-det)),l1=Math.max(1e-5,tr/2+disc),l2=Math.max(1e-5,tr/2-disc),q1=Math.sqrt(l1),q2=Math.sqrt(l2),fwhm=2.355*(q1+q2)/2,elong=Math.max(q1,q2)/Math.max(1e-5,Math.min(q1,q2));
    if(fwhm<+$('fwhmMin').value||fwhm>+$('fwhmMax').value||elong>+$('elongMax').value)continue;

    let sr=0,sg=0,sb=0,n=0,br=0,bg2=0,bb=0,bn=0;
    for(let yy=-6;yy<=6;yy++)for(let xx=-6;xx<=6;xx++){const rr=Math.hypot(xx,yy),X=x+xx,Y=y+yy;if(X<0||X>=w||Y<0||Y>=h)continue;const j=(Y*w+X)*4;if(rr<=2.8){sr+=data[j];sg+=data[j+1];sb+=data[j+2];n++}else if(rr>=4.5&&rr<=6){br+=data[j];bg2+=data[j+1];bb+=data[j+2];bn++}}
    let rr=clamp01((sr/Math.max(1,n)-br/Math.max(1,bn))/255),gg=clamp01((sg/Math.max(1,n)-bg2/Math.max(1,bn))/255),bbb=clamp01((sb/Math.max(1,n)-bb/Math.max(1,bn))/255);
    // Remove pathological green casts: stellar continuum should not have green as the isolated dominant channel.
    if(gg>rr*1.18 && gg>bbb*1.18)gg=(rr+bbb)*0.5;
    const mxcol=Math.max(rr,gg,bbb,0.08); rr=clamp01(rr/mxcol);gg=clamp01(gg/mxcol);bbb=clamp01(bbb/mxcol);
    const peak=lum(data[i],data[i+1],data[i+2]);cand.push({x,y,fwhm,elong,r:rr,g:gg,b:bbb,peak,flux:sw});
  }
  cand.sort((a,b)=>b.flux-a.flux);const stars=[];
  for(const s of cand){let ok=true;for(const t of stars){const dx=t.x-s.x,dy=t.y-s.y;if(dx*dx+dy*dy<16){ok=false;break}}if(ok)stars.push(s);if(stars.length>=3500)break}
  return stars;
}

function starlessFrom(data,stars,w,h){
  const mask=new Uint8Array(w*h);
  for(const s of stars){const rx=Math.max(2.5,s.fwhm*1.7),ry=Math.max(2.2,s.fwhm*1.7/Math.max(1,s.elong));
    const R=Math.ceil(rx);for(let yy=-R;yy<=R;yy++)for(let xx=-R;xx<=R;xx++){if((xx*xx)/(rx*rx)+(yy*yy)/(ry*ry)>1)continue;const X=s.x+xx,Y=s.y+yy;if(X>=0&&X<w&&Y>=0&&Y<h)mask[Y*w+X]=255}}
  let out=new Uint8ClampedArray(data),known=new Uint8Array(w*h);for(let p=0;p<w*h;p++)known[p]=mask[p]?0:1;
  for(let pass=0;pass<30;pass++){let changed=0;const nx=new Uint8ClampedArray(out),nk=new Uint8Array(known);
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const p=y*w+x;if(known[p])continue;let sr=0,sg=0,sb=0,n=0;for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++){if(!xx&&!yy)continue;const q=(y+yy)*w+x+xx;if(!known[q])continue;const i=q*4;sr+=out[i];sg+=out[i+1];sb+=out[i+2];n++}if(n>=3){const i=p*4;nx[i]=sr/n;nx[i+1]=sg/n;nx[i+2]=sb/n;nx[i+3]=255;nk[p]=1;changed++}}
    out=nx;known=nk;if(!changed)break}
  return {mask,starless:out};
}
function dataCanvas(data,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');const im=ctx.createImageData(w,h);im.data.set(data);ctx.putImageData(im,0,0);return c}
function imageToSizedData(img,w,h){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
  return ctx.getImageData(0,0,w,h).data;
}
function maskFromDifference(original,starless,w,h){
  const mask=new Uint8Array(w*h);
  for(let p=0;p<w*h;p++){
    const i=p*4;
    const d=(Math.abs(original[i]-starless[i])+Math.abs(original[i+1]-starless[i+1])+Math.abs(original[i+2]-starless[i+2]))/765;
    if(d>.055)mask[p]=255;
  }
  return mask;
}


function rgbFeature(data,i){
  const r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255;
  const l=.2126*r+.7152*g+.0722*b;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b),sat=mx>1e-6?(mx-mn)/mx:0;
  return [r,g,b,l,sat];
}

function kmeansPosterize(starless,w,h,k){
  const src=dataCanvas(starless,w,h);
  const px=+$('vectorBlur').value;
  const data=px>0?blurData(src,px):starless;
  const samples=[];
  const stride=Math.max(1,Math.floor(Math.sqrt(w*h/7000)));
  for(let y=0;y<h;y+=stride)for(let x=0;x<w;x+=stride){
    const i=(y*w+x)*4,f=rgbFeature(data,i);if(f[3]>.012)samples.push(f);
  }
  if(samples.length===0)return {labels:new Int16Array(w*h).fill(-1),centers:[],data};
  const centers=[];
  for(let c=0;c<k;c++)centers.push(samples[Math.floor(c*(samples.length-1)/Math.max(1,k-1))].slice());
  for(let it=0;it<8;it++){
    const sum=Array.from({length:k},()=>[0,0,0,0,0,0]);
    for(const f of samples){let bi=0,bd=1e9;for(let c=0;c<k;c++){
      const q=centers[c];const dr=f[0]-q[0],dg=f[1]-q[1],db=f[2]-q[2],dl=f[3]-q[3],ds=f[4]-q[4];
      const d=dr*dr+dg*dg+db*db+.75*dl*dl+.18*ds*ds;if(d<bd){bd=d;bi=c}
    }const a=sum[bi];for(let j=0;j<5;j++)a[j]+=f[j];a[5]++}
    for(let c=0;c<k;c++){const a=sum[c];if(a[5])for(let j=0;j<5;j++)centers[c][j]=a[j]/a[5]}
  }
  const labels=new Int16Array(w*h);labels.fill(-1);
  for(let p=0;p<w*h;p++){const i=p*4,f=rgbFeature(data,i);if(f[3]<.012)continue;let bi=0,bd=1e9;for(let c=0;c<k;c++){
    const q=centers[c],dr=f[0]-q[0],dg=f[1]-q[1],db=f[2]-q[2],dl=f[3]-q[3],ds=f[4]-q[4],d=dr*dr+dg*dg+db*db+.75*dl*dl+.18*ds*ds;if(d<bd){bd=d;bi=c}
  }labels[p]=bi}
  return {labels,centers,data};
}


let generatedSvgText='';

function traceStarlessToSvg(starless,w,h){
  if(!window.ImageTracer){ console.warn('ImageTracer no disponible'); return ''; }
  const detail=+$('traceDetail').value;
  const imgd=new ImageData(new Uint8ClampedArray(starless),w,h);
  return window.ImageTracer.imagedataToSVG(imgd,{
    ltres:detail, qtres:detail,
    pathomit:+$('tracePathOmit').value,
    rightangleenhance:false,
    colorsampling:2,
    numberofcolors:+$('traceColors').value,
    mincolorratio:0, colorquantcycles:4, layering:0,
    strokewidth:0, linefilter:false, scale:1, roundcoords:2,
    viewbox:true, desc:false,
    blurradius:+$('vectorBlur').value, blurdelta:24
  });
}
async function drawSvgDiagnostic(svgText,canvas,w,h){
  if(!svgText)return false;
  const blob=new Blob([svgText],{type:'image/svg+xml'}),url=URL.createObjectURL(blob);
  try{const img=await loadRawImage(url);canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);return true}
  finally{URL.revokeObjectURL(url)}
}
function diagTitle(id){return {diagOriginal:'Original',diagStarless:'Starless',diagMask:'PSF mask',diagForms:'Vector SVG',diagPoster:'Posterizado'}[id]||'Diagnóstico'}
function openDiagnostic(id){
  const src=$(id),dst=$('diagModalCanvas');if(!src||!src.width)return;
  dst.width=src.width;dst.height=src.height;dst.getContext('2d').drawImage(src,0,0);
  $('diagModalTitle').textContent=diagTitle(id)+` · ${src.width}×${src.height}`;
  $('diagModal').classList.add('open');$('diagModal').setAttribute('aria-hidden','false');
  $('diagCopyState').textContent='Puedes copiarla y pegarla directamente en el chat.';
}
async function copyDiagnostic(){
  const c=$('diagModalCanvas');
  try{
    const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)throw 0;
    if(!navigator.clipboard?.write||!window.ClipboardItem)throw 0;
    await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
    $('diagCopyState').textContent='✓ Imagen copiada al portapapeles.';
  }catch(e){$('diagCopyState').textContent='El navegador no permitió copiar. Usa “Guardar PNG”.'}
}
function saveDiagnostic(){
  const c=$('diagModalCanvas'),a=document.createElement('a');
  a.download=($('diagModalTitle').textContent.split(' · ')[0]||'diagnostico').replace(/\s+/g,'_')+'.png';
  a.href=c.toDataURL('image/png');a.click();
}
document.querySelectorAll('#diag [data-diag]').forEach(card=>card.addEventListener('click',()=>openDiagnostic(card.dataset.diag)));
$('diagCloseBtn').onclick=()=>{$('diagModal').classList.remove('open');$('diagModal').setAttribute('aria-hidden','true')};
$('diagModal').addEventListener('click',e=>{if(e.target===$('diagModal'))$('diagCloseBtn').click()});
$('diagCopyBtn').onclick=copyDiagnostic;
$('diagSaveBtn').onclick=saveDiagnostic;

function segmentForms(starless,w,h){
  const k=+$('vectorColors').value;
  const post=kmeansPosterize(starless,w,h,k);
  const labels=post.labels,seen=new Uint8Array(w*h),forms=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const st=y*w+x,label=labels[st];if(label<0||seen[st])continue;
    const q=[st],pix=[];seen[st]=1;let sx=0,sy=0,sr=0,sg=0,sb=0,sl=0;
    while(q.length){const p=q.pop(),px=p%w,py=(p/w)|0;pix.push(p);sx+=px;sy+=py;const i=p*4;sr+=starless[i];sg+=starless[i+1];sb+=starless[i+2];sl+=lum(starless[i],starless[i+1],starless[i+2]);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=px+dx,Y=py+dy;if(X<0||X>=w||Y<0||Y>=h)continue;const np=Y*w+X;if(!seen[np]&&labels[np]===label){seen[np]=1;q.push(np)}}
    }
    if(pix.length>=+$('minArea').value){forms.push({pix,area:pix.length,cx:sx/pix.length,cy:sy/pix.length,color:[sr/pix.length/255,sg/pix.length/255,sb/pix.length/255],meanLum:sl/pix.length,cluster:label})}
  }
  // prefer meaningful medium/small regions, but keep some large envelopes
  forms.sort((a,b)=>a.area-b.area);
  const max=+$('maxForms').value;
  if(forms.length>max){
    const small=forms.slice(0,Math.floor(max*.72));
    const rest=forms.slice(Math.floor(forms.length*.55));
    const step=Math.max(1,Math.floor(rest.length/Math.max(1,max-small.length)));
    for(let i=0;i<rest.length&&small.length<max;i+=step)small.push(rest[i]);
    forms.splice(0,forms.length,...small);
  }
  forms.poster=post;
  return forms;
}

function polygonArea(pts){let a=0;for(let i=0,j=pts.length-1;i<pts.length;j=i++)a+=pts[j][0]*pts[i][1]-pts[i][0]*pts[j][1];return a*.5}
function boundary(form,w,h){
  // SVG-like vector tracing: build oriented pixel-boundary edges, then join them into loops.
  const set=new Set(form.pix),edges=[];
  const add=(x1,y1,x2,y2)=>edges.push([[x1,y1],[x2,y2]]);
  for(const p of form.pix){const x=p%w,y=(p/w)|0;
    if(y===0||!set.has(p-w))add(x,y,x+1,y);
    if(x===w-1||!set.has(p+1))add(x+1,y,x+1,y+1);
    if(y===h-1||!set.has(p+w))add(x+1,y+1,x,y+1);
    if(x===0||!set.has(p-1))add(x,y+1,x,y);
  }
  const key=p=>p[0]+','+p[1],next=new Map();for(const e of edges){const k=key(e[0]);if(!next.has(k))next.set(k,[]);next.get(k).push(e[1])}
  const used=new Set(),loops=[];
  for(const e of edges){const ek=key(e[0])+'>'+key(e[1]);if(used.has(ek))continue;const loop=[e[0]],start=key(e[0]);let a=e[0],b=e[1],guard=0;
    while(guard++<edges.length+10){used.add(key(a)+'>'+key(b));loop.push(b);if(key(b)===start)break;const opts=next.get(key(b))||[];let c=opts.find(q=>!used.has(key(b)+'>'+key(q)));if(!c)break;a=b;b=c}
    if(loop.length>8)loops.push(loop)
  }
  if(!loops.length)return [];
  let pts=loops.sort((a,b)=>Math.abs(polygonArea(b))-Math.abs(polygonArea(a)))[0];
  // downsample before Chaikin-like smoothing
  const target=130,step=Math.max(1,Math.floor(pts.length/target));pts=pts.filter((_,i)=>i%step===0);
  for(let it=0;it<+$('smooth').value;it++){const out=[];for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length];out.push([.75*p[0]+.25*q[0],.75*p[1]+.25*q[1]]);out.push([.25*p[0]+.75*q[0],.25*p[1]+.75*q[1]])}pts=out;if(pts.length>260)pts=pts.filter((_,i)=>i%2===0)}
  return pts;
}


function colorFromSvgStyle(path){
  const style=path.userData?.style||{};
  const fill=style.fill;
  if(fill && fill !== 'none'){
    try{return new THREE.Color(fill)}catch(e){}
  }
  return new THREE.Color(0.55,0.30,0.42);
}

function shapeSignedArea(points){
  let a=0;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
    a+=points[j].x*points[i].y-points[i].x*points[j].y;
  }
  return a*.5;
}

function svgShapeArea(shape){
  const e=shape.extractPoints(10);
  let a=Math.abs(shapeSignedArea(e.shape));
  for(const h of e.holes||[])a-=Math.abs(shapeSignedArea(h));
  return Math.max(0,a);
}

function addSvgGlow(meshGeometry,color,strength){
  const glowMat=new THREE.ShaderMaterial({
    transparent:true,
    depthWrite:false,
    side:THREE.BackSide,
    blending:THREE.AdditiveBlending,
    uniforms:{uColor:{value:color.clone()},uStrength:{value:strength}},
    vertexShader:`
      varying vec3 vN; varying vec3 vV;
      void main(){
        vec3 p=position;
        vec4 mv=modelViewMatrix*vec4(p*1.025,1.0);
        vN=normalize(normalMatrix*normal);
        vV=normalize(-mv.xyz);
        gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader:`
      uniform vec3 uColor; uniform float uStrength;
      varying vec3 vN; varying vec3 vV;
      void main(){
        float f=pow(1.0-max(0.0,dot(normalize(vN),normalize(vV))),2.0);
        float a=f*uStrength;
        if(a<0.006)discard;
        gl_FragColor=vec4(uColor*(1.05+f*.75),a);
      }`
  });
  return new THREE.Mesh(meshGeometry.clone(),glowMat);
}

function deformSvgGeometry(geo, svgW, svgH, baseW, baseH, zCenter, thickness, seed){
  geo.computeBoundingBox();
  const bb=geo.boundingBox;
  const cx=(bb.min.x+bb.max.x)*.5, cy=(bb.min.y+bb.max.y)*.5;
  const rx=Math.max(1e-4,(bb.max.x-bb.min.x)*.5);
  const ry=Math.max(1e-4,(bb.max.y-bb.min.y)*.5);
  const pos=geo.attributes.position;
  const spherize=+$('spherize').value;
  const round=+$('svgRound').value;
  const noiseAmt=+$('cloudNoise').value;

  for(let i=0;i<pos.count;i++){
    let x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
    // ExtrudeGeometry gives depth ~ 0..thickness.
    const tz=clamp((z-thickness*.5)/(thickness*.5),-1,1);
    const sphere=Math.sqrt(Math.max(0,1-tz*tz));
    const profile=(1-round)+round*(.36+.64*sphere);

    const lx=(x-cx),ly=(y-cy);
    const nx=lx/rx,ny=ly/ry;
    const n1=Math.sin((x+seed*17.1)*.055)+Math.cos((y-seed*9.7)*.047);
    const n2=Math.sin((x+y+seed*31.0)*.021);
    const noise=(n1*.65+n2*.35)*.5*noiseAmt*sphere;

    x=cx+lx*profile*(1+noise*.10);
    y=cy+ly*profile*(1+noise*.10);

    // Move from SVG pixel coordinates to the global world coordinate system.
    const worldX=(x/svgW-.5)*baseW;
    const worldY=(.5-y/svgH)*baseH;
    const radial=Math.min(1,Math.hypot(nx,ny));
    const bulge=(1-radial*radial)*thickness*.13*spherize*(1-Math.abs(tz));
    const worldZ=zCenter+(z-thickness*.5)+bulge*Math.sign(tz||1)+noise*thickness*.06;

    // Perspective correction so HOME approximately reprojects to the same place.
    const k=(HOME_Z-worldZ)/HOME_Z;
    pos.setXYZ(i,worldX*k,worldY*k,worldZ);
  }
  pos.needsUpdate=true;
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
}


function fract(x){ return x-Math.floor(x); }
function hash3i(x,y,z,seed){
  const n=x*157.0+y*311.7+z*911.3+seed*101.3;
  return fract(Math.sin(n)*43758.5453123);
}
function smoothstep01(t){ return t*t*(3-2*t); }
function valueNoise3(x,y,z,seed=0){
  const xi=Math.floor(x), yi=Math.floor(y), zi=Math.floor(z);
  const xf=x-xi, yf=y-yi, zf=z-zi;
  const u=smoothstep01(xf), v=smoothstep01(yf), wv=smoothstep01(zf);

  const n000=hash3i(xi,yi,zi,seed), n100=hash3i(xi+1,yi,zi,seed);
  const n010=hash3i(xi,yi+1,zi,seed), n110=hash3i(xi+1,yi+1,zi,seed);
  const n001=hash3i(xi,yi,zi+1,seed), n101=hash3i(xi+1,yi,zi+1,seed);
  const n011=hash3i(xi,yi+1,zi+1,seed), n111=hash3i(xi+1,yi+1,zi+1,seed);

  const x00=THREE.MathUtils.lerp(n000,n100,u);
  const x10=THREE.MathUtils.lerp(n010,n110,u);
  const x01=THREE.MathUtils.lerp(n001,n101,u);
  const x11=THREE.MathUtils.lerp(n011,n111,u);
  const y0=THREE.MathUtils.lerp(x00,x10,v);
  const y1=THREE.MathUtils.lerp(x01,x11,v);
  return THREE.MathUtils.lerp(y0,y1,wv);
}

// Adaptación 3D de la idea del artículo:
// noise samplea noise repetidamente y usa el desplazamiento para deformar el dominio.
function warpedNoise3(x,y,z,seed=0){
  let dx=0,dy=0,dz=0;
  let scale=16.0;
  for(let i=0;i<5;i++){
    const a=valueNoise3(x*scale+dx*1.7,y*scale+dy*1.7,z*scale+dz*1.7,seed+i*17);
    const b=valueNoise3(x*scale+13.1+dy,y*scale-7.3+dz,z*scale+5.7+dx,seed+31+i*11);
    const c=valueNoise3(x*scale-4.9+dz,y*scale+9.2+dx,z*scale-12.4+dy,seed+61+i*7);
    dx=a-.5; dy=b-.5; dz=c-.5;
    scale*=.5;
  }
  return valueNoise3(x+dx*1.8,y+dy*1.8,z+dz*1.8,seed+97);
}

function triangleArea2(a,b,c){
  return Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x))*.5;
}

function prepareShapeSampler(shape,curveSegments=12){
  const pts=shape.extractPoints(curveSegments);
  const contour=pts.shape.map(p=>new THREE.Vector2(p.x,p.y));
  const holes=(pts.holes||[]).map(h=>h.map(p=>new THREE.Vector2(p.x,p.y)));
  const faces=THREE.ShapeUtils.triangulateShape(contour,holes);

  // triangulateShape indexes into contour + holes flattened in this order.
  const vertices=[...contour];
  for(const h of holes)vertices.push(...h);

  const tris=[];
  let total=0;
  for(const f of faces){
    const a=vertices[f[0]], b=vertices[f[1]], c=vertices[f[2]];
    if(!a||!b||!c)continue;
    const ar=triangleArea2(a,b,c);
    if(ar<=1e-8)continue;
    total+=ar;
    tris.push({a,b,c,cum:total});
  }
  return {tris,total,contour,holes};
}

function sampleShape2D(sampler,rng=Math.random){
  if(!sampler.tris.length)return null;
  const t=rng()*sampler.total;
  let lo=0,hi=sampler.tris.length-1;
  while(lo<hi){
    const mid=(lo+hi)>>1;
    if(t<=sampler.tris[mid].cum)hi=mid; else lo=mid+1;
  }
  const tr=sampler.tris[lo];
  let u=rng(),v=rng();
  if(u+v>1){u=1-u;v=1-v;}
  return new THREE.Vector2(
    tr.a.x+u*(tr.b.x-tr.a.x)+v*(tr.c.x-tr.a.x),
    tr.a.y+u*(tr.b.y-tr.a.y)+v*(tr.c.y-tr.a.y)
  );
}

function seededRandom(seed){
  let a=(seed>>>0)||1;
  return ()=>{
    a|=0; a=a+0x6D2B79F5|0;
    let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296;
  };
}

function buildProceduralGasFromShapeItems(items,starless,w,h,baseW,baseH,svgW,svgH){
  clearNebula();

  if(!items.length)return 0;

  const maxParticles=+$('gasParticles').value;
  const noiseScale=+$('noiseScale').value;
  const warp=+$('noiseWarp').value;
  const densityBias=+$('procDensity').value;
  const falloff=+$('procFalloff').value;
  const volumeThickness=+$('volumeThickness').value;
  const pointScale=+$('gasPointSize').value;
  const emission=+$('procEmission').value;
  const nebulaDepth=+$('nebulaDepth').value;

  const maxArea=Math.max(1,...items.map(x=>x.area||1));
  const totalArea=Math.max(1,items.reduce((s,x)=>s+(x.area||1),0));

  const positions=[],colors=[],sizes=[],alphas=[];
  const rng=seededRandom(0xA57E0 + items.length*7919);

  // We generate more candidates than final particles, then density/noise rejects them.
  for(let itemIndex=0; itemIndex<items.length; itemIndex++){
    const item=items[itemIndex];
    const sampler=prepareShapeSampler(item.shape,12);
    if(!sampler.total)continue;

    const areaWeight=(item.area||sampler.total)/totalArea;
    const target=Math.max(40,Math.round(maxParticles*areaWeight));
    const areaN=Math.sqrt((item.area||sampler.total)/maxArea);

    let accepted=0,attempts=0;
    const maxAttempts=target*12;
    const seed=itemIndex*37+13;

    // Smaller internal shapes stay denser and closer to the central depth.
    const zSpread=(5+nebulaDepth*.18*(.45+areaN))*volumeThickness;
    const zCenter=Math.sin((itemIndex+1)*2.399963)*nebulaDepth*.07*areaN;

    // Approximate center/radius from triangulation vertices for rounded 3D contraction.
    const allV=[];
    for(const t of sampler.tris){allV.push(t.a,t.b,t.c);}
    let cx=0,cy=0;
    for(const p of allV){cx+=p.x;cy+=p.y;}
    cx/=Math.max(1,allV.length);cy/=Math.max(1,allV.length);
    let rx=1,ry=1;
    for(const p of allV){rx=Math.max(rx,Math.abs(p.x-cx));ry=Math.max(ry,Math.abs(p.y-cy));}

    while(accepted<target && attempts<maxAttempts){
      attempts++;
      const p=sampleShape2D(sampler,rng);
      if(!p)break;

      // True volume: random depth, not a front/back mesh surface.
      const rz=(rng()+rng()+rng()-1.5)/1.5; // roughly bell-shaped -1..1
      const zLocal=rz*zSpread;

      // Rounded 3D body: deeper samples contract toward the region center.
      const zNorm=Math.min(1,Math.abs(zLocal)/Math.max(1e-6,zSpread));
      const roundProfile=.34+.66*Math.sqrt(Math.max(0,1-zNorm*zNorm));
      let px=cx+(p.x-cx)*roundProfile;
      let py=cy+(p.y-cy)*roundProfile;

      // Article-inspired recursive displacement / domain warp.
      const nx=(px/svgW-.5)*noiseScale;
      const ny=(py/svgH-.5)*noiseScale;
      const nz=(zLocal/Math.max(1,zSpread))*noiseScale*.85;
      const n=warpedNoise3(nx*2.2,ny*2.2,nz*2.2,seed);

      // Same shaping concept as pow(noise + density, falloff).
      const shaped=Math.pow(Math.max(0,n+densityBias),falloff);
      if(rng()>Math.min(1,shaped*3.4))continue;

      // Extra warping of the actual coordinates creates wispy filaments.
      const wx=warpedNoise3(nx*1.3+7.1,ny*1.3,nz*1.3,seed+101)-.5;
      const wy=warpedNoise3(nx*1.3,ny*1.3-5.3,nz*1.3,seed+151)-.5;
      const wz=warpedNoise3(nx*1.1,ny*1.1,nz*1.1+9.7,seed+211)-.5;
      px+=wx*warp*rx*.055;
      py+=wy*warp*ry*.055;
      const z=zCenter+zLocal+wz*warp*zSpread*.22;

      const u=clamp01(px/svgW), v=clamp01(py/svgH);
      const ix=Math.min(w-1,Math.max(0,Math.round(u*(w-1))));
      const iy=Math.min(h-1,Math.max(0,Math.round(v*(h-1))));
      const ii=(iy*w+ix)*4;
      let r=starless[ii]/255,g=starless[ii+1]/255,b=starless[ii+2]/255;
      const L=0.2126*r+0.7152*g+0.0722*b;

      // Suppress almost-black background and let brighter real structures emit more.
      const imageSignal=clamp01((L-.008)/.28);
      if(rng()>Math.max(.08,imageSignal))continue;

      // Map SVG/photo coordinates to scene coordinates.
      const worldX=(u-.5)*baseW;
      const worldY=(.5-v)*baseH;
      const k=(HOME_Z-z)/HOME_Z;
      positions.push(worldX*k,worldY*k,z);

      // Preserve source hue, but enhance real emission rather than inventing flat fill color.
      const boost=.72+emission*(.35+imageSignal*.65);
      colors.push(clamp01(r*boost),clamp01(g*boost),clamp01(b*boost));

      const ps=(1.4+4.2*(1-imageSignal)+4.8*shaped)*pointScale;
      sizes.push(ps);
      alphas.push(clamp01(.035+.22*imageSignal+.20*shaped));

      accepted++;
    }
  }

  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geo.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));
  geo.setAttribute('aAlpha',new THREE.Float32BufferAttribute(alphas,1));

  const mat=new THREE.ShaderMaterial({
    transparent:true,
    depthWrite:false,
    blending:THREE.NormalBlending,
    vertexColors:true,
    uniforms:{uPixelRatio:{value:Math.min(devicePixelRatio,2)}},
    vertexShader:`
      attribute float aSize;
      attribute float aAlpha;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uPixelRatio;
      void main(){
        vColor=color;
        vAlpha=aAlpha;
        vec4 mv=modelViewMatrix*vec4(position,1.0);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=clamp(aSize*uPixelRatio*(180.0/max(8.0,-mv.z)),1.0,54.0);
      }`,
    fragmentShader:`
      varying vec3 vColor;
      varying float vAlpha;
      void main(){
        vec2 q=gl_PointCoord-.5;
        float r=length(q)*2.0;
        if(r>1.0)discard;
        float soft=exp(-3.2*r*r)*(1.0-smoothstep(.72,1.0,r));
        float core=exp(-11.0*r*r);
        float a=vAlpha*soft;
        if(a<.002)discard;
        gl_FragColor=vec4(vColor*(.76+.38*core),a);
      }`
  });

  const gas=new THREE.Points(geo,mat);
  gas.name='ProceduralNebulaGas';
  gas.renderOrder=15;
  nebulaGroup.add(gas);

  return positions.length/3;
}

function autoFormsToShapeItems(forms,w,h){
  const items=[];
  for(const f of forms){
    const pts=boundary(f,w,h);
    if(pts.length<3)continue;
    const shape=new THREE.Shape();
    shape.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i++)shape.lineTo(pts[i][0],pts[i][1]);
    shape.closePath();
    items.push({
      shape,
      area:f.area||100,
      color:new THREE.Color(1,1,1)
    });
  }
  return items;
}

function buildNebulaFromSvg(svgText, starless, w,h, baseW,baseH){
  const loader=new SVGLoader();
  const parsed=loader.parse(svgText);

  const vbMatch=svgText.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  let svgW=w,svgH=h;
  if(vbMatch){
    const p=vbMatch[1].trim().split(/[\s,]+/).map(Number);
    if(p.length===4 && p[2]>0 && p[3]>0){svgW=p[2];svgH=p[3]}
  }

  const candidates=[];
  for(const path of parsed.paths){
    const color=colorFromSvgStyle(path);
    const shapes=SVGLoader.createShapes(path);
    for(const shape of shapes){
      const area=svgShapeArea(shape);
      if(area<+$('svgMinArea').value)continue;
      candidates.push({shape,color,area,path});
    }
  }

  candidates.sort((a,b)=>b.area-a.area);
  const max=+$('svgMaxPaths').value;
  let selected=candidates;
  if(candidates.length>max){
    const large=candidates.slice(0,Math.floor(max*.45));
    const remainder=candidates.slice(Math.floor(max*.10));
    const step=Math.max(1,Math.floor(remainder.length/Math.max(1,max-large.length)));
    selected=[...large];
    for(let i=0;i<remainder.length && selected.length<max;i+=step)selected.push(remainder[i]);
  }

  // NEW MAIN RENDERER:
  // SVG defines the spatial domain, but the visible object is procedural gas inside it.
  const particleCount=buildProceduralGasFromShapeItems(
    selected,starless,w,h,baseW,baseH,svgW,svgH
  );

  // Optional legacy meshes only for comparison/debug.
  if($('showLegacyMesh')?.checked){
    const maxArea=Math.max(1,...selected.map(x=>x.area));
    selected.slice(0,Math.min(60,selected.length)).forEach((item,idx)=>{
      const areaN=Math.sqrt(item.area/maxArea);
      const thickness=+$('thickness').value*(.45+1.0*areaN);
      const geo=new THREE.ExtrudeGeometry(item.shape,{
        depth:thickness,steps:1,bevelEnabled:true,bevelSegments:3,
        bevelSize:.2,bevelThickness:Math.max(.1,thickness*.10),curveSegments:8
      });
      deformSvgGeometry(geo,svgW,svgH,baseW,baseH,0,thickness,idx+1);
      const mat=new THREE.MeshBasicMaterial({
        color:item.color,transparent:true,opacity:.035,
        wireframe:true,depthWrite:false,side:THREE.DoubleSide
      });
      nebulaGroup.add(new THREE.Mesh(geo,mat));
    });
  }

  return {shapeCount:selected.length,particleCount};
}

function disposeDeep(o){
  if(!o) return;
  o.traverse?.(x=>{
    x.geometry?.dispose?.();
    if(x.material){
      const mats=Array.isArray(x.material)?x.material:[x.material];
      mats.forEach(m=>{
        m.map?.dispose?.();
        if(m.uniforms){
          for(const u of Object.values(m.uniforms)){
            if(u?.value?.isTexture) u.value.dispose();
          }
        }
        m.dispose?.();
      });
    }
  });
  o.parent?.remove(o);
}
function clearNebula(){while(nebulaGroup.children.length)disposeDeep(nebulaGroup.children[0])}
function dispose(o){disposeDeep(o)}

function hashNoise(a,b,c){
  const s=Math.sin(a*12.9898+b*78.233+c*37.719)*43758.5453123;
  return (s-Math.floor(s))*2-1;
}

function buildFormMesh(form,pts,starless,w,h,baseW,baseH,rank,total){
  if(pts.length<4)return null;
  const smallness=1-rank/Math.max(1,total-1);
  const opacity=+$('outerOpacity').value+(+$('innerOpacity').value-+$('outerOpacity').value)*smallness;
  const baseTh=+$('thickness').value;
  const thickness=baseTh*(.80+1.55*(1-smallness));
  const depth=+$('nebulaDepth').value;
  const spherize=+$('spherize').value;
  const noiseAmt=+$('cloudNoise').value;
  const emission=+$('nebulaEmission').value;
  const glowAmount=+$('nebulaGlow').value;
  const sign=(rank%2===0)?1:-1;
  const zCenter=sign*(1-smallness)*depth*.08+(form.cx/w-.5)*depth*.035;

  let rx=1,ry=1;
  for(const [x,y] of pts){rx=Math.max(rx,Math.abs(x-form.cx));ry=Math.max(ry,Math.abs(y-form.cy));}

  const rings=9,n=pts.length,positions=[],uvs=[],indices=[];
  for(let rz=0;rz<rings;rz++){
    const t=rz/(rings-1)*2-1;
    const sphereProfile=Math.sqrt(Math.max(0,1-t*t));
    const contourScale=(1-spherize)+spherize*(.20+.80*sphereProfile);
    const zBase=zCenter+t*thickness*.5;
    for(let i=0;i<n;i++){
      const [px,py]=pts[i],localX=px-form.cx,localY=py-form.cy;
      const nxLocal=localX/rx,nyLocal=localY/ry;
      const nn=hashNoise(px*.035,py*.035,rz*.71),nn2=hashNoise(px*.017+4.7,py*.021-2.4,rank*.91);
      const turbulence=(nn*.65+nn2*.35)*noiseAmt*sphereProfile;
      const radialScale=contourScale*(1+turbulence*.28);
      const xPix=form.cx+localX*radialScale,yPix=form.cy+localY*radialScale;
      const rr=Math.min(1,Math.hypot(nxLocal,nyLocal));
      const centerBulge=(1-rr*rr)*thickness*.20*spherize;
      const z=zBase+Math.sign(t||1)*centerBulge*(1-Math.abs(t))+turbulence*thickness*.13;
      const sx=xPix/(w-1)-.5,sy=.5-yPix/(h-1),k=(HOME_Z-z)/HOME_Z;
      positions.push(sx*baseW*k,sy*baseH*k,z);
      uvs.push(clamp01(px/(w-1)),clamp01(1-py/(h-1)));
    }
  }
  for(let r=0;r<rings-1;r++){
    const a0=r*n,b0=(r+1)*n;
    for(let i=0;i<n;i++){const j=(i+1)%n;indices.push(a0+i,a0+j,b0+j,a0+i,b0+j,b0+i);}
  }
  const centerBack=positions.length/3;
  {const z=zCenter-thickness*.5,k=(HOME_Z-z)/HOME_Z;positions.push((form.cx/(w-1)-.5)*baseW*k,(.5-form.cy/(h-1))*baseH*k,z);uvs.push(form.cx/(w-1),1-form.cy/(h-1));}
  const centerFront=positions.length/3;
  {const z=zCenter+thickness*.5,k=(HOME_Z-z)/HOME_Z;positions.push((form.cx/(w-1)-.5)*baseW*k,(.5-form.cy/(h-1))*baseH*k,z);uvs.push(form.cx/(w-1),1-form.cy/(h-1));}
  for(let i=0;i<n;i++){const j=(i+1)%n;indices.push(centerBack,j,i);const last=(rings-1)*n;indices.push(centerFront,last+i,last+j);}

  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geo.setIndex(indices);geo.computeVertexNormals();

  const tex=new THREE.CanvasTexture(dataCanvas(starless,w,h));tex.colorSpace=THREE.SRGBColorSpace;
  const c=form.color||[.8,.5,.7];
  const avgColor=new THREE.Color(clamp01(c[0]*emission),clamp01(c[1]*emission),clamp01(c[2]*emission));
  const mat=new THREE.MeshStandardMaterial({map:tex,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide,roughness:1,metalness:0,emissive:avgColor,emissiveIntensity:.30+.45*clamp01(form.meanLum||.2)});
  const cloud=new THREE.Mesh(geo,mat);cloud.renderOrder=10+rank;

  const glowMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.BackSide,blending:THREE.AdditiveBlending,uniforms:{uColor:{value:avgColor.clone()},uStrength:{value:glowAmount*(.28+.72*(form.meanLum||.18))}},
    vertexShader:`varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position*1.045,1.0);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform vec3 uColor;uniform float uStrength;varying vec3 vN;varying vec3 vV;void main(){float fres=pow(1.0-max(0.0,dot(normalize(vN),normalize(vV))),2.2);float a=fres*uStrength;if(a<.008)discard;gl_FragColor=vec4(uColor*(1.05+fres),a);}`});
  const glow=new THREE.Mesh(geo.clone(),glowMat);glow.renderOrder=20+rank;
  const group=new THREE.Group();group.add(cloud);group.add(glow);group.userData.isNebulaForm=true;return group;
}

function buildStars(stars,w,h,baseW,baseH){
  dispose(starsCore);dispose(starsGlow);starsCore=starsGlow=null;
  const depth=90,coreScale=+$('coreScale').value;
  const geo=new THREE.SphereGeometry(1,16,10);
  // White material + explicit instance colors. This avoids black stellar cores.
  const mat=new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false});
  starsCore=new THREE.InstancedMesh(geo,mat,stars.length);
  const dummy=new THREE.Object3D(),col=new THREE.Color();
  const gp=[],gc=[],gs=[],gf=[];
  stars.forEach((s,i)=>{
    const z01=clamp01(.16+.68*(1-Math.pow(clamp01(s.peak),.75))),z=(z01-.5)*depth,k=(HOME_Z-z)/HOME_Z,x=(s.x/(w-1)-.5)*baseW*k,y=(.5-s.y/(h-1))*baseH*k;
    // luminous, non-black core; preserve measured stellar hue
    const mn=.22; let rr=Math.max(mn,s.r),gg=Math.max(mn,s.g),bb=Math.max(mn,s.b);
    const mx=Math.max(rr,gg,bb);rr/=mx;gg/=mx;bb/=mx;
    col.setRGB(rr,gg,bb);
    dummy.position.set(x,y,z);dummy.scale.setScalar((.055+.045*Math.sqrt(Math.max(.5,s.fwhm))+.10*Math.sqrt(clamp01(s.peak)))*coreScale);dummy.updateMatrix();
    starsCore.setMatrixAt(i,dummy.matrix);starsCore.setColorAt(i,col);
    gp.push(x,y,z);gc.push(rr,gg,bb);gs.push((10+18*Math.sqrt(clamp01(s.peak))+5*s.fwhm)*+$('glowScale').value);gf.push(.45+.55*Math.sqrt(clamp01(s.peak)));
  });
  starsCore.instanceMatrix.needsUpdate=true;if(starsCore.instanceColor)starsCore.instanceColor.needsUpdate=true;root.add(starsCore);

  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(gp,3));gg.setAttribute('color',new THREE.Float32BufferAttribute(gc,3));gg.setAttribute('aSize',new THREE.Float32BufferAttribute(gs,1));gg.setAttribute('aFlux',new THREE.Float32BufferAttribute(gf,1));
  const gm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true,uniforms:{uGlow:{value:+$('glowIntensity').value}},
    vertexShader:`attribute float aSize;attribute float aFlux;varying vec3 vColor;varying float vFlux;void main(){vColor=color;vFlux=aFlux;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*115.0/max(2.0,-mv.z),2.0,84.0);}`,
    fragmentShader:`uniform float uGlow;varying vec3 vColor;varying float vFlux;void main(){vec2 p=gl_PointCoord-.5;float r=length(p)*2.0;if(r>1.0)discard;float core=exp(-18.0*r*r);float halo=.75*exp(-4.0*r*r);float outer=.18*exp(-1.45*r*r);float a=(core+halo+outer)*(1.0-smoothstep(.75,1.0,r))*vFlux*uGlow;gl_FragColor=vec4(vColor*(.9+1.8*core+.5*halo),a);}`});
  starsGlow=new THREE.Points(gg,gm);root.add(starsGlow);
}

function buildPlane(starless,w,h,baseW,baseH){
  dispose(plane);const tex=new THREE.CanvasTexture(dataCanvas(starless,w,h));tex.colorSpace=THREE.SRGBColorSpace;const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:+$('planeOpacity').value,depthWrite:false,side:THREE.DoubleSide});
  plane=new THREE.Mesh(new THREE.PlaneGeometry(baseW,baseH),mat);plane.position.z=+$('planeZ').value;plane.visible=$('showPlane').checked;root.add(plane);
}
async function diagnostics(src,starless,mask,forms,w,h,svgText=''){
  const a=$('diagOriginal');a.width=w;a.height=h;a.getContext('2d').drawImage(src,0,0);
  const b=$('diagStarless');b.width=w;b.height=h;let ctx=b.getContext('2d'),im=ctx.createImageData(w,h);im.data.set(starless);ctx.putImageData(im,0,0);
  const c=$('diagMask');c.width=w;c.height=h;ctx=c.getContext('2d');im=ctx.createImageData(w,h);for(let p=0;p<w*h;p++){const v=mask[p]?255:0,i=p*4;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}ctx.putImageData(im,0,0);
  const d=$('diagForms');
  if(svgText){await drawSvgDiagnostic(svgText,d,w,h)}
  else{d.width=w;d.height=h;ctx=d.getContext('2d');ctx.drawImage(dataCanvas(starless,w,h),0,0);forms.forEach((f,i)=>{const pts=boundary(f,w,h);ctx.strokeStyle=`hsl(${(i*49)%360} 95% 65%)`;ctx.lineWidth=1.2;ctx.beginPath();pts.forEach((p,j)=>j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.stroke()})}
  const pp=$('diagPoster');pp.width=w;pp.height=h;const pctx=pp.getContext('2d'),pim=pctx.createImageData(w,h),post=forms.poster;
  if(post){for(let p=0;p<w*h;p++){const c=post.labels[p];const i=p*4;if(c>=0){const q=post.centers[c];pim.data[i]=q[0]*255;pim.data[i+1]=q[1]*255;pim.data[i+2]=q[2]*255;pim.data[i+3]=255}else{pim.data[i+3]=255}}pctx.putImageData(pim,0,0)}
}

async function analyze(img){
  const starlessMode=externalStarlessImage ? `externo: ${externalStarlessName||'cargado'}` : 'automático PSF/inpainting';
  const vectorMode=externalSvgText ? `SVG: ${externalSvgName||'cargado'}` : 'vectorización automática';
  status(`PSF → starless (${starlessMode}) → ${vectorMode} → gas 3D…`);
  await new Promise(r=>requestAnimationFrame(r));

  const {c,ctx,w,h}=makeCanvas(img);
  const data=ctx.getImageData(0,0,w,h).data;
  const stars=detectStars(data,w,h,c);

  let mask,starless;
  if(externalStarlessImage){
    starless=new Uint8ClampedArray(imageToSizedData(externalStarlessImage,w,h));
    mask=maskFromDifference(data,starless,w,h);
  }else{
    const auto=starlessFrom(data,stars,w,h);
    mask=auto.mask;
    starless=auto.starless;
  }

  const baseH=72,baseW=baseH*w/h;
  let forms=[];
  let formCount=0;

  generatedSvgText='';
  if(externalSvgText){
    generatedSvgText=externalSvgText;
    const proc=buildNebulaFromSvg(generatedSvgText,starless,w,h,baseW,baseH);
    formCount=proc.shapeCount;
    $('svgState').textContent=`SVG externo · ${proc.shapeCount} formas · ${proc.particleCount} partículas`;
  }else if($('vectorMethod').value==='imagetracer' && window.ImageTracer){
    status('Vectorizando starless a SVG de alta fidelidad con ImageTracer…');
    await new Promise(r=>requestAnimationFrame(r));
    generatedSvgText=traceStarlessToSvg(starless,w,h);
    const proc=buildNebulaFromSvg(generatedSvgText,starless,w,h,baseW,baseH);
    formCount=proc.shapeCount;
    $('svgState').textContent=`ImageTracer SVG · ${proc.shapeCount} formas · ${proc.particleCount} partículas`;
  }else{
    forms=segmentForms(starless,w,h);
    const items=autoFormsToShapeItems(forms,w,h);
    const particleCount=buildProceduralGasFromShapeItems(items,starless,w,h,baseW,baseH,w,h);
    formCount=forms.length;
    $('svgState').textContent=`Vector legacy · ${formCount} formas · ${particleCount} partículas`;
  }

  nebulaGroup.traverse(o=>{
    if(o.material && 'wireframe' in o.material)o.material.wireframe=$('showWire').checked;
  });

  buildStars(stars,w,h,baseW,baseH);
  buildPlane(starless,w,h,baseW,baseH);
  await diagnostics(c,starless,mask,forms,w,h,generatedSvgText);

  currentAnalysis={stars,starless,mask,forms,w,h};
  $('starCount').textContent=stars.length;
  $('formCount').textContent=formCount;
  $('analysisSize').textContent=`${w}×${h}`;
  home();
  status(
    `Listo · PSF: ${stars.length} estrellas · `+
    `starless: ${externalStarlessImage?'externo':'automático'} · `+
    `vector: ${externalSvgText?'SVG externo':($('vectorMethod').value==='imagetracer'?'ImageTracer SVG':formCount+' formas legacy')}`
  );
}
function home(){controls.unlock();camera.position.set(0,0,HOME_Z);camera.rotation.set(0,0,0)}
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(.05,clock.getDelta());if(controls.isLocked){const sp=28;if(keys.has('KeyW'))controls.moveForward(sp*dt);if(keys.has('KeyS'))controls.moveForward(-sp*dt);if(keys.has('KeyA'))controls.moveRight(-sp*dt);if(keys.has('KeyD'))controls.moveRight(sp*dt);if(keys.has('Space'))camera.position.y+=sp*dt;if(keys.has('ShiftLeft')||keys.has('ShiftRight'))camera.position.y-=sp*dt}if(starsGlow)starsGlow.material.uniforms.uGlow.value=+$('glowIntensity').value;renderer.render(scene,camera)}animate();

loadImage('./assets/orion.png',{preserveExternal:false}).catch(err=>{console.error(err);status('Error: revisa /three/ y consola.')});
