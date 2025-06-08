# Registro de hábitos

Esta aplicación permite registrar hábitos de manera local usando el navegador. Cada usuario puede crear su propia lista de hábitos, marcar el avance diario y ver una barra de progreso general.

## Uso
1. Pulsa **Agregar usuario** y escribe el nombre. Para confirmar se te pedirá la contraseña `1234`.
2. Para cada usuario puedes añadir hábitos con su objetivo semanal.
3. Al pulsar el botón de cada hábito se incrementa el progreso de la semana.
4. La barra principal muestra un gradiente que va de azul a rojo según el progreso general y cada hábito tiene una barra verde independiente.
5. En la columna derecha se despliega un marcador con todas las barras de progreso para comparar usuarios.
6. El encabezado muestra el día actual sincronizado con la hora local y cada hábito solo puede registrarse una vez por jornada.
7. Debajo del marcador de competencia aparece un mini calendario. Al hacer clic sobre un día se abre el diario en pantalla completa con tema oscuro. Las notas se guardan localmente y pueden descargarse como archivo de texto.
8. Debajo de la barra verde de cada hábito aparecen casillas con los días de la semana para un mejor aspecto en móviles. Al registrar el hábito se coloca un ✓ en la casilla correspondiente y se resalta el día actual.
9. Puedes eliminar usuarios con el botón **Eliminar usuario** situado bajo su lista de hábitos. Al presionarlo deberás ingresar la contraseña `1234`.
10. La interfaz se adapta a dispositivos móviles para que sea sencillo registrar hábitos desde el teléfono.

Los datos se guardan en `localStorage` y se reinician al comenzar una nueva semana según la hora local del dispositivo.
