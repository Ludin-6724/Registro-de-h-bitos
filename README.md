# Registro de hábitos

Esta aplicación permite registrar hábitos de manera local usando el navegador. Cada usuario puede crear su propia lista de hábitos, marcar el avance diario y ver una barra de progreso general.

## Uso
1. Pulsa **Agregar usuario** y escribe el nombre. Para confirmar se te pedirá la contraseña `1234`.
2. Para cada usuario puedes añadir hábitos con su objetivo semanal.
3. Al pulsar el botón de cada hábito se incrementa el progreso de la semana.
4. La barra principal muestra un gradiente que va de azul a rojo según el progreso general y cada hábito tiene una barra verde independiente.
5. La interfaz combina tonos #A0D2EB y #E5EAF5 con detalles #FFCB3A.
6. En la columna derecha se despliega un marcador con todas las barras de progreso para comparar usuarios.
7. El encabezado muestra el día actual sincronizado con la hora local y cada hábito solo puede registrarse una vez por jornada.
8. Debajo del marcador de competencia aparece un mini calendario. Al hacer clic sobre un día se abre el diario en pantalla completa con tema oscuro. Este editor permite añadir una **lista de tareas** marcables. Las notas se guardan localmente y pueden descargarse como archivo de texto. Las tareas se muestran bajo el calendario y pueden eliminarse desde el diario o desde la lista semanal. Se limpian automáticamente al iniciar una nueva semana.
9. Debajo de la barra verde de cada hábito aparecen casillas con los días de la semana para un mejor aspecto en móviles. Al registrar el hábito se coloca un ✓ en la casilla correspondiente y se resalta el día actual.
10. Puedes eliminar usuarios con el botón **Eliminar usuario** situado bajo su lista de hábitos. Al presionarlo deberás ingresar la contraseña `1234`.
11. La interfaz se adapta a dispositivos móviles para que sea sencillo registrar hábitos desde el teléfono.
12. Al iniciar una nueva semana las barras de cada hábito se reinician. La barra principal promedia las últimas cuatro semanas (incluyendo la actual) para reflejar el avance reciente.
13. Cada nota del diario incluye un campo para escribir "en una frase lo que Dios me está hablando". Esa frase se muestra en un recuadro bajo el calendario y puede eliminarse tanto desde el diario como desde esa lista.
14. El bloque de escritura del diario utiliza la tipografía "Inter" y un mayor espaciado entre líneas para una lectura cómoda.

Los datos se guardan en `localStorage` y se reinician al comenzar una nueva semana según la hora local del dispositivo.
