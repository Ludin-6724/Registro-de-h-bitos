document.addEventListener('DOMContentLoaded', () => {
    const HABITOS = 6;
    let data = JSON.parse(localStorage.getItem('habitData')) || {
        users: [{
            name: 'Usuario 1',
            objetivos: Array(HABITOS).fill(7),
            progresos: Array(HABITOS).fill(0),
            ultimos: Array(HABITOS).fill(null),
            startDay: 1,
            semanaInicio: null
        }]
    };
    let currentUser = 0;

    const obtenerSemana = (fecha, startDay) => {
        const f = new Date(fecha);
        const dia = f.getDay();
        const diff = f.getDate() - ((dia - startDay + 7) % 7);
        f.setDate(diff);
        f.setHours(0, 0, 0, 0);
        return f.toISOString().slice(0, 10);
    };

    const guardarDatos = () => {
        localStorage.setItem('habitData', JSON.stringify(data));
    };

    const resetIfNewWeek = () => {
        const hoy = new Date();
        data.users.forEach(user => {
            const semanaAct = obtenerSemana(hoy, user.startDay);
            if (user.semanaInicio !== semanaAct) {
                user.progresos = Array(HABITOS).fill(0);
                user.ultimos = Array(HABITOS).fill(null);
                user.semanaInicio = semanaAct;
            }
        });
        guardarDatos();
    };

    const createHabitosHTML = (uIndex) => {
        let html = '';
        for (let i = 0; i < HABITOS; i++) {
            html += `<div class="caja">
                <button id="boton-${uIndex}-${i}" onclick="incrementarBarra(${uIndex},${i})">0</button>
                <div class="barra-habito"><div class="progreso-habito" id="progreso-${uIndex}-${i}"></div></div>
            </div>`;
        }
        return html;
    };

    const renderUsuarios = () => {
        const cont = document.getElementById('usuarios');
        cont.innerHTML = '';
        data.users.forEach((user, idx) => {
            const div = document.createElement('div');
            div.className = 'usuario';
            div.innerHTML = `<h2>${user.name}</h2>
                <div class="barra-container"><div class="barra-estado" id="barraEstado-${idx}"></div></div>
                <div class="botones-container">${createHabitosHTML(idx)}</div>
                <div class="acciones-container">
                    <button class="boton-accion" onclick="openConfig(${idx})">Configurar</button>
                    <button class="boton-accion" onclick="shareUser(${idx})">Compartir</button>
                </div>`;
            cont.appendChild(div);
        });
        actualizarTodas();
    };

    const actualizarUsuario = (idx) => {
        const user = data.users[idx];
        let suma = 0;
        for (let i = 0; i < HABITOS; i++) {
            const porc = Math.min(1, user.progresos[i] / user.objetivos[i]);
            const barra = document.getElementById(`progreso-${idx}-${i}`);
            if (barra) barra.style.width = `${porc * 100}%`;
            const boton = document.getElementById(`boton-${idx}-${i}`);
            if (boton) boton.innerText = `${user.progresos[i]}/${user.objetivos[i]}`;
            suma += porc;
        }
        const promedio = suma / HABITOS;
        const barraGeneral = document.getElementById(`barraEstado-${idx}`);
        if (barraGeneral) {
            barraGeneral.style.width = `${promedio * 100}%`;
            barraGeneral.style.backgroundColor = `hsl(${(1 - promedio) * 240},100%,50%)`;
        }
        document.getElementById('dia-actual').innerText = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const actualizarTodas = () => data.users.forEach((_, i) => actualizarUsuario(i));

    window.incrementarBarra = (uIdx, hIdx) => {
        const hoy = new Date().toLocaleDateString();
        const user = data.users[uIdx];
        if (user.ultimos[hIdx] === hoy) {
            alert('Ya registrado hoy');
            return;
        }
        user.progresos[hIdx]++;
        user.ultimos[hIdx] = hoy;
        guardarDatos();
        actualizarUsuario(uIdx);
    };

    window.openConfig = (uIdx) => {
        currentUser = uIdx;
        const user = data.users[uIdx];
        const menu = document.getElementById('configMenu');
        menu.style.display = 'block';
        document.getElementById('configTitulo').innerText = `Configurar ${user.name}`;
        for (let i = 0; i < HABITOS; i++) {
            document.getElementById(`objetivo${i + 1}`).value = user.objetivos[i];
        }
        document.getElementById('startDaySelect').value = user.startDay;
    };

    window.guardarObjetivos = () => {
        const user = data.users[currentUser];
        for (let i = 0; i < HABITOS; i++) {
            const val = parseInt(document.getElementById(`objetivo${i + 1}`).value, 10);
            if (!isNaN(val) && val > 0) user.objetivos[i] = val;
        }
        user.startDay = parseInt(document.getElementById('startDaySelect').value, 10);
        guardarDatos();
        document.getElementById('configMenu').style.display = 'none';
        resetIfNewWeek();
        actualizarUsuario(currentUser);
    };

    window.showAddUser = () => {
        document.getElementById('addUserMenu').style.display = 'block';
    };

    window.agregarUsuario = () => {
        const nombre = document.getElementById('nuevoUsuario').value.trim();
        if (nombre) {
            data.users.push({
                name: nombre,
                objetivos: Array(HABITOS).fill(7),
                progresos: Array(HABITOS).fill(0),
                ultimos: Array(HABITOS).fill(null),
                startDay: 1,
                semanaInicio: null
            });
            document.getElementById('nuevoUsuario').value = '';
            document.getElementById('addUserMenu').style.display = 'none';
            guardarDatos();
            resetIfNewWeek();
            renderUsuarios();
        }
    };

    window.shareUser = (uIdx) => {
        alert('Invitación enviada para competir con ' + data.users[uIdx].name);
    };

    resetIfNewWeek();
    renderUsuarios();
});
