(function(){
    const USER_KEY = 'habitTrackerData';
    const TASK_KEY = 'weeklyTasks';
    const PHRASE_KEY = 'phraseData';
    let data = { users: [], lastReset: startOfWeek() };
    let tasks = { start: startOfWeek(), items: [] };
    let phrases = { items: [] };
    let currentUser = null; // for adding habits
    let currentNoteDate = null;

    function startOfWeek(){
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - ((day + 6) % 7); // monday
        d.setDate(diff);
        d.setHours(0,0,0,0);
        return d.toISOString();
    }

    function startOfDay(){
        const d = new Date();
        d.setHours(0,0,0,0);
        return d.toISOString();
    }

    function weekDates(){
        const start = new Date(startOfWeek());
        const days = [];
        for(let i=0;i<7;i++){
            const d = new Date(start);
            d.setDate(start.getDate()+i);
            days.push(d.toISOString());
        }
        return days;
    }

    function load(){
        try {
            const raw = localStorage.getItem(USER_KEY);
            const parsed = JSON.parse(raw);
            if(parsed && Array.isArray(parsed.users)){
                data = parsed;
                data.users.forEach(u=>{
                    if(!Array.isArray(u.habits)) u.habits = [];
                    u.habits.forEach(h=>{
                        if(typeof h.progress !== 'number') h.progress = 0;
                        if(typeof h.goal !== 'number') h.goal = 1;
                        if(!('lastLogged' in h)) h.lastLogged = null;
                        if(!Array.isArray(h.loggedDays)) h.loggedDays = [];
                    });
                });
            }
        } catch(e){ /* ignore */ }
    }

    function loadTasks(){
        try {
            const raw = localStorage.getItem(TASK_KEY);
            const parsed = JSON.parse(raw);
            if(parsed && Array.isArray(parsed.items)){
                tasks = parsed;
                tasks.items.forEach(t => {
                    if(!t.date) t.date = startOfDay();
                });
            }
        } catch(e){ /* ignore */ }
        checkTaskWeek();
    }

    function saveTasks(){
        localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    }

    function loadPhrases(){
        try {
            const raw = localStorage.getItem(PHRASE_KEY);
            const parsed = JSON.parse(raw);
            if(parsed && Array.isArray(parsed.items)){
                phrases = parsed;
            }
        } catch(e){ /* ignore */ }
    }

    function savePhrases(){
        localStorage.setItem(PHRASE_KEY, JSON.stringify(phrases));
    }

    function renderPhrases(){
        const list = document.getElementById('phraseList');
        if(!list) return;
        list.innerHTML = '';
        phrases.items.forEach((p,i)=>{
            const li = document.createElement('li');
            const span = document.createElement('span');
            const d = new Date(p.date);
            span.textContent = `${d.getDate()}/${d.getMonth()+1}: ${p.text}`;
            const del = document.createElement('button');
            del.textContent = 'X';
            del.className = 'deletePhraseBtn';
            del.dataset.idx = i;
            li.appendChild(span);
            li.appendChild(del);
            list.appendChild(li);
        });
    }

    function checkTaskWeek(){
        const start = startOfWeek();
        if(tasks.start !== start){
            tasks = { start, items: [] };
            saveTasks();
            renderWeeklyTasks();
        }
    }

    function addWeeklyTask(text, done, date){
        if(!text.trim()) return;
        tasks.items.push({ text, done: !!done, date });
    }

    function renderWeeklyTasks(){
        const list = document.getElementById('weeklyTasks');
        if(!list) return;
        list.innerHTML = '';
        tasks.items.forEach((t,i)=>{
            const li = document.createElement('li');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = t.done;
            cb.dataset.idx = i;
            const span = document.createElement('span');
            const d = new Date(t.date);
            span.textContent = `${d.getDate()}/${d.getMonth()+1}: ${t.text}`;
            const del = document.createElement('button');
            del.textContent = 'X';
            del.className = 'deleteTaskBtn';
            del.dataset.idx = i;
            li.appendChild(cb);
            li.appendChild(span);
            li.appendChild(del);
            list.appendChild(li);
        });
    }

    function save(){
        localStorage.setItem(USER_KEY, JSON.stringify(data));
    }

    function resetWeekIfNeeded(){
        const start = startOfWeek();
        if(data.lastReset !== start){
            data.users.forEach(u=>{
                u.habits.forEach(h=> {
                    h.progress = 0;
                    h.lastLogged = null;
                    h.loggedDays = [];
                });
            });
            data.lastReset = start;
            save();
        }
    }

    function average(user){
        let total = 0;
        user.habits.forEach(h=>{
            total += Math.min(1, h.progress / h.goal);
        });
        return user.habits.length ? total / user.habits.length : 0;
    }

    function renderCalendar(){
        const cal = document.getElementById('miniCalendar');
        if(!cal) return;
        cal.innerHTML = '';
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const first = new Date(year, month, 1);
        const last = new Date(year, month + 1, 0).getDate();
        const offset = (first.getDay() + 6) % 7; // monday first
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';
        const labels = ['L','M','M','J','V','S','D'];
        labels.forEach(l=>{
            const h = document.createElement('span');
            h.className = 'cal-label';
            h.textContent = l;
            grid.appendChild(h);
        });
        for(let i=0;i<offset;i++){
            grid.appendChild(document.createElement('span'));
        }
        for(let d=1; d<=last; d++){
            const date = new Date(year, month, d);
            const cell = document.createElement('span');
            cell.className = 'cal-day';
            const ds = date.toISOString();
            cell.dataset.date = ds;
            cell.textContent = d;
            if(d===now.getDate()) cell.classList.add('today');
            grid.appendChild(cell);
        }
        cal.appendChild(grid);
    }

    function render(){
        const container = document.getElementById('users');
        container.innerHTML = '';
        const board = document.getElementById('scoreboard');
        if(board) board.innerHTML = '';
        data.users.forEach((user,uIdx)=>{
            const uDiv = document.createElement('div');
            uDiv.className = 'user';

            const header = document.createElement('header');
            const title = document.createElement('h2');
            title.textContent = user.name;
            const addBtn = document.createElement('button');
            addBtn.textContent = '+ Hábito';
            addBtn.className = 'addHabitBtn';
            addBtn.dataset.user = uIdx;

            const delBtn = document.createElement('button');
            delBtn.textContent = 'Eliminar usuario';
            delBtn.className = 'removeUserBtn';
            delBtn.dataset.user = uIdx;

            header.appendChild(title);
            header.appendChild(addBtn);
            uDiv.appendChild(header);

            const bar = document.createElement('div');
            bar.className = 'progress-bar';
            const fill = document.createElement('div');
            fill.className = 'progress-fill';
            const avg = average(user);
            fill.style.width = (avg*100)+'%';
            fill.style.background = 'linear-gradient(to right, #3498db, #e74c3c)';
            bar.appendChild(fill);
            uDiv.appendChild(bar);

            const habitList = document.createElement('div');
            const week = weekDates();
            const today = startOfDay();
            user.habits.forEach((h,hIdx)=>{
                const row = document.createElement('div');
                row.className = 'habit';

                const logBtn = document.createElement('button');
                logBtn.textContent = '✓';
                logBtn.className = 'logHabitBtn';
                logBtn.dataset.user = uIdx;
                logBtn.dataset.habit = hIdx;
                if(h.loggedDays.includes(today)) logBtn.disabled = true;

                const nameSpan = document.createElement('span');
                nameSpan.textContent = h.name;

                const barWrap = document.createElement('div');
                barWrap.className = 'bar-wrap';

                const bar = document.createElement('div');
                bar.className = 'progress-bar';
                const fill = document.createElement('div');
                fill.className = 'progress-fill';
                const ratio = Math.min(1, h.progress / h.goal);
                fill.style.width = (ratio*100)+'%';
                fill.style.background = '#2ecc71';
                bar.appendChild(fill);

                const weekDiv = document.createElement('div');
                weekDiv.className = 'week-check';
                const labels = ['L','M','M','J','V','S','D'];
                week.forEach((d,i)=>{
                    const ds = document.createElement('span');
                    ds.className = 'day';
                    if(h.loggedDays.includes(d)) ds.classList.add('done');
                    if(d===today) ds.classList.add('today');
                    ds.textContent = h.loggedDays.includes(d) ? '✓' : labels[i];
                    weekDiv.appendChild(ds);
                });

                const txt = document.createElement('span');
                txt.textContent = `${h.progress}/${h.goal}`;

                const remBtn = document.createElement('button');
                remBtn.textContent = 'X';
                remBtn.className = 'removeHabitBtn';
                remBtn.dataset.user = uIdx;
                remBtn.dataset.habit = hIdx;

                barWrap.appendChild(bar);
                barWrap.appendChild(weekDiv);

                row.appendChild(logBtn);
                row.appendChild(nameSpan);
                row.appendChild(barWrap);
                row.appendChild(txt);
                row.appendChild(remBtn);
                habitList.appendChild(row);
            });
            uDiv.appendChild(habitList);
            uDiv.appendChild(delBtn);
            container.appendChild(uDiv);

            if(board){
                const row = document.createElement('div');
                row.className = 'score-row';
                const label = document.createElement('span');
                label.textContent = user.name;
                const pb = document.createElement('div');
                pb.className = 'progress-bar';
                const pf = document.createElement('div');
                pf.className = 'progress-fill';
                const avg = average(user);
                pf.style.width = (avg*100)+'%';
                pf.style.background = 'linear-gradient(to right, #3498db, #e74c3c)';
                pb.appendChild(pf);
                row.appendChild(label);
                row.appendChild(pb);
                board.appendChild(row);
            }
        });
    }

    function addUser(name){
        data.users.push({ name: name, habits: [] });
        save();
        render();
        updateToday();
    }

    function removeUser(index){
        data.users.splice(index,1);
        save();
        render();
        updateToday();
    }

    function addHabit(userIdx,name,goal){
        const user = data.users[userIdx];
        user.habits.push({ name:name, goal:goal, progress:0, lastLogged:null, loggedDays:[] });
        save();
        render();
    }

    function logHabit(userIdx,habitIdx){
        const h = data.users[userIdx].habits[habitIdx];
        const today = startOfDay();
        if(h.loggedDays.includes(today)) return;
        h.progress = Math.min(h.goal, h.progress + 1);
        h.lastLogged = today;
        h.loggedDays.push(today);
        save();
        render();
    }

    function removeHabit(userIdx,habitIdx){
        data.users[userIdx].habits.splice(habitIdx,1);
        save();
        render();
    }

    function addCheckItem(text='',done=false){
        const li = document.createElement('li');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'check-done';
        cb.checked = done;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'check-text';
        input.value = text;
        const del = document.createElement('button');
        del.textContent = 'X';
        del.className = 'deleteCheckBtn';
        li.appendChild(cb);
        li.appendChild(input);
        li.appendChild(del);
        document.getElementById('checkList').appendChild(li);
    }

    function loadJournal(date){
        const raw = localStorage.getItem('note-'+date);
        if(!raw) return { text:'', checks:[], phrase:'' };
        try {
            const obj = JSON.parse(raw);
            if(!('phrase' in obj)) obj.phrase = '';
            return obj;
        } catch(e){
            return { text:raw, checks:[], phrase:'' };
        }
    }

    function saveJournal(){
        if(!currentNoteDate) return;
        const obj = { text:'', checks:[], phrase:'' };
        obj.text = document.getElementById('journalText').value;
        obj.phrase = document.getElementById('journalPhrase').value.trim();
        document.querySelectorAll('#checkList li').forEach(li=>{
            obj.checks.push({
                text: li.querySelector('.check-text').value,
                done: li.querySelector('.check-done').checked
            });
            addWeeklyTask(
                li.querySelector('.check-text').value,
                li.querySelector('.check-done').checked,
                currentNoteDate
            );
        });
        localStorage.setItem('note-'+currentNoteDate, JSON.stringify(obj));
        const idx = phrases.items.findIndex(p=>p.date===currentNoteDate);
        if(obj.phrase){
            if(idx>=0) phrases.items[idx].text = obj.phrase; else phrases.items.push({text:obj.phrase,date:currentNoteDate});
        }else if(idx>=0){
            phrases.items.splice(idx,1);
        }
        savePhrases();
        saveTasks();
        renderWeeklyTasks();
        renderPhrases();
    }

    function openJournal(date){
        currentNoteDate = date;
        const modal = document.getElementById('journalModal');
        const data = loadJournal(date);
        document.getElementById('journalText').value = data.text;
        document.getElementById('journalPhrase').value = data.phrase || '';
        const list = document.getElementById('checkList');
        list.innerHTML = '';
        data.checks.forEach(c=>addCheckItem(c.text,c.done));
        modal.classList.remove('hidden');
    }

    function closeJournal(){
        const modal = document.getElementById('journalModal');
        saveJournal();
        modal.classList.add('hidden');
    }

    function downloadJournal(){
        if(!currentNoteDate) return;
        saveJournal();
        const data = loadJournal(currentNoteDate);
        let text = data.text + '\n';
        data.checks.forEach(c=>{
            text += (c.done?'[x] ':'[ ] ') + c.text + '\n';
        });
        const blob = new Blob([text], {type:'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nota-${currentNoteDate}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function updateToday(){
        const el = document.getElementById('today');
        if(el){
            const now = new Date();
            const options = { weekday: 'long', year:'numeric', month:'long', day:'numeric' };
            el.textContent = now.toLocaleDateString(undefined, options);
        }
        checkTaskWeek();
    }

    document.addEventListener('DOMContentLoaded', () => {
        load();
        loadTasks();
        loadPhrases();
        resetWeekIfNeeded();
        render();
        renderCalendar();
        renderWeeklyTasks();
        renderPhrases();
        updateToday();
        setInterval(()=>{ updateToday(); renderCalendar(); }, 60000);

        document.getElementById('today').addEventListener('click',()=>{
            openJournal(startOfDay());
        });

        document.getElementById('addCheckBtn').addEventListener('click',()=>{
            addCheckItem();
        });

        document.getElementById('checkList').addEventListener('click',e=>{
            if(e.target.classList.contains('deleteCheckBtn')){
                e.target.parentElement.remove();
            }
        });

        document.getElementById('closeJournalBtn').addEventListener('click',closeJournal);
        document.getElementById('downloadNoteBtn').addEventListener('click',downloadJournal);
        document.getElementById('deletePhraseBtn').addEventListener('click',()=>{
            document.getElementById('journalPhrase').value='';
        });

        document.getElementById('addUserBtn').addEventListener('click',()=>{
            document.getElementById('userForm').classList.remove('hidden');
        });

        document.getElementById('createUserBtn').addEventListener('click',()=>{
            const name = document.getElementById('userName').value.trim();
            if(name){
                const pwd = prompt('Ingrese la contraseña para crear usuario:');
                if(pwd !== '1234'){
                    alert('Contraseña incorrecta');
                    return;
                }
                addUser(name);
                document.getElementById('userName').value='';
                document.getElementById('userForm').classList.add('hidden');
            }
        });

        document.getElementById('saveHabitBtn').addEventListener('click',()=>{
            const name = document.getElementById('habitName').value.trim();
            const goal = parseInt(document.getElementById('habitGoal').value,10)||1;
            if(currentUser!==null && name){
                addHabit(currentUser,name,goal);
                document.getElementById('habitName').value='';
                document.getElementById('habitGoal').value='7';
                document.getElementById('habitForm').classList.add('hidden');
                currentUser=null;
            }
        });

        document.getElementById('users').addEventListener('click',e=>{
            if(e.target.classList.contains('addHabitBtn')){
                currentUser = parseInt(e.target.dataset.user,10);
                document.getElementById('habitForm').classList.remove('hidden');
            }else if(e.target.classList.contains('logHabitBtn')){
                const u = parseInt(e.target.dataset.user,10);
                const h = parseInt(e.target.dataset.habit,10);
                logHabit(u,h);
            }else if(e.target.classList.contains('removeHabitBtn')){
                const u = parseInt(e.target.dataset.user,10);
                const h = parseInt(e.target.dataset.habit,10);
                removeHabit(u,h);
            }else if(e.target.classList.contains('removeUserBtn')){
                const pwd = prompt('Ingrese la contraseña para eliminar usuario:');
                if(pwd !== '1234'){
                    alert('Contraseña incorrecta');
                    return;
                }
                const u = parseInt(e.target.dataset.user,10);
                removeUser(u);
            }
        });

        document.getElementById('miniCalendar').addEventListener('click',e=>{
            if(e.target.classList.contains('cal-day')){
                openJournal(e.target.dataset.date);
            }
        });

        document.getElementById('weeklyTasks').addEventListener('change',e=>{
            if(e.target.dataset.idx){
                const i = parseInt(e.target.dataset.idx,10);
                tasks.items[i].done = e.target.checked;
                saveTasks();
            }
        });
        document.getElementById('weeklyTasks').addEventListener('click',e=>{
            if(e.target.classList.contains('deleteTaskBtn')){
                const i = parseInt(e.target.dataset.idx,10);
                tasks.items.splice(i,1);
                saveTasks();
                renderWeeklyTasks();
            }
        });
        document.getElementById('phraseList').addEventListener('click',e=>{
            if(e.target.classList.contains('deletePhraseBtn')){
                const i = parseInt(e.target.dataset.idx,10);
                const date = phrases.items[i].date;
                phrases.items.splice(i,1);
                savePhrases();
                renderPhrases();
                // also clear phrase from stored note
                const raw = localStorage.getItem('note-'+date);
                if(raw){
                    try{
                        const obj = JSON.parse(raw);
                        obj.phrase='';
                        localStorage.setItem('note-'+date, JSON.stringify(obj));
                    }catch(e){
                        /* ignore */
                    }
                }
            }
        });
    });
})();
