document.addEventListener('DOMContentLoaded', () => {
    let data = JSON.parse(localStorage.getItem('habitData')) || {
        users: [{
            name: 'Usuario 1',
            startDay: 1,
            semanaInicio: null,
            habitos: [
                { nombre: 'Hábito 1', objetivo: 7, progreso: 0, ultimo: null }
            ]
        }]
    };
    let currentUser = 0;
    let editHabitos = [];

    const obtenerSemana = (fecha, startDay) => {
        const f = new Date(fecha);
        const dia = f.getDay();
        const diff = f.getDate() - ((dia - startDay + 7) % 7);
        f.setDate(diff);
        f.setHours(0,0,0,0);
        return f.toISOString().slice(0,10);
    };

    const guardarDatos = () => {
        localStorage.setItem('habitData', JSON.stringify(data));
    };

    const resetIfNewWeek = () => {
        const hoy = new Date();
        data.users.forEach(user => {
            const semanaAct = obtenerSemana(hoy, user.startDay);
            if (user.semanaInicio !== semanaAct) {
                user.habitos.forEach(h => { h.progreso = 0; h.ultimo = null; });
                user.semanaInicio = semanaAct;
            }
        });
        guardarDatos();
    };

    const mostrarFelicidades = () => {
        const div = document.createElement('div');
        div.className = 'mensaje-felicidades';
        div.textContent = '¡Felicitaciones!';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 2000);
    };

    const createHabitosHTML = (uIdx) => {
        const user = data.users[uIdx];
        return user.habitos.map((h, i) => `
            <div class="caja">
                <span class="nombre-habito">${h.nombre}</span>
                <button id="boton-${uIdx}-${i}" onclick="incrementarBarra(${uIdx},${i})">0</button>
                <div class="barra-habito"><div class="progreso-habito" id="progreso-${uIdx}-${i}"></div></div>
            </div>`).join('');
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
        user.habitos.forEach((h, i) => {
            const porc = Math.min(1, h.progreso / h.objetivo);
            const barra = document.getElementById(`progreso-${idx}-${i}`);
            if (barra) barra.style.width = `${porc * 100}%`;
            const boton = document.getElementById(`boton-${idx}-${i}`);
            if (boton) boton.innerText = `${h.progreso}/${h.objetivo}`;
            suma += porc;
        });
        const promedio = user.habitos.length ? suma / user.habitos.length : 0;
        const barraGeneral = document.getElementById(`barraEstado-${idx}`);
        if (barraGeneral) {
            barraGeneral.style.width = `${promedio * 100}%`;
            barraGeneral.style.backgroundColor = `hsl(${(1 - promedio) * 240},100%,50%)`;
        }
        document.getElementById('dia-actual').innerText = new Date().toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const actualizarTodas = () => data.users.forEach((_, i) => actualizarUsuario(i));

    window.incrementarBarra = (uIdx, hIdx) => {
        const hoy = new Date().toLocaleDateString();
        const user = data.users[uIdx];
        const hab = user.habitos[hIdx];
        if (hab.ultimo === hoy) {
            alert('Ya registrado hoy');
            return;
        }
        hab.progreso++;
        hab.ultimo = hoy;
        guardarDatos();
        actualizarUsuario(uIdx);
        mostrarFelicidades();
    };

    const renderConfig = () => {
        const cont = document.getElementById('habitosConfig');
        cont.innerHTML = '';
        editHabitos.forEach((h, i) => {
            const div = document.createElement('div');
            div.innerHTML = `Nombre: <input id="habNombre-${i}" value="${h.nombre}">
                Objetivo: <input type="number" id="habObjetivo-${i}" value="${h.objetivo}" min="1">
                <button onclick="removeHabitoConfig(${i})">X</button>`;
            cont.appendChild(div);
        });
    };

    window.openConfig = (uIdx) => {
        currentUser = uIdx;
        const user = data.users[uIdx];
        editHabitos = user.habitos.map(h => ({...h}));
        const menu = document.getElementById('configMenu');
        menu.style.display = 'block';
        document.getElementById('configTitulo').innerText = `Configurar usuario`;
        document.getElementById('userNameInput').value = user.name;
        document.getElementById('startDaySelect').value = user.startDay;
        renderConfig();
    };

    window.addHabitoConfig = () => {
        editHabitos.push({ nombre: 'Nuevo Hábito', objetivo: 7, progreso: 0, ultimo: null });
        renderConfig();
    };

    window.removeHabitoConfig = (idx) => {
        editHabitos.splice(idx, 1);
        renderConfig();
    };

    window.guardarObjetivos = () => {
        const user = data.users[currentUser];
        user.name = document.getElementById('userNameInput').value || user.name;
        user.startDay = parseInt(document.getElementById('startDaySelect').value, 10);
        editHabitos.forEach((h, i) => {
            h.nombre = document.getElementById(`habNombre-${i}`).value || `Hábito ${i+1}`;
            const val = parseInt(document.getElementById(`habObjetivo-${i}`).value, 10);
            if (!isNaN(val) && val > 0) h.objetivo = val;
        });
        user.habitos = editHabitos;
        guardarDatos();
        document.getElementById('configMenu').style.display = 'none';
        resetIfNewWeek();
        renderUsuarios();
    };

    window.showAddUser = () => {
        document.getElementById('addUserMenu').style.display = 'block';
    };

    window.agregarUsuario = () => {
        const nombre = document.getElementById('nuevoUsuario').value.trim();
        if (nombre) {
            data.users.push({
                name: nombre,
                startDay: 1,
                semanaInicio: null,
                habitos: [ { nombre: 'Hábito 1', objetivo: 7, progreso: 0, ultimo: null } ]
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
