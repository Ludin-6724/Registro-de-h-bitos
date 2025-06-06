# Registro de hábitos

Esta aplicación permite registrar hábitos de manera local usando el navegador. Cada usuario puede crear su propia lista de hábitos, marcar el avance diario y ver una barra de progreso general.

## Uso
1. Pulsa **Agregar usuario** y escribe el nombre.
2. Para cada usuario puedes añadir hábitos con su objetivo semanal.
3. Al pulsar el botón de cada hábito se incrementa el progreso de la semana.
4. La barra principal muestra un gradiente que va de azul a rojo según el progreso general y cada hábito tiene una barra verde independiente.
5. En la columna derecha se despliega un marcador con todas las barras de progreso para comparar usuarios.
6. El encabezado muestra el día actual sincronizado con la hora local y cada hábito solo puede registrarse una vez por jornada.
7. Debajo de la barra verde de cada hábito aparecen casillas con los días de la semana para un mejor aspecto en móviles. Al registrar el hábito se coloca un ✓ en la casilla correspondiente y se resalta el día actual.
8. Puedes eliminar usuarios con el botón **Eliminar** de su encabezado.
9. La interfaz se adapta a dispositivos móviles para que sea sencillo registrar hábitos desde el teléfono.

Los datos se guardan en `localStorage` y se reinician al comenzar una nueva semana según la hora local del dispositivo.
