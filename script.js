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
    let diaActual = Math.floor((new Date() - fechaInicio) / (1000 * 60 * 60 * 24));
    let ultimosClics = JSON.parse(localStorage.getItem('ultimosClics')) || [null, null, null, null, null, null]; // Añadido para registrar la fecha del último clic por botón

    if (!fechaInicio || diaActual >= DIAS_TOTAL) {
        fechaInicio = new Date();
        localStorage.setItem('fechaInicio', fechaInicio);
        pulsosPorBoton = [0, 0, 0, 0, 0, 0];
        localStorage.setItem('pulsosPorBoton', JSON.stringify(pulsosPorBoton));
        ultimosClics = [null, null, null, null, null, null]; // Inicializar ultimosClics
        localStorage.setItem('ultimosClics', JSON.stringify(ultimosClics)); // Guardar ultimosClics en localStorage
        diaActual = 0;
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
              color = `linear-gradient(to right, red 33%, yellow ${progreso}%, transparent ${progreso}%)`;
        } else {
               color = `linear-gradient(to right, red 33%, yellow 66%, green ${progreso}%, transparent ${progreso}%)`;
        }

        document.getElementById('barraEstado').style.width = progreso + '%';
        document.getElementById('barraEstado').style.background = color;
        document.getElementById('dia-actual').innerText = `Día ${diaActual + 1} de 30`;
    }

    function guardarEstado() {
        localStorage.setItem('pulsosPorBoton', JSON.stringify(pulsosPorBoton));
        localStorage.setItem('ultimosClics', JSON.stringify(ultimosClics)); // Guardar ultimosClics en localStorage
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
        localStorage.setItem('fechaInicio', fechaInicio);
        resetearBarra();
        diaActual = 0;
        document.getElementById('dia-actual').innerText = `Día ${diaActual + 1} de 30`;
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
});

//   if (progreso <= 33) {
 //   color = `linear-gradient(to right, red ${progreso}%, transparent ${progreso}%)`;
//} else if (progreso <= 66) {
 //   color = `linear-gradient(to right, red 33%, yellow ${progreso}%, transparent ${progreso}%)`;
//} else {
 //   color = `linear-gradient(to right, red 33%, yellow 66%, green ${progreso}%, transparent ${progreso}%)`;
//}//