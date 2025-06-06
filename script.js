(function(){
    const USER_KEY = 'habitTrackerData';
    let data = { users: [], lastReset: startOfWeek() };
    let currentUser = null; // for adding habits

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

                row.appendChild(logBtn);
                row.appendChild(nameSpan);
                row.appendChild(bar);
                row.appendChild(weekDiv);
                row.appendChild(txt);
                row.appendChild(remBtn);
                habitList.appendChild(row);
            });
            uDiv.appendChild(habitList);
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

    function updateToday(){
        const el = document.getElementById('today');
        if(el){
            const now = new Date();
            const options = { weekday: 'long', year:'numeric', month:'long', day:'numeric' };
            el.textContent = now.toLocaleDateString(undefined, options);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        load();
        resetWeekIfNeeded();
        render();
        updateToday();
        setInterval(updateToday, 60000);

        document.getElementById('addUserBtn').addEventListener('click',()=>{
            document.getElementById('userForm').classList.remove('hidden');
        });

        document.getElementById('createUserBtn').addEventListener('click',()=>{
            const name = document.getElementById('userName').value.trim();
            if(name){
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
            }
        });
    });
})();
