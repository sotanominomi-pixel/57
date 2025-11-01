document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('display');
  const slider = document.getElementById('sliderHours');
  const labelHours = document.getElementById('labelHours');
  const tabClock = document.getElementById('tabClock');
  const tabStopwatch = document.getElementById('tabStopwatch');
  const tabAlarm = document.getElementById('tabAlarm');
  const tabSettings = document.getElementById('tabSettings');
  const stopwatchArea = document.getElementById('stopwatchArea');
  const swStart = document.getElementById('swStart');
  const swLap = document.getElementById('swLap');
  const swReset = document.getElementById('swReset');
  const lapList = document.getElementById('lapList');
  const alarmTimeInput = document.getElementById('alarmTime');
  const alarmSetBtn = document.getElementById('alarmSetBtn');
  const alarmsContainer = document.getElementById('alarmsContainer');
  const secondsToggle = document.getElementById('secondsToggle');
  const secondsLabel = document.getElementById('secondsLabel');
  const langSelectSettings = document.getElementById('langSelectSettings');

  let customHours = 24;
  let showSeconds = true;
  let lang = 'ja';
  let elapsedMs = 0;
  let running = false;
  let laps = [];
  let alarms = [];

  slider.addEventListener('input', e => { customHours=Number(e.target.value); labelHours.textContent=customHours+' 時間'; });
  secondsToggle.addEventListener('change', e => { showSeconds=e.target.checked; secondsLabel.textContent=showSeconds?'表示':'非表示'; });
  langSelectSettings.addEventListener('change', e => { lang=e.target.value; });

  // Mode
  function setMode(mode){
    stopwatchArea.style.display=(mode==='stopwatch')?'flex':'none';
    document.getElementById('alarmArea').style.display=(mode==='alarm')?'block':'none';
    document.getElementById('settingsArea').style.display=(mode==='settings')?'block':'none';
  }
  tabClock.onclick=()=>setMode('clock');
  tabStopwatch.onclick=()=>setMode('stopwatch');
  tabAlarm.onclick=()=>setMode('alarm');
  tabSettings.onclick=()=>setMode('settings');
  setMode('clock');

  // Clock
  function updateClock(){
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    display.textContent = showSeconds ?
      `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}` :
      `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;
    requestAnimationFrame(updateClock);
  }
  requestAnimationFrame(updateClock);

  // Stopwatch
  function formatStopwatch(ms){
    const total=Math.floor(ms/1000);
    const h=Math.floor(total/3600);
    const m=Math.floor(total/60)%60;
    const s=total%60;
    return h>0?`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  swStart.addEventListener('click',()=>{
    running=!running;
    if(running){ swStart.textContent='Stop'; swLap.disabled=false; swReset.disabled=true; lastFrame=performance.now(); requestAnimationFrame(updateStopwatch); }
    else{ swStart.textContent='Start'; swLap.disabled=true; swReset.disabled=false; }
  });
  swLap.addEventListener('click',()=>{ laps.unshift(formatStopwatch(elapsedMs)); renderLaps(); });
  swReset.addEventListener('click',()=>{ elapsedMs=0;laps=[];renderLaps();swReset.disabled=true; });
  function renderLaps(){ lapList.innerHTML=''; laps.forEach((t,i)=>{ const node=document.createElement('div'); node.textContent=`Lap ${laps.length-i}: ${t}`; lapList.appendChild(node); }); }
  let lastFrame=performance.now();
  function updateStopwatch(now){
    if(!running) return;
    const dt=now-lastFrame; lastFrame=now; elapsedMs+=dt*24/customHours;
    display.textContent=formatStopwatch(elapsedMs);
    requestAnimationFrame(updateStopwatch);
  }

  // Alarm
  function renderAlarms(){
    alarmsContainer.innerHTML='';
    if(alarms.length===0){ alarmsContainer.innerHTML=`<div style="color:#999;padding:8px">${lang==='en'?'No alarms':'アラームなし'}</div>`; return; }
    alarms.forEach((a,idx)=>{
      const card=document.createElement('div'); card.className='alarm-card';
      const timeDiv=document.createElement('div'); timeDiv.className='alarm-time';
      timeDiv.textContent=`${String(a.hour).padStart(2,'0')}:${String(a.min).padStart(2,'0')}`;
      const toggle=document.createElement('div'); toggle.className='toggle'+(a.enabled?' on':'');
      const thumb=document.createElement('div'); thumb.className='thumb'; toggle.appendChild(thumb);
      toggle.onclick=()=>{ a.enabled=!a.enabled; renderAlarms(); };
      const del=document.createElement('button'); del.textContent=lang==='en'?'Delete':'削除';
      del.onclick=()=>{ alarms.splice(idx,1); renderAlarms(); };
      card.appendChild(timeDiv); card.appendChild(toggle); card.appendChild(del);
      alarmsContainer.appendChild(card);
    });
  }
  alarmSetBtn.addEventListener('click',()=>{
    const val=alarmTimeInput.value;
    if(!val){ alert(lang==='en'?'Pick a time':'時刻を選択してください'); return; }
    const [hh,mm]=val.split(':').map(Number);
    alarms.push({hour:hh,min:mm,enabled:true});
    renderAlarms(); alarmTimeInput.value='';
  });
  setInterval(()=>{
    const now=new Date();
    alarms.forEach(a=>{ if(a.enabled && a.hour===now.getHours() && a.min===now.getMinutes() && now.getSeconds()===0){ alert(lang==='en'?'Alarm':'アラーム'); } });
  },1000);

  renderAlarms();
});
