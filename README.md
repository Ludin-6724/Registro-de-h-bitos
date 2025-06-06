# Registro de hábitos

Esta aplicación permite registrar hábitos de manera local usando el navegador. Cada usuario puede crear su propia lista de hábitos, marcar el avance diario y ver una barra de progreso general.

## Uso
1. Pulsa **Agregar usuario** y escribe el nombre.
2. Para cada usuario puedes añadir hábitos con su objetivo semanal.
3. Al pulsar el botón de cada hábito se incrementa el progreso de la semana.
4. La barra principal muestra un gradiente que va de azul a rojo según el progreso general y cada hábito tiene una barra verde independiente.

Los datos se guardan en `localStorage` y se reinician al comenzar una nueva semana según la hora local del dispositivo.
