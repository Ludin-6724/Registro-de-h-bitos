document.addEventListener('DOMContentLoaded', () => {
    const HABITOS = 6;

    const obtenerSemana = (fecha) => {
        const f = new Date(fecha);
        const dia = f.getDay();
        const diff = f.getDate() - dia + (dia === 0 ? -6 : 1); // lunes
        f.setDate(diff);
        f.setHours(0,0,0,0);
        return f.toISOString().slice(0,10);
    };

    let progresos = JSON.parse(localStorage.getItem('progresos')) || Array(HABITOS).fill(0);
    let objetivos = JSON.parse(localStorage.getItem('objetivos')) || Array(HABITOS).fill(7);
    let ultimos = JSON.parse(localStorage.getItem('ultimos')) || Array(HABITOS).fill(null);
    let semanaInicio = localStorage.getItem('semanaInicio');
    const semanaActual = obtenerSemana(new Date());

    if (semanaInicio !== semanaActual) {
        progresos = Array(HABITOS).fill(0);
        ultimos = Array(HABITOS).fill(null);
        semanaInicio = semanaActual;
    }

    const guardar = () => {
        localStorage.setItem('progresos', JSON.stringify(progresos));
        localStorage.setItem('objetivos', JSON.stringify(objetivos));
        localStorage.setItem('ultimos', JSON.stringify(ultimos));
        localStorage.setItem('semanaInicio', semanaInicio);
    };

    const actualizarBarras = () => {
        let suma = 0;
        for (let i = 0; i < HABITOS; i++) {
            const porcentaje = Math.min(1, progresos[i] / objetivos[i]);
            const barra = document.getElementById(`progreso${i+1}`);
            if (barra) barra.style.width = `${porcentaje * 100}%`;
            const boton = document.getElementById(`boton${i+1}`);
            if (boton) boton.innerText = `${progresos[i]}/${objetivos[i]}`;
            suma += porcentaje;
        }
        const promedio = suma / HABITOS;
        const barraGeneral = document.getElementById('barraEstado');
        barraGeneral.style.width = `${promedio*100}%`;
        barraGeneral.style.backgroundColor = `hsl(${(1-promedio)*240},100%,50%)`;
        const fechaTexto = new Date().toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
        document.getElementById('dia-actual').innerText = fechaTexto;
    };

    window.incrementarBarra = (id) => {
        const hoy = new Date().toLocaleDateString();
        if (ultimos[id-1] === hoy) {
            alert('Ya has registrado este hábito hoy.');
            return;
        }
        progresos[id-1]++;
        ultimos[id-1] = hoy;
        guardar();
        actualizarBarras();
    };

    window.resetearBarra = () => {
        progresos = Array(HABITOS).fill(0);
        ultimos = Array(HABITOS).fill(null);
        guardar();
        actualizarBarras();
    };

    window.resetearDiaInicio = () => {
        semanaInicio = obtenerSemana(new Date());
        progresos = Array(HABITOS).fill(0);
        ultimos = Array(HABITOS).fill(null);
        guardar();
        actualizarBarras();
    };

    window.toggleConfig = () => {
        const menu = document.getElementById('configMenu');
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        for (let i = 0; i < HABITOS; i++) {
            const input = document.getElementById(`objetivo${i+1}`);
            input.value = objetivos[i];
        }
    };

    window.guardarObjetivos = () => {
        for (let i = 0; i < HABITOS; i++) {
            const val = parseInt(document.getElementById(`objetivo${i+1}`).value, 10);
            if (!isNaN(val) && val > 0) objetivos[i] = val;
        }
        guardar();
        document.getElementById('configMenu').style.display = 'none';
        actualizarBarras();
    };

    actualizarBarras();
});
