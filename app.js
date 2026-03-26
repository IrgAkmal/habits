/* ──────────────────────────── TRANSLATIONS ──────────────────────── */
const I18N = {
ru:{
today_habits:‘Сегодня’,nav_home:‘Главная’,nav_stats:‘Статистика’,
nav_badges:‘Награды’,nav_settings:‘Настройки’,add_habit:‘Новая привычка’,
edit_habit:‘Редактировать’,habit_name:‘Название’,icon:‘Иконка’,color:‘Цвет’,
frequency:‘Периодичность’,daily:‘Ежедневно’,weekdays:‘Будние дни’,
custom_days:‘Свои дни’,ntimes:‘N раз в день’,days:‘Дни недели’,
times_per_day:‘Раз в день’,goal:‘Цель’,unit:‘Единица’,start_date:‘Начало’,
end_date:‘Конец’,reminder:‘Напоминание’,save:‘Сохранить’,cancel:‘Отмена’,
add_note:‘Заметка’,no_habits:‘Нет привычек’,add_first:‘Добавь первую привычку, нажав +’,
week_chart:‘Активность за неделю’,month_chart:‘Месячный обзор’,
achievements:‘Достижения’,appearance:‘Внешний вид’,dark_mode:‘Тёмная тема’,
language:‘Язык’,notifications:‘Уведомления’,push_notifs:‘Push-уведомления’,
push_sub:‘Напоминания о привычках’,data:‘Данные’,export:‘Экспорт данных’,
reset:‘Сбросить все данные’,level:‘Уровень’,xp:‘опыт’,streak:‘дней подряд’,
best_streak:‘Лучшая серия’,total_done:‘Выполнено’,total_habits:‘Привычек’,
success_rate:‘Успешность’,completed:‘выполнено’,times:‘раз’,
greeting_morning:‘Доброе утро’,greeting_day:‘Добрый день’,greeting_evening:‘Добрый вечер’,
},
en:{
today_habits:‘Today’,nav_home:‘Home’,nav_stats:‘Stats’,
nav_badges:‘Badges’,nav_settings:‘Settings’,add_habit:‘New Habit’,
edit_habit:‘Edit Habit’,habit_name:‘Name’,icon:‘Icon’,color:‘Color’,
frequency:‘Frequency’,daily:‘Daily’,weekdays:‘Weekdays’,
custom_days:‘Custom Days’,ntimes:‘N times/day’,days:‘Days of week’,
times_per_day:‘Times per day’,goal:‘Goal’,unit:‘Unit’,start_date:‘Start’,
end_date:‘End’,reminder:‘Reminder’,save:‘Save’,cancel:‘Cancel’,
add_note:‘Note’,no_habits:‘No habits yet’,add_first:‘Add your first habit by tapping +’,
week_chart:‘Weekly Activity’,month_chart:‘Monthly Overview’,
achievements:‘Achievements’,appearance:‘Appearance’,dark_mode:‘Dark Mode’,
language:‘Language’,notifications:‘Notifications’,push_notifs:‘Push Notifications’,
push_sub:‘Habit reminders’,data:‘Data’,export:‘Export Data’,
reset:‘Reset All Data’,level:‘Level’,xp:‘XP’,streak:‘day streak’,
best_streak:‘Best Streak’,total_done:‘Completed’,total_habits:‘Habits’,
success_rate:‘Success Rate’,completed:‘done’,times:‘times’,
greeting_morning:‘Good morning’,greeting_day:‘Good afternoon’,greeting_evening:‘Good evening’,
}
};

/* ──────────────────────────── CONSTANTS ──────────────────────────── */
const COLORS = [’#6c63ff’,’#4ade80’,’#f59e0b’,’#f43f5e’,’#38bdf8’,’#a78bfa’,’#fb923c’,’#34d399’,’#e879f9’,’#22d3ee’];
const ICONS  = [‘🧘’,‘🏃’,‘💧’,‘📚’,‘🎸’,‘🍎’,‘💤’,‘🏋️’,‘✍️’,‘🌿’,‘🧹’,‘💊’,‘🧠’,‘🎯’,‘🌅’,‘🚶’,‘🥗’,‘🎨’];
const ACHIEVEMENTS = [
{id:‘first’,icon:‘🌱’,name:{ru:‘Первый шаг’,en:‘First Step’},desc:{ru:‘Первая привычка’,en:‘First habit’},req:h=>h.totalDone>=1},
{id:‘week’,icon:‘🔥’,name:{ru:‘Неделя огня’,en:‘Week on Fire’},desc:{ru:‘7 дней подряд’,en:‘7 day streak’},req:h=>h.currentStreak>=7},
{id:‘month’,icon:‘🏅’,name:{ru:‘Месяц силы’,en:‘Month of Power’},desc:{ru:‘30 дней подряд’,en:‘30 day streak’},req:h=>h.currentStreak>=30},
{id:‘10habits’,icon:‘📋’,name:{ru:‘Коллекционер’,en:‘Collector’},desc:{ru:‘10 привычек’,en:‘10 habits’},req:(h,all)=>all.length>=10},
{id:‘100done’,icon:‘💯’,name:{ru:‘Сотня’,en:‘Century’},desc:{ru:‘100 выполнений’,en:‘100 completions’},req:h=>h.totalDone>=100},
{id:‘streak3’,icon:‘✨’,name:{ru:‘Три в ряд’,en:‘Three in Row’},desc:{ru:‘3 дня подряд’,en:‘3 day streak’},req:h=>h.currentStreak>=3},
{id:‘perfect’,icon:‘⭐’,name:{ru:‘Идеальный день’,en:‘Perfect Day’},desc:{ru:‘Все за день’,en:‘All done today’},req:(h,all,pct)=>pct>=100},
{id:‘early’,icon:‘🌅’,name:{ru:‘Ранняя пташка’,en:‘Early Bird’},desc:{ru:‘Привычка до 7:00’,en:‘Habit before 7am’},req:()=>new Date().getHours()<7},
{id:‘xp500’,icon:‘🚀’,name:{ru:‘Энтузиаст’,en:‘Enthusiast’},desc:{ru:‘500 XP’,en:‘500 XP’},req:()=>getState().xp>=500},
];

/* ──────────────────────────── STATE ──────────────────────────────── */
function getState() {
return JSON.parse(localStorage.getItem(‘hf_state’) || ‘null’) || {
habits:[], completions:{}, notes:{}, xp:0, level:1, unlockedBadges:[],
theme:‘dark’, lang:‘ru’, notif:false
};
}
function setState(s) { localStorage.setItem(‘hf_state’,JSON.stringify(s)); }

let editingId = null;
let selectedDate = dateKey(new Date());
let noteHabitId = null;

function dateKey(d) { return d.toISOString().slice(0,10); }
function today() { return dateKey(new Date()); }

/* ──────────────────────────── INIT ──────────────────────────────── */
function enterApp() {
document.getElementById(‘onboard’).style.display=‘none’;
document.getElementById(‘app’).style.display=‘flex’;
initApp();
}

function initApp() {
const s = getState();
if(s.theme===‘light’) document.documentElement.setAttribute(‘data-theme’,‘light’);
setLangSilent(s.lang);
buildDateStrip();
renderHome();
renderStats();
renderBadges();
buildIconPicker();
buildColorPicker();
setupFreqListener();
setupWeekdayBtns();
setDateToday();
updateGreeting();
}

function setDateToday() {
const d = new Date();
document.getElementById(‘h-start’).valueAsDate = d;
document.getElementById(‘date-today’).textContent = d.toLocaleDateString(
getState().lang===‘ru’?‘ru-RU’:‘en-US’,
{weekday:‘long’,day:‘numeric’,month:‘long’}
);
}

function updateGreeting() {
const h = new Date().getHours();
const s = getState();
const t = s.lang;
let g = h<12 ? I18N[t].greeting_morning : h<17 ? I18N[t].greeting_day : I18N[t].greeting_evening;
document.getElementById(‘greeting’).textContent = g+’ 👋’;
}

/* ──────────────────────────── DATE STRIP ──────────────────────────── */
function buildDateStrip() {
const strip = document.getElementById(‘date-strip’);
strip.innerHTML = ‘’;
const s = getState();
const dows = s.lang===‘ru’
? [‘Вс’,‘Пн’,‘Вт’,‘Ср’,‘Чт’,‘Пт’,‘Сб’]
: [‘Su’,‘Mo’,‘Tu’,‘We’,‘Th’,‘Fr’,‘Sa’];
for(let i=-3;i<=3;i++) {
const d = new Date(); d.setDate(d.getDate()+i);
const k = dateKey(d);
const chip = document.createElement(‘div’);
chip.className = ‘date-chip’+(k===today()?’ today’:’’)+(k===selectedDate?’ selected’:’’);
chip.innerHTML = `<div class="dow">${dows[d.getDay()]}</div><div class="day-num">${d.getDate()}</div>`;
chip.onclick = () => { selectedDate=k; buildDateStrip(); renderHome(); };
strip.appendChild(chip);
}
}

/* ──────────────────────────── RENDER HOME ──────────────────────────── */
function renderHome() {
const s = getState();
renderXPBanner(s);
const list = document.getElementById(‘habits-list’);
const selDay = new Date(selectedDate+‘T12:00:00’);
const dayOfWeek = selDay.getDay();
const dueHabits = s.habits.filter(h => isHabitDueOn(h, selectedDate, dayOfWeek));
if(!dueHabits.length) {
list.innerHTML = `<div class="empty"> <div class="empty-icon">🪴</div> <div class="empty-title">${I18N[s.lang].no_habits}</div> <div class="empty-desc">${I18N[s.lang].add_first}</div> </div>`;
return;
}
list.innerHTML = dueHabits.map(h => renderHabitCard(h, s)).join(’’);
}

function isHabitDueOn(h, dk, dow) {
if(h.startDate && dk < h.startDate) return false;
if(h.endDate && dk > h.endDate) return false;
if(h.freq===‘daily’) return true;
if(h.freq===‘weekdays’) return dow>=1 && dow<=5;
if(h.freq===‘custom’) return (h.customDays||[]).includes(dow);
if(h.freq===‘nday’) return true;
return true;
}

function renderHabitCard(h, s) {
const comps = s.completions[h.id]||{};
const todayComp = comps[selectedDate]||0;
const goal = h.freq===‘nday’ ? (h.nday||2) : (h.goal||1);
const done = todayComp >= goal;
const pct = Math.min(100, Math.round(todayComp/goal*100));
const streak = calcStreak(h, s);
const note = (s.notes[h.id]||{})[selectedDate];
const lang = s.lang;
return `<div class="habit-card" style="--card-color:${h.color||'#6c63ff'}"> <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${h.color||'#6c63ff'};border-radius:4px 0 0 4px"></div> <div class="habit-card-row"> <div class="habit-icon-wrap" style="background:${h.color||'#6c63ff'}22">${h.icon||'🎯'}</div> <div class="habit-info"> <div class="habit-name">${h.name}</div> <div class="habit-meta"> ${streak>0 ? `<span style="color:${h.color||'#f59e0b'}">🔥 ${streak} ${lang===‘ru’?‘дн.’:‘d’}</span> · ` : ‘’}
${todayComp}/${goal} ${h.unit||’’}
${note ? ’ · 📝’ : ‘’}
</div>
</div>
<div class="check-btn${done?' done':''}" onclick="toggleHabit('${h.id}',event)">
${!done ? ‘○’ : ‘’}
</div>
</div>
<div class="progress-bar-wrap">
<div class="progress-bar">
<div class="progress-fill" style="width:${pct}%;background:${h.color||'#6c63ff'}"></div>
</div>
<div class="progress-label">
<span>${pct}%</span>
<span onclick="openNote('${h.id}',event)" style="cursor:pointer;color:var(--text2)">📝 ${lang===‘ru’?‘Заметка’:‘Note’}</span>
</div>
</div>

  </div>`;
}

function renderXPBanner(s) {
const xpForLevel = lvl => lvl * 100;
const levelXP = xpForLevel(s.level);
const prevXP = xpForLevel(s.level-1)||0;
const pct = Math.min(100, Math.round((s.xp - prevXP) / (levelXP - prevXP) * 100));
const lang = s.lang;
document.getElementById(‘xp-banner’).innerHTML = ` <div class="xp-banner"> <div class="xp-top"> <div><span class="xp-level">${lang==='ru'?'Уровень':'Level'} ${s.level}</span></div> <div style="font-size:13px;color:var(--text2)">${s.xp} XP</div> </div> <div class="xp-bar"><div class="xp-fill" style="width:${pct}%"></div></div> <div class="xp-sub">${s.xp} / ${levelXP} XP • ${lang==='ru'?'до уровня':'to level'} ${s.level+1}</div> </div>`;
}

/* ──────────────────────────── HABIT TOGGLE ──────────────────────────── */
function toggleHabit(id, e) {
e.stopPropagation();
const s = getState();
const h = s.habits.find(x=>x.id===id);
if(!h) return;
if(!s.completions[id]) s.completions[id]={};
const goal = h.freq===‘nday’ ? (h.nday||2) : (h.goal||1);
const cur = s.completions[id][selectedDate]||0;
if(cur < goal) {
s.completions[id][selectedDate] = cur+1;
const wasDone = cur+1 >= goal;
if(wasDone) {
s.xp += 10 + (s.level * 2);
checkLevelUp(s);
showToast(`+${10+s.level*2} XP 🎉`);
} else {
showToast(`${cur+1}/${goal}`);
}
} else {
s.completions[id][selectedDate] = 0;
}
checkAchievements(s);
setState(s);
renderHome();
renderStats();
}

function checkLevelUp(s) {
while(s.xp >= s.level * 100) {
s.level++;
showToast(`🚀 Уровень ${s.level}!`);
}
}

/* ──────────────────────────── STREAK CALC ──────────────────────────── */
function calcStreak(h, s) {
const comps = s.completions[h.id]||{};
let streak=0, d=new Date();
for(let i=0;i<365;i++) {
d.setDate(d.getDate()-(i===0?0:1));
const k = dateKey(d);
const goal = h.freq===‘nday’ ? (h.nday||2) : (h.goal||1);
if(isHabitDueOn(h,k,d.getDay())) {
if((comps[k]||0)>=goal) streak++;
else if(i>0) break;
}
}
return streak;
}

function calcBestStreak(h, s) {
const comps = s.completions[h.id]||{};
let best=0, cur=0;
const keys = Object.keys(comps).sort();
keys.forEach(k => {
const d = new Date(k+‘T12:00:00’);
const goal = h.freq===‘nday’ ? (h.nday||2) : (h.goal||1);
if(isHabitDueOn(h,k,d.getDay()) && (comps[k]||0)>=goal) { cur++; best=Math.max(best,cur); }
else cur=0;
});
return best;
}

/* ──────────────────────────── NOTES ──────────────────────────────── */
function openNote(id, e) {
e.stopPropagation();
noteHabitId = id;
const s = getState();
const note = (s.notes[id]||{})[selectedDate]||’’;
document.getElementById(‘note-text’).value = note;
document.getElementById(‘note-date-label’).textContent = selectedDate;
openModal(‘note-modal’);
}

function saveNote() {
const s = getState();
if(!s.notes[noteHabitId]) s.notes[noteHabitId]={};
s.notes[noteHabitId][selectedDate] = document.getElementById(‘note-text’).value;
setState(s);
closeModal(‘note-modal’);
renderHome();
showToast(‘📝 Заметка сохранена’);
}

/* ──────────────────────────── ADD/EDIT ──────────────────────────── */
let selectedIcon = ICONS[0];
let selectedColor = COLORS[0];
let selectedWeekdays = [];

function buildIconPicker() {
const p = document.getElementById(‘icon-picker’);
p.innerHTML = ICONS.map(ic =>
`<div class="icon-opt${ic===selectedIcon?' selected':''}" onclick="selectIcon('${ic}',this)">${ic}</div>`
).join(’’);
}

function selectIcon(ic, el) {
selectedIcon = ic;
document.querySelectorAll(’.icon-opt’).forEach(e=>e.classList.remove(‘selected’));
el.classList.add(‘selected’);
}

function buildColorPicker() {
const p = document.getElementById(‘color-picker’);
p.innerHTML = COLORS.map(c =>
`<div class="color-dot${c===selectedColor?' selected':''}" style="background:${c}" onclick="selectColor('${c}',this)"></div>`
).join(’’);
}

function selectColor(c, el) {
selectedColor = c;
document.querySelectorAll(’.color-dot’).forEach(e=>e.classList.remove(‘selected’));
el.classList.add(‘selected’);
}

function setupFreqListener() {
document.getElementById(‘h-freq’).addEventListener(‘change’, function(){
document.getElementById(‘weekday-group’).style.display = this.value===‘custom’ ? ‘block’ : ‘none’;
document.getElementById(‘nday-group’).style.display = this.value===‘nday’ ? ‘block’ : ‘none’;
});
}

function setupWeekdayBtns() {
document.querySelectorAll(’.wd-btn’).forEach(btn => {
btn.addEventListener(‘click’, function(){
const d = parseInt(this.dataset.d);
if(selectedWeekdays.includes(d)) selectedWeekdays = selectedWeekdays.filter(x=>x!==d);
else selectedWeekdays.push(d);
this.classList.toggle(‘selected’, selectedWeekdays.includes(d));
});
});
}

function openAddModal() {
editingId = null;
selectedIcon = ICONS[0]; selectedColor = COLORS[0]; selectedWeekdays = [];
document.getElementById(‘h-name’).value = ‘’;
document.getElementById(‘h-freq’).value = ‘daily’;
document.getElementById(‘h-goal’).value = 1;
document.getElementById(‘h-unit’).value = ‘’;
document.getElementById(‘h-remind’).value = ‘’;
document.getElementById(‘h-end’).value = ‘’;
document.getElementById(‘h-nday’).value = 2;
document.getElementById(‘h-start’).valueAsDate = new Date();
document.getElementById(‘weekday-group’).style.display = ‘none’;
document.getElementById(‘nday-group’).style.display = ‘none’;
document.getElementById(‘delete-btn’).style.display = ‘none’;
const lang = getState().lang;
document.getElementById(‘add-modal-title’).textContent = I18N[lang].add_habit;
buildIconPicker(); buildColorPicker();
openModal(‘add-modal’);
}

function openEditModal(id) {
const s = getState(); const h = s.habits.find(x=>x.id===id); if(!h) return;
editingId = id;
selectedIcon = h.icon||ICONS[0];
selectedColor = h.color||COLORS[0];
selectedWeekdays = h.customDays||[];
document.getElementById(‘h-name’).value = h.name||’’;
document.getElementById(‘h-freq’).value = h.freq||‘daily’;
document.getElementById(‘h-goal’).value = h.goal||1;
document.getElementById(‘h-unit’).value = h.unit||’’;
document.getElementById(‘h-remind’).value = h.remind||’’;
document.getElementById(‘h-end’).value = h.endDate||’’;
document.getElementById(‘h-nday’).value = h.nday||2;
document.getElementById(‘h-start’).value = h.startDate||’’;
document.getElementById(‘weekday-group’).style.display = h.freq===‘custom’ ? ‘block’ : ‘none’;
document.getElementById(‘nday-group’).style.display = h.freq===‘nday’ ? ‘block’ : ‘none’;
document.getElementById(‘delete-btn’).style.display = ‘block’;
document.querySelectorAll(’.wd-btn’).forEach(btn => {
btn.classList.toggle(‘selected’, selectedWeekdays.includes(parseInt(btn.dataset.d)));
});
const lang = s.lang;
document.getElementById(‘add-modal-title’).textContent = I18N[lang].edit_habit;
buildIconPicker(); buildColorPicker();
openModal(‘add-modal’);
}

function saveHabit() {
const name = document.getElementById(‘h-name’).value.trim();
if(!name){ showToast(‘⚠️ Введи название’); return; }
const s = getState();
const h = {
id: editingId || (Date.now().toString(36)),
name,
icon: selectedIcon,
color: selectedColor,
freq: document.getElementById(‘h-freq’).value,
customDays: […selectedWeekdays],
goal: parseInt(document.getElementById(‘h-goal’).value)||1,
unit: document.getElementById(‘h-unit’).value,
nday: parseInt(document.getElementById(‘h-nday’).value)||2,
startDate: document.getElementById(‘h-start’).value,
endDate: document.getElementById(‘h-end’).value||null,
remind: document.getElementById(‘h-remind’).value,
};
if(editingId) {
const idx = s.habits.findIndex(x=>x.id===editingId);
if(idx>-1) s.habits[idx]=h;
} else {
s.habits.push(h);
s.xp+=5; checkLevelUp(s);
}
checkAchievements(s);
setState(s);
closeModal(‘add-modal’);
renderHome(); renderStats(); renderBadges();
showToast(editingId ? ‘✅ Сохранено’ : ‘✨ Привычка добавлена’);
}

function deleteHabit() {
if(!editingId) return;
const s = getState();
s.habits = s.habits.filter(h=>h.id!==editingId);
delete s.completions[editingId];
delete s.notes[editingId];
setState(s);
closeModal(‘add-modal’);
renderHome(); renderStats(); renderBadges();
showToast(‘🗑️ Удалено’);
}

/* ──────────────────────────── STATS ──────────────────────────────── */
function renderStats() {
const s = getState(); const lang = s.lang;
const t = I18N[lang];
let totalDone=0, bestStreak=0;
s.habits.forEach(h => {
const comps = s.completions[h.id]||{};
Object.values(comps).forEach(v => { if(v>0) totalDone+=v; });
bestStreak = Math.max(bestStreak, calcBestStreak(h,s));
});
const todayHabits = s.habits.filter(h=>isHabitDueOn(h,today(),new Date().getDay()));
const todayDone = todayHabits.filter(h=>{
const g=h.freq===‘nday’?(h.nday||2):(h.goal||1);
return (s.completions[h.id]||{})[today()]>=g;
}).length;
const rate = todayHabits.length ? Math.round(todayDone/todayHabits.length*100) : 0;

document.getElementById(‘stats-grid’).innerHTML=` <div class="stat-card"><div class="stat-icon">🔥</div><div class="stat-val">${bestStreak}</div><div class="stat-label">${t.best_streak}</div></div> <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-val">${totalDone}</div><div class="stat-label">${t.total_done}</div></div> <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-val">${s.habits.length}</div><div class="stat-label">${t.total_habits}</div></div> <div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-val">${rate}%</div><div class="stat-label">${t.success_rate}</div></div>`;

// Week bar chart
const dows = lang===‘ru’
? [‘Вс’,‘Пн’,‘Вт’,‘Ср’,‘Чт’,‘Пт’,‘Сб’]
: [‘Su’,‘Mo’,‘Tu’,‘We’,‘Th’,‘Fr’,‘Sa’];
const weekData = [];
for(let i=6;i>=0;i–) {
const d=new Date(); d.setDate(d.getDate()-i);
const k=dateKey(d);
const due=s.habits.filter(h=>isHabitDueOn(h,k,d.getDay()));
const done=due.filter(h=>{const g=h.freq===‘nday’?(h.nday||2):(h.goal||1);return (s.completions[h.id]||{})[k]>=g;}).length;
weekData.push({label:dows[d.getDay()],done,total:due.length});
}
const maxVal = Math.max(…weekData.map(x=>x.total),1);
document.getElementById(‘week-chart’).innerHTML = weekData.map(w=>` <div class="bar-col"> <div class="bar-seg" style="height:${Math.round(w.done/maxVal*70)}px;background:var(--accent)"></div> <div class="bar-day-label">${w.label}</div> </div>`).join(’’);

// Donut chart (30 days)
const totalDue = s.habits.reduce((acc,h)=>{
for(let i=0;i<30;i++){const d=new Date();d.setDate(d.getDate()-i);if(isHabitDueOn(h,dateKey(d),d.getDay()))acc++;}
return acc;
},0);
let monthDone=0;
s.habits.forEach(h=>{
const comps=s.completions[h.id]||{};
for(let i=0;i<30;i++){
const d=new Date();d.setDate(d.getDate()-i);
const k=dateKey(d);const g=h.freq===‘nday’?(h.nday||2):(h.goal||1);
if(isHabitDueOn(h,k,d.getDay())&&(comps[k]||0)>=g) monthDone++;
}
});
const monthMissed = Math.max(0,totalDue-monthDone);
const pctDone = totalDue ? Math.round(monthDone/totalDue*100) : 0;
const r=50, circ=2*Math.PI*r;
const dashDone = circ*(pctDone/100);
document.getElementById(‘donut-chart’).innerHTML=` <div class="donut-wrap"> <svg class="donut-svg" width="120" height="120" viewBox="0 0 120 120"> <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--border)" stroke-width="14"/> <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--accent)" stroke-width="14" stroke-dasharray="${dashDone} ${circ}" stroke-dashoffset="${circ*0.25}" stroke-linecap="round"/> <text x="60" y="64" text-anchor="middle" fill="var(--text)" font-size="20" font-weight="800" font-family="Syne,sans-serif">${pctDone}%</text> </svg> <div class="donut-legend"> <div class="legend-row"><div class="legend-dot" style="background:var(--accent)"></div><div class="legend-label">${lang==='ru'?'Выполнено':'Done'}</div><div class="legend-val">${monthDone}</div></div> <div class="legend-row"><div class="legend-dot" style="background:var(--border)"></div><div class="legend-label">${lang==='ru'?'Пропущено':'Missed'}</div><div class="legend-val">${monthMissed}</div></div> <div style="font-size:12px;color:var(--text2);margin-top:8px">${lang==='ru'?'За 30 дней':'Last 30 days'}</div> </div> </div>`;
}

/* ──────────────────────────── BADGES ──────────────────────────────── */
function checkAchievements(s) {
const todayHabits = s.habits.filter(h=>isHabitDueOn(h,today(),new Date().getDay()));
const todayDone = todayHabits.filter(h=>{
const g=h.freq===‘nday’?(h.nday||2):(h.goal||1);
return (s.completions[h.id]||{})[today()]>=g;
}).length;
const pct = todayHabits.length ? todayDone/todayHabits.length*100 : 0;
ACHIEVEMENTS.forEach(a => {
if(s.unlockedBadges.includes(a.id)) return;
const anyHabit = s.habits.some(h=>a.req(buildHabitStats(h,s),s.habits,pct));
const globalCheck = a.req({totalDone:0,currentStreak:0},s.habits,pct);
if(anyHabit||globalCheck) {
s.unlockedBadges.push(a.id);
showToast(`🏆 ${a.name[s.lang]}`);
s.xp+=25; checkLevelUp(s);
}
});
}

function buildHabitStats(h, s) {
const comps = s.completions[h.id]||{};
const totalDone = Object.values(comps).reduce((a,b)=>a+b,0);
const currentStreak = calcStreak(h,s);
return { totalDone, currentStreak };
}

function renderBadges() {
const s = getState(); const lang = s.lang;
document.getElementById(‘badge-grid’).innerHTML = ACHIEVEMENTS.map(a => {
const unlocked = s.unlockedBadges.includes(a.id);
return `<div class="badge-card${unlocked?'':' locked'}"> <div class="badge-icon">${a.icon}</div> <div class="badge-name">${a.name[lang]}</div> <div class="badge-desc">${a.desc[lang]}</div> </div>`;
}).join(’’);
}

/* ──────────────────────────── SETTINGS ──────────────────────────────── */
function toggleTheme() {
const s = getState();
s.theme = s.theme===‘dark’ ? ‘light’ : ‘dark’;
setState(s);
if(s.theme===‘light’) document.documentElement.setAttribute(‘data-theme’,‘light’);
else document.documentElement.removeAttribute(‘data-theme’);
document.getElementById(‘theme-toggle’).classList.toggle(‘on’, s.theme===‘dark’);
document.getElementById(‘theme-btn’).textContent = s.theme===‘dark’ ? ‘🌙’ : ‘☀️’;
}

function toggleNotif() {
const s = getState(); s.notif=!s.notif; setState(s);
document.getElementById(‘notif-toggle’).classList.toggle(‘on’, s.notif);
if(s.notif && ‘Notification’ in window) Notification.requestPermission();
showToast(s.notif ? ‘🔔 Уведомления включены’ : ‘🔕 Уведомления выключены’);
}

function openLangModal() { openModal(‘lang-modal’); }

function setLang(l) {
const s = getState(); s.lang=l; setState(s);
setLangSilent(l);
renderHome(); renderStats(); renderBadges();
updateGreeting();
closeModal(‘lang-modal’);
document.getElementById(‘lang-ru’).classList.toggle(‘active’,l===‘ru’);
document.getElementById(‘lang-en’).classList.toggle(‘active’,l===‘en’);
}

function setLangSilent(l) {
document.querySelectorAll(’[data-i18n]’).forEach(el => {
const k = el.dataset.i18n;
if(I18N[l][k]) el.textContent = I18N[l][k];
});
document.getElementById(‘lang-ru’).classList.toggle(‘active’,l===‘ru’);
document.getElementById(‘lang-en’).classList.toggle(‘active’,l===‘en’);
}

function exportData() {
const s = getState();
const blob = new Blob([JSON.stringify(s,null,2)],{type:‘application/json’});
const a = document.createElement(‘a’);
a.href = URL.createObjectURL(blob);
a.download = ‘habitflow-backup.json’;
a.click();
showToast(‘📤 Данные экспортированы’);
}

function confirmReset() {
if(confirm(‘Сбросить все данные? Это необратимо.’)) {
localStorage.removeItem(‘hf_state’);
location.reload();
}
}

/* ──────────────────────────── NAVIGATION ──────────────────────────── */
function showTab(tab) {
document.querySelectorAll(’.screen’).forEach(s=>s.classList.remove(‘active’));
document.getElementById(‘screen-’+tab).classList.add(‘active’);
document.querySelectorAll(’.bottom-nav .nav-item’).forEach((n,i)=>{
const tabs=[‘home’,‘stats’,‘badges’,‘settings’];
n.classList.toggle(‘active’,tabs[i]===tab);
});
if(tab===‘stats’) renderStats();
if(tab===‘badges’) renderBadges();
}

/* ──────────────────────────── MODAL ──────────────────────────────── */
function openModal(id) { document.getElementById(id).classList.add(‘open’); }
function closeModal(id) { document.getElementById(id).classList.remove(‘open’); }

document.querySelectorAll(’.modal-overlay’).forEach(overlay => {
overlay.addEventListener(‘click’, function(e){
if(e.target===this) this.classList.remove(‘open’);
});
});

/* ──────────────────────────── TOAST ──────────────────────────────── */
let toastTimer;
function showToast(msg) {
const t = document.getElementById(‘toast’);
t.textContent = msg; t.classList.add(‘show’);
clearTimeout(toastTimer);
toastTimer = setTimeout(()=>t.classList.remove(‘show’), 2200);
}

/* ──────────────────────────── HABIT CARD CLICK → EDIT ──────────────── */
document.addEventListener(‘click’, function(e){
const card = e.target.closest(’.habit-card’);
if(card && !e.target.closest(’.check-btn’) && !e.target.closest(’[onclick*=“openNote”]’)) {
const id = card.querySelector(’.check-btn’).getAttribute(‘onclick’).match(/’([^’]+)’/)?.[1];
if(id) openEditModal(id);
}
});

/* ──────────────────────────── REMINDERS ──────────────────────────── */
function scheduleReminders() {
if(!(‘Notification’ in window)) return;
const s = getState();
if(!s.notif) return;
s.habits.forEach(h => {
if(!h.remind) return;
const [hh,mm] = h.remind.split(’:’).map(Number);
const now=new Date(), target=new Date();
target.setHours(hh,mm,0,0);
if(target<=now) target.setDate(target.getDate()+1);
const ms = target-now;
setTimeout(()=>{
if(Notification.permission===‘granted’)
new Notification(’HabitFlow: ’+h.name, {body:‘Время для привычки! 🎯’});
}, ms);
});
}

/* ──────────────────────────── BOOT ──────────────────────────────── */
const savedState = getState();
if(savedState.habits.length>0 || localStorage.getItem(‘hf_visited’)) {
localStorage.setItem(‘hf_visited’,‘1’);
document.getElementById(‘onboard’).style.display=‘none’;
document.getElementById(‘app’).style.display=‘flex’;
initApp();
scheduleReminders();
}
