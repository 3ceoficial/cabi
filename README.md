# Mi Jornada Pro 📱🏍️

**La aplicación definitiva para repartidores de Cabify en Buenos Aires**

Una aplicación web responsive diseñada específicamente para que los repartidores de moto de Cabify puedan registrar, calcular y analizar sus jornadas de trabajo de manera eficiente.

## ⚡ **CRONÓMETRO EN SEGUNDO PLANO** ⚡

**🎯 NUEVA FUNCIONALIDAD CLAVE:** La aplicación ahora **mantiene el cronómetro funcionando** incluso cuando:
- Cierras la aplicación ❌
- Cambias a otra app ❌ 
- Bloqueas el teléfono ❌
- Minimizas el navegador ❌

**✅ Al regresar:** El cronómetro se restaura automáticamente con el tiempo correcto, incluyendo todo el tiempo que pasó mientras la app estaba cerrada.

**🟢 Indicador Visual:** Un badge verde te confirma que el cronómetro está funcionando en segundo plano.

*Para más detalles, ver: [FUNCIONAMIENTO_SEGUNDO_PLANO.md](./FUNCIONAMIENTO_SEGUNDO_PLANO.md)*

---

## ✨ Características Principales

### ⏱️ **Registro de Jornadas**
- **Cronómetro integrado**: Inicia, pausa y finaliza tus jornadas con precisión
- **Control de tiempo real**: Visualiza el tiempo transcurrido en tiempo real
- **Funcionalidad pausa/reanudar**: Perfecto para descansos o interrupciones
- **Edición flexible**: Registra viajes manualmente cuando sea necesario

### 🛣️ **Registro de Kilómetros y Viajes**
- **Entrada manual de kilómetros**: Registra la distancia recorrida por jornada
- **Contador de viajes**: Lleva el registro del número de entregas realizadas
- **Entrada rápida**: Función para registrar viajes individuales sin cronómetro

### 💰 **Cálculo Automático de Ganancias**
Configurado con las tarifas oficiales de Cabify Buenos Aires:
- **Tarifa inicial**: $728,00
- **Precio por kilómetro**: $247,00
- **Precio por minuto**: $106,00
- **Tarifa mínima**: $1.457,00
- **Comisión configurable**: 25% por defecto

#### Fórmula de Cálculo:
1. **Costo por distancia**: Kilómetros × $247,00
2. **Costo por tiempo**: Minutos × $106,00
3. **Subtotal bruto**: Tarifa inicial + Costo distancia + Costo tiempo
4. **Ganancia bruta**: Máximo entre Subtotal y Tarifa mínima
5. **Ganancia neta**: Ganancia bruta - Comisión

### 📊 **Métricas y Reportes Detallados**
- **Resumen diario**: Horas, kilómetros, ganancias y viajes del día
- **Reportes semanales y mensuales**: Análisis de períodos extendidos
- **Promedios calculados**:
  - Ganancia por hora trabajada
  - Ganancia por kilómetro recorrido
  - Ganancia promedio por viaje
  - Horas promedio trabajadas por día

### 📈 **Historial Completo**
- **Registro detallado**: Todas las jornadas con fecha, duración, kilómetros y ganancias
- **Filtros por fecha**: Busca jornadas específicas fácilmente
- **Visualización clara**: Información organizada y fácil de leer

### ⚙️ **Configuración Personalizable**
- **Tarifas actualizables**: Modifica las tarifas cuando Cabify las actualice
- **Porcentaje de comisión**: Ajusta según tu acuerdo con la plataforma
- **Exportación de datos**: Respalda toda tu información en formato JSON
- **Limpieza de datos**: Opción para reiniciar la aplicación completamente

## 🚀 **Cómo Usar la Aplicación**

### Inicio Rápido:
1. **Abrir la aplicación** en tu navegador móvil
2. **Iniciar jornada** con el botón verde principal
3. **Trabajar normalmente** - el cronómetro registra el tiempo
4. **Pausar/reanudar** cuando necesites descansos
5. **Finalizar jornada** e ingresar kilómetros y número de viajes
6. **Ver resumen** con ganancias calculadas automáticamente

### Navegación por Pestañas:
- **🏠 Inicio**: Control de cronómetro y estadísticas del día
- **📝 Historial**: Registro completo de todas las jornadas
- **📊 Reportes**: Métricas y análisis de diferentes períodos
- **⚙️ Config**: Ajustes de tarifas y gestión de datos

## 📱 **Instalación y Uso**

### Opción 1: Navegador Web
1. Abrir el archivo `index.html` en cualquier navegador web moderno
2. La aplicación es completamente responsive y funciona perfectamente en móviles
3. Recomendamos **Google Chrome** o **Safari** para la mejor experiencia

### Opción 2: Aplicación Web Progresiva (PWA)
1. Abrir en el navegador móvil
2. Tocar "Agregar a pantalla de inicio" cuando aparezca la opción
3. La aplicación se instalará como una app nativa

## 💾 **Almacenamiento de Datos**

- **Almacenamiento local**: Todos los datos se guardan en el dispositivo
- **Sin conexión requerida**: Funciona completamente offline
- **Privacidad total**: Tus datos nunca salen del dispositivo
- **Exportación disponible**: Crea respaldos cuando lo desees

## 🛠️ **Tecnologías Utilizadas**

- **HTML5**: Estructura semántica y moderna
- **CSS3**: Diseño responsive con animaciones fluidas
- **JavaScript ES6+**: Lógica de aplicación robusta y eficiente
- **LocalStorage**: Persistencia de datos sin necesidad de servidor
- **Font Awesome**: Iconos profesionales
- **PWA Ready**: Listo para instalación como aplicación web progresiva

## 📋 **Requisitos del Sistema**

- **Navegadores soportados**: 
  - Chrome 80+
  - Safari 13+
  - Firefox 75+
  - Edge 80+
- **Dispositivos**: Móviles, tablets y escritorio
- **Resoluciones**: Optimizado para pantallas de 320px a 1920px
- **Conexión**: No requiere internet después de la carga inicial

## 🔧 **Configuración de Tarifas**

La aplicación viene preconfigurada con las tarifas actuales de Cabify Buenos Aires. Para actualizarlas:

1. Ve a la pestaña **Configuración**
2. Modifica los valores según las nuevas tarifas
3. Presiona **Guardar Configuración**
4. Los cálculos futuros usarán las nuevas tarifas

## 📊 **Ejemplo de Cálculo**

**Viaje de ejemplo:**
- Duración: 20 minutos
- Distancia: 8 kilómetros
- Número de viajes: 1

**Cálculo:**
- Costo por distancia: 8 km × $247,00 = $1.976,00
- Costo por tiempo: 20 min × $106,00 = $2.120,00
- Subtotal bruto: $728,00 + $1.976,00 + $2.120,00 = $4.824,00
- Ganancia bruta: $4.824,00 (mayor que tarifa mínima)
- Comisión (25%): $4.824,00 × 0,25 = $1.206,00
- **Ganancia neta: $3.618,00**

## 🆘 **Soporte y Mantenimiento**

### Funciones de Respaldo:
- **Exportar datos**: Descarga un archivo JSON con toda tu información
- **Importar datos**: (Función disponible para desarrollo futuro)
- **Limpiar datos**: Reinicia la aplicación completamente

### Solución de Problemas Comunes:
1. **El cronómetro se detuvo**: Revisa si hay pestañas duplicadas abiertas
2. **Datos perdidos**: Verifica que no hayas limpiado el cache del navegador
3. **Cálculos incorrectos**: Confirma las tarifas en Configuración
4. **La app no carga**: Asegúrate de tener JavaScript habilitado

## 🔄 **Actualizaciones Futuras**

### Funciones planeadas:
- Integración GPS para registro automático de kilómetros
- Gráficos de rendimiento y tendencias
- Exportación a Excel/CSV
- Modo oscuro
- Múltiples plataformas (Uber Eats, Rappi, etc.)
- Sincronización en la nube

## 📄 **Licencia**

Esta aplicación ha sido desarrollada para uso personal y profesional de repartidores. Todos los derechos reservados.

---

**Desarrollado por MiniMax Agent** 🤖  
*Optimizando las jornadas de trabajo de los repartidores profesionales*

---

### 🚀 ¡Empieza a usar Mi Jornada Pro hoy mismo y lleva el control total de tus ganancias como repartidor de Cabify!

¿Tienes sugerencias o encontraste algún error? Tu feedback es valioso para mejorar la aplicación.