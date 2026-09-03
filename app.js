
const levelNames={basic:'中学基礎','3':'英検3級',pre2:'英検準2級','2':'英検2級',pre1:'英検準1級'};
let words=[], state={index:0,learned:new Set(JSON.parse(localStorage.getItem('learned')||'[]')),weak:new Set(JSON.parse(localStorage.getItem('weak')||'[]')),attempts:+localStorage.getItem('attempts')||0,correct:+localStorage.getItem('correct')||0,streak:0,answered:false};
const $=id=>document.getElementById(id);
function save(){localStorage.setItem('learned',JSON.stringify([...state.learned]));localStorage.setItem('weak',JSON.stringify([...state.weak]));localStorage.setItem('attempts',state.attempts);localStorage.setItem('correct',state.correct)}
function pool(){let p=words;const l=$('level').value,m=$('mode').value;if(l!=='all')p=p.filter(w=>w.level===l);if(m==='weak')p=p.filter((w,i)=>state.weak.has(words.indexOf(w)));return p}
function current(){const p=pool();if(!p.length)return null;state.index=((state.index%p.length)+p.length)%p.length;return p[state.index]}
function idxOf(w){return words.indexOf(w)}
function stats(){$('total').textContent=words.length;$('learned').textContent=state.learned.size;$('weak').textContent=state.weak.size;$('acc').textContent=state.attempts?Math.round(state.correct/state.attempts*100)+'%':'—';const p=words.length?Math.round(state.learned.size/words.length*100):0;$('bar').style.width=p+'%';$('pct').textContent=p+'%'}
function render(){const w=current(),m=$('mode').value;state.answered=false;$('feedback').textContent='';$('meaning').classList.add('hidden');$('example').classList.add('hidden');$('exampleJa').classList.add('hidden');$('ratings').classList.add('hidden');$('choices').classList.add('hidden');$('actions').classList.remove('hidden');if(!w){$('word').textContent=m==='weak'?'苦手語はありません':'該当語なし';$('pos').textContent='';$('badge').textContent='—';$('actions').classList.add('hidden');stats();return}
$('word').textContent=w.word;$('pos').textContent=w.pos||'';$('badge').textContent=levelNames[w.level]||w.level;$('meaning').textContent=w.meaning;$('example').textContent=w.example||'';$('exampleJa').textContent=w.exampleJa||'';if(m==='quiz'){ $('actions').classList.add('hidden');$('choices').classList.remove('hidden');quiz(w)}stats()}
function quiz(w){const arr=words.filter(x=>x!==w).sort(()=>Math.random()-.5).slice(0,3);const choices=[w,...arr].sort(()=>Math.random()-.5);$('choices').innerHTML='';choices.forEach(c=>{const b=document.createElement('button');b.textContent=c.meaning;b.onclick=()=>answer(c===w,w);$('choices').appendChild(b)})}
function answer(ok,w){if(state.answered)return;state.answered=true;state.attempts++;if(ok){state.correct++;state.streak++;state.learned.add(idxOf(w));state.weak.delete(idxOf(w));$('feedback').textContent='✓ 正解'}else{state.streak=0;state.weak.add(idxOf(w));$('feedback').textContent='正解：'+w.meaning}$('meaning').classList.remove('hidden');$('example').classList.remove('hidden');$('exampleJa').classList.remove('hidden');save();stats();setTimeout(()=>{state.index++;render()},900)}
$('show').onclick=()=>{$('meaning').classList.remove('hidden');$('example').classList.remove('hidden');$('exampleJa').classList.remove('hidden');$('ratings').classList.remove('hidden')}
$('next').onclick=()=>{state.index++;render()}
document.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{const w=current();if(!w)return;const i=idxOf(w),r=b.dataset.rate;if(r==='good'){state.learned.add(i);state.weak.delete(i)}else state.weak.add(i);save();state.index++;render()})
$('level').onchange=()=>{state.index=0;render()};$('mode').onchange=()=>{state.index=0;render()}
$('speak').onclick=()=>{const w=current();if(!w||!('speechSynthesis'in window))return;const u=new SpeechSynthesisUtterance(w.word);u.lang='en-US';u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u)}
fetch('./words.json').then(r=>r.json()).then(d=>{words=d;render()}).catch(()=>{$('word').textContent='単語データを読み込めませんでした'})
if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js');
