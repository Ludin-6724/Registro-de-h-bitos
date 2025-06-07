document.addEventListener('DOMContentLoaded', function() {
    var button = document.getElementById('myButton');
    button.addEventListener('click', function() {
        alert('¡Haz hecho clic en el botón!');
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const TOTAL_PULSOS = 168; // 28 pulsos por cada uno de los 6 botones
    const MAX_PULSOS_POR_BOTON = 28;
    const DIAS_TOTAL = 30;
    let pulsosTotales = 0;
    let pulsosPorBoton = JSON.parse(localStorage.getItem('pulsosPorBoton')) || [0, 0, 0, 0, 0, 0];
    let fechaInicio = new Date(localStorage.getItem('fechaInicio'));
    let diaActual = calcularDiasDesdeInicio(fechaInicio);
    let ultimosClics = JSON.parse(localStorage.getItem('ultimosClics')) || [null, null, null, null, null, null]; // Añadido para registrar la fecha del último clic por botón

    if (!fechaInicio || diaActual >= DIAS_TOTAL) {
        reiniciarProgreso();
    }

    function calcularDiasDesdeInicio(fecha) {
        const ahora = new Date();
        const diferencia = ahora - new Date(fecha);
        return Math.floor(diferencia / (1000 * 60 * 60 * 24));
    }

    function incrementarBarra(botonId) {
        const hoy = new Date().toDateString(); // Obtener la fecha de hoy
        if (ultimosClics[botonId - 1] === hoy) { // Comprobar si el botón ya fue presionado hoy
            alert("Ya has presionado este botón hoy.");
            return;
        }

        if (pulsosPorBoton[botonId - 1] < MAX_PULSOS_POR_BOTON) {
            pulsosPorBoton[botonId - 1]++;
            pulsosTotales = pulsosPorBoton.reduce((a, b) => a + b, 0);
            ultimosClics[botonId - 1] = hoy; // Actualizar la fecha del último clic para este botón
            actualizarBarra();
            guardarEstado();
            mostrarMensajeMuyBien(); // Mostrar mensaje "Muy bien hecho"
            if (pulsosTotales >= TOTAL_PULSOS) {
                mostrarMensajeFelicitaciones();
            }
        }
    }
    
    function actualizarBarra() {
        let progreso = (pulsosTotales / TOTAL_PULSOS) * 100;
        let color;
        
        if (progreso <= 33) {
            color = `linear-gradient(to right, red ${progreso}%, transparent ${progreso}%)`;
        } else if (progreso <= 66) {
            color = `linear-gradient(to right, red 33%, yellow ${(progreso - 33) * 3}%, transparent ${progreso}%)`;
        } else {
            color = `linear-gradient(to right, red 33%, yellow 66%, green ${(progreso - 66) * 1.5}%, transparent ${progreso}%)`;
        }

        document.getElementById('barraEstado').style.width = progreso + '%';
        document.getElementById('barraEstado').style.background = color;
        document.getElementById('dia-actual').innerText = `Día ${diaActual + 1} de 30`;
    }

    function guardarEstado() {
        localStorage.setItem('pulsosPorBoton', JSON.stringify(pulsosPorBoton));
        localStorage.setItem('ultimosClics', JSON.stringify(ultimosClics)); // Guardar ultimosClics en localStorage
        localStorage.setItem('fechaInicio', fechaInicio.toISOString()); // Asegurar que la fecha de inicio esté guardada en el formato correcto
    }

    function resetearBarra() {
        pulsosPorBoton = [0, 0, 0, 0, 0, 0];
        pulsosTotales = 0;
        ultimosClics = [null, null, null, null, null, null]; // Restablecer ultimosClics
        localStorage.setItem('pulsosPorBoton', JSON.stringify(pulsosPorBoton));
        localStorage.setItem('ultimosClics', JSON.stringify(ultimosClics)); // Guardar ultimosClics en localStorage
        actualizarBarra();
        document.getElementById('mensaje-felicitaciones').style.display = 'none';
    }

    function resetearDiaInicio() {
        fechaInicio = new Date();
        localStorage.setItem('fechaInicio', fechaInicio.toISOString());
        resetearBarra();
        diaActual = 0;
        document.getElementById('dia-actual').innerText = `Día ${diaActual + 1} de 30`;
    }

    function reiniciarProgreso() {
        fechaInicio = new Date();
        localStorage.setItem('fechaInicio', fechaInicio.toISOString());
        pulsosPorBoton = [0, 0, 0, 0, 0, 0];
        ultimosClics = [null, null, null, null, null, null];
        localStorage.setItem('pulsosPorBoton', JSON.stringify(pulsosPorBoton));
        localStorage.setItem('ultimosClics', JSON.stringify(ultimosClics));
        diaActual = 0;
    }

    function mostrarMensajeFelicitaciones() {
        document.getElementById('mensaje-felicitaciones').style.display = 'block';
    }

    function mostrarMensajeMuyBien() {
        const mensaje = document.getElementById('mensaje-muy-bien');
        mensaje.style.display = 'block';
        setTimeout(() => mensaje.style.display = 'none', 2000); // Ocultar el mensaje después de 2 segundos
    }

    window.incrementarBarra = incrementarBarra; // Exponer la función al ámbito global para que se pueda llamar desde el HTML
    window.resetearBarra = resetearBarra; // Exponer la función al ámbito global para que se pueda llamar desde el HTML
    window.resetearDiaInicio = resetearDiaInicio; // Exponer la función al ámbito global para que se pueda llamar desde el HTML

    // Inicializa la barra con el estado guardado
    pulsosTotales = pulsosPorBoton.reduce((a, b) => a + b, 0);
    actualizarBarra();

    /* === Diario === */
    let fechaSeleccionada = '';

    function generarCalendario() {
        const contenedor = document.getElementById('calendario');
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = hoy.getMonth();
        const primerDia = new Date(anio, mes, 1).getDay();
        const numDias = new Date(anio, mes + 1, 0).getDate();
        contenedor.innerHTML = '';
        const tabla = document.createElement('table');
        const header = document.createElement('tr');
        const diasSemana = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];
        diasSemana.forEach(d => {
            const th = document.createElement('th');
            th.textContent = d;
            header.appendChild(th);
        });
        tabla.appendChild(header);

        let fila = document.createElement('tr');
        for (let i=0; i<primerDia; i++) {
            fila.appendChild(document.createElement('td'));
        }
        for (let dia=1; dia<=numDias; dia++) {
            if ((primerDia + dia - 1) % 7 === 0) {
                tabla.appendChild(fila);
                fila = document.createElement('tr');
            }
            const td = document.createElement('td');
            td.textContent = dia;
            td.className = 'dia-calendario';
            td.addEventListener('click', () => abrirModal(anio, mes, dia));
            fila.appendChild(td);
        }
        tabla.appendChild(fila);
        contenedor.appendChild(tabla);
    }

    function abrirModal(a, m, d) {
        fechaSeleccionada = `${a}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        document.getElementById('modalFecha').textContent = fechaSeleccionada;
        document.getElementById('diarioTexto').value = localStorage.getItem('diario-'+fechaSeleccionada) || '';
        document.getElementById('diarioModal').style.display = 'flex';
    }

    function cerrarModal() {
        document.getElementById('diarioModal').style.display = 'none';
    }

    function guardarDiario() {
        const texto = document.getElementById('diarioTexto').value;
        localStorage.setItem('diario-'+fechaSeleccionada, texto);
        const blob = new Blob([texto], {type:'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diario-${fechaSeleccionada}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        cerrarModal();
    }

    document.getElementById('guardarDiario').addEventListener('click', guardarDiario);
    document.getElementById('cancelarDiario').addEventListener('click', cerrarModal);

    generarCalendario();
});
//   if (progreso <= 33) {
 //   color = `linear-gradient(to right, red ${progreso}%, transparent ${progreso}%)`;
//} else if (progreso <= 66) {
 //   color = `linear-gradient(to right, red 33%, yellow ${progreso}%, transparent ${progreso}%)`;
//} else {
 //   color = `linear-gradient(to right, red 33%, yellow 66%, green ${progreso}%, transparent ${progreso}%)`;
//}//
