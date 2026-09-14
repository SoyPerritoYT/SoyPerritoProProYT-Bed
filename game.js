const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const W=24,H=14; let scale=1, selected=0, yaw=0, pitch=0;
const blocks=[['🟩','Hierba'],['🟫','Tierra'],['🪨','Piedra'],['🟨','Arena'],['🟦','Agua'],['🧱','Ladrillo'],['⬜','Cuarzo'],['🟧','Madera']];
const world=[];
for(let z=0;z<H;z++){world[z]=[];for(let x=0;x<W;x++){let edge=x===0||z===0||x===W-1||z===H-1;world[z][x]=edge?2:(z>9?1:0)}}
// small lake and platforms
for(let z=4;z<7;z++)for(let x=5;x<10;x++)world[z][x]=4;
for(let z=7;z<9;z++)for(let x=15;x<20;x++)world[z][x]=6;
const player={x:12,z:11,y:0,vy:0,onGround:true};
const keys={};
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);scale=Math.max(1,Math.min(r.width/900,r.height/520))}addEventListener('resize',resize);resize();
function say(t){const m=document.getElementById('message');m.textContent=t;m.classList.add('show');clearTimeout(say.t);say.t=setTimeout(()=>m.classList.remove('show'),1300)}
function draw(){const w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);let sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#63a9dc');sky.addColorStop(.62,'#a9d8ef');sky.addColorStop(.621,'#80b35b');sky.addColorStop(1,'#527d3e');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
// distant mountains
ctx.fillStyle='rgba(70,100,120,.55)';for(let i=0;i<7;i++){let mx=i*w/6-80;ctx.beginPath();ctx.moveTo(mx,h*.64);ctx.lineTo(mx+130,h*.43-(i%2)*35);ctx.lineTo(mx+270,h*.64);ctx.fill()}
const tile=34*scale, ox=w/2-(player.x-player.z)*tile*.52, oy=h*.38+(player.x+player.z)*tile*.22+player.y*tile;
let list=[];for(let z=0;z<H;z++)for(let x=0;x<W;x++)list.push({x,z,b:world[z][x]});list.sort((a,b)=>(a.x+a.z)-(b.x+b.z));
for(const q of list){const px=ox+(q.x-q.z)*tile*.52,py=oy+(q.x+q.z)*tile*.22;drawBlock(px,py,tile,q.b)}
// player
const px=ox+(player.x-player.z)*tile*.52,py=oy+(player.x+player.z)*tile*.22-player.y*tile;ctx.font=`${Math.max(28,38*scale)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText('🐶',px,py-tile*.05);
document.getElementById('coords').textContent=`${Math.round(player.x)}, ${Math.round(player.y)}, ${Math.round(player.z)}`;requestAnimationFrame(draw)}
function drawBlock(px,py,t,b){const top=t*.42,side=t*.62;ctx.fillStyle=b===4?'#4aa9db':b===0?'#5f9f45':b===1?'#815332':b===2?'#707982':b===3?'#d8c37b':b===5?'#b65b3c':b===6?'#dedede':'#9a653f';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+t*.52,py+top);ctx.lineTo(px,py+top*2);ctx.lineTo(px-t*.52,py+top);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.moveTo(px,py+top*2);ctx.lineTo(px+t*.52,py+top);ctx.lineTo(px+t*.52,py+top+side);ctx.lineTo(px,py+top*2+side);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.moveTo(px,py+top*2);ctx.lineTo(px-t*.52,py+top);ctx.lineTo(px-t*.52,py+top+side);ctx.lineTo(px,py+top*2+side);ctx.closePath();ctx.fill()}
function update(){let dx=0,dz=0;if(keys.w)dz-=.08;if(keys.s)dz+=.08;if(keys.a)dx-=.08;if(keys.d)dx+=.08;let nx=player.x+dx,nz=player.z+dz;if(nx>1&&nx<W-2)player.x=nx;if(nz>1&&nz<H-2)player.z=nz;player.vy-=.018;player.y+=player.vy;if(player.y<=0){player.y=0;player.vy=0;player.onGround=true}if(keys[' ']&&player.onGround){player.vy=.22;player.onGround=false}requestAnimationFrame(update)}
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['1','2','3','4','5','6','7','8'].includes(e.key)){selected=+e.key-1;renderHotbar()}if(e.key==='e')document.getElementById('skinsPanel').classList.toggle('hidden')});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
canvas.addEventListener('pointerdown',e=>{if(e.button===0)say('⛏️ Bloque roto');else if(e.button===2)say('▣ Bloque colocado');});canvas.addEventListener('contextmenu',e=>e.preventDefault());
function bindHold(el,key){el.addEventListener('pointerdown',e=>{e.preventDefault();keys[key]=true});['pointerup','pointercancel','pointerleave'].forEach(x=>el.addEventListener(x,()=>keys[key]=false))}
document.querySelectorAll('[data-key]').forEach(b=>bindHold(b,b.dataset.key));document.getElementById('jump').addEventListener('pointerdown',()=>{keys[' ']=true;setTimeout(()=>keys[' ']=false,120)});document.getElementById('break').addEventListener('pointerdown',()=>say('⛏️ Bloque roto'));document.getElementById('place').addEventListener('pointerdown',()=>say(`▣ ${blocks[selected][1]} colocado`));
document.getElementById('skinsBtn').onclick=()=>document.getElementById('skinsPanel').classList.toggle('hidden');document.getElementById('helpBtn').onclick=()=>document.getElementById('helpPanel').classList.toggle('hidden');document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).classList.add('hidden'));
function renderHotbar(){document.getElementById('hotbar').innerHTML=blocks.map((b,i)=>`<button class="slot ${i===selected?'selected':''}" title="${b[1]}">${b[0]}</button>`).join('');document.querySelectorAll('.slot').forEach((b,i)=>b.onclick=()=>{selected=i;renderHotbar();say('Seleccionado: '+blocks[i][1])})}renderHotbar();
document.getElementById('skinInput').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{document.getElementById('skinPreview').innerHTML=`<img src="${r.result}" alt="Skin" style="width:100%;height:100%;object-fit:cover;border-radius:9px">`;document.getElementById('skinStatus').textContent='✅ Skin importada y guardada en este navegador.';localStorage.setItem('spbed-skin',r.result)};r.readAsDataURL(f)});const saved=localStorage.getItem('spbed-skin');if(saved)document.getElementById('skinPreview').innerHTML=`<img src="${saved}" alt="Skin" style="width:100%;height:100%;object-fit:cover;border-radius:9px">`;
window.addEventListener('gamepadconnected',()=>say('🎮 Mando conectado'));window.addEventListener('gamepaddisconnected',()=>say('🎮 Mando desconectado'));
draw();update();setTimeout(()=>{document.getElementById('loading').remove();document.getElementById('app').hidden=false},250);