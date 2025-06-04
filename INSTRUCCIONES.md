# 🚀 Instrucciones de Instalación y Configuración

## Pasos para ejecutar el ClickUp Clone

### 1. Instalar Dependencias

Primero, instala todas las dependencias del proyecto:

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo de variables de entorno:

```bash
cp env.example .env.local
```

Edita el archivo `.env.local` con tus configuraciones:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="tu-clave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Configurar Base de Datos

Genera el cliente de Prisma y crea la base de datos:

```bash
# Generar cliente de Prisma
npx prisma generate

# Crear la base de datos SQLite
npx prisma db push

# (Opcional) Ver la base de datos en Prisma Studio
npx prisma studio
```

### 4. Ejecutar el Proyecto

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

## 🏗️ Estructura de Páginas y Funcionalidades

### Páginas Principales:
- **/** - Página de inicio con presentación del producto
- **/auth/login** - Página de inicio de sesión
- **/auth/register** - Página de registro de usuarios  
- **/dashboard** - Dashboard principal con métricas avanzadas y gestión de tareas
- **/dashboard/tasks** - Lista completa de tareas con filtros y búsqueda avanzada

### 🎯 Dashboard Avanzado

#### Características Principales:
- **Métricas en tiempo real**: Contadores dinámicos que se actualizan automáticamente
- **Estadísticas de tiempo**: Cálculo automático del tiempo trabajado hoy desde localStorage
- **Gestión de tareas integrada**: Primeras 6 tareas con funcionalidad completa
- **Progreso de proyectos**: Cálculo automático basado en tareas completadas vs totales
- **Acciones rápidas**: Creación directa de tareas y proyectos (sin cronómetro general)

#### Contadores Implementados:
- **Tareas Totales**: Suma de todas las tareas del usuario
- **En Progreso**: Tareas con estado `IN_PROGRESS`
- **Completadas**: Tareas con estado `DONE`
- **Tiempo Hoy**: Suma automática de todos los cronómetros activos (actualización cada 30s)

### ⏱️ Sistema de Cronómetros Individuales

#### Funcionalidades Avanzadas:
- **Cronómetro por tarea**: Cada tarea tiene su propio cronómetro independiente
- **Persistencia completa**: Los cronómetros continúan funcionando entre recargas de página
- **Prevención de múltiples timers**: Solo un cronómetro puede estar activo a la vez en todo el sistema
- **Descripciones de trabajo**: Campo opcional para describir en qué se está trabajando
- **Tiempo acumulado diario**: Visualización del tiempo total trabajado por tarea cada día
- **Guardado automático**: Al detener el cronómetro, se guarda automáticamente en la base de datos

#### Lógica Técnica:
```javascript
// Formato de almacenamiento en localStorage
taskTime_${taskId}_${today} = seconds
activeTaskTimer = { taskId, startTime, description }
```

#### Estados del Cronómetro:
- **Detenido**: Botón "Iniciar" disponible, tiempo en 0:00
- **Corriendo**: Botón "Detener" activo, tiempo incrementándose cada segundo
- **Guardando**: Estado temporal mientras se guarda en la base de datos

### 📝 Modal de Registros de Tiempo

#### Características:
- **Acceso directo**: Click en el ícono de reloj en cada tarjeta de tarea
- **Vista completa**: Lista de todos los registros de tiempo de la tarea
- **Información detallada**: 
  - Duración en formato amigable (horas, minutos, segundos)
  - Descripción del trabajo realizado
  - Fechas y horas de inicio y fin
  - Usuario que realizó el trabajo
- **Resumen estadístico**: Total de registros y tiempo acumulado
- **Gestión**: Capacidad de eliminar registros individuales con confirmación

### 💬 Sistema de Comentarios Independiente

#### Funcionalidades:
- **Separación completa**: Los comentarios son independientes del sistema de cronómetros
- **Modal dedicado**: Acceso a través del ícono de comentario en cada tarea
- **Gestión completa**:
  - Agregar nuevos comentarios con formulario dedicado
  - Ver todos los comentarios ordenados por fecha (más recientes primero)
  - Eliminar comentarios propios o como administrador
- **Información contextual**:
  - Autor del comentario con avatar
  - Fecha y hora de creación
  - Indicador de edición si aplica

### ✏️ Edición Completa de Tareas

#### Modal de Edición:
- **Campos editables**:
  - Título de la tarea (requerido)
  - Descripción completa
  - Proyecto asignado (con cambio de workspace automático)
  - Usuario asignado (filtrado por miembros del workspace)
  - Prioridad (Baja, Media, Alta, Urgente)
  - Estado (Por Hacer, En Progreso, En Revisión, Completada, Cancelada)
  - Fecha de inicio (datetime-local)
  - Fecha límite (datetime-local)

#### Características Avanzadas:
- **Validación robusta**: Validación client-side y server-side con Zod
- **Eliminación de tareas**: Botón de eliminación con confirmación
- **Actualización en tiempo real**: Cambios reflejados inmediatamente en el dashboard
- **Manejo de errores**: Mensajes de error específicos para diferentes problemas

### 🎨 Tarjetas de Tareas (TaskCard)

#### Componentes Integrados:
- **Información del proyecto**: Dot de color y nombre
- **Indicador de prioridad**: Emoji visual para cada nivel
- **Estado interactivo**: Dropdown para cambio rápido de estado
- **Fechas inteligentes**: Inicio y vencimiento con indicador de vencidas
- **Asignación**: Avatar y nombre del usuario asignado
- **Estadísticas clickeables**:
  - **Comentarios**: Click para abrir modal de comentarios
  - **Registros de tiempo**: Click para abrir modal de registros
- **Cronómetro integrado**: Componente TaskTimer directamente en cada tarjeta
- **Botón de edición**: Acceso directo al modal de edición

### 📱 Lista Completa de Tareas (/dashboard/tasks)

#### Características:
- **Filtros avanzados**:
  - Por estado (todos, por hacer, en progreso, etc.)
  - Por prioridad (todas, baja, media, alta, urgente)
  - Por proyecto (todos los proyectos disponibles)
  - Por asignación (todas, mis tareas, sin asignar)
  - Búsqueda por texto (título y descripción)
- **Vista en grid**: Layout responsivo con tarjetas completas
- **Navegación**: Enlace de retorno al dashboard
- **Creación rápida**: Botón para crear nueva tarea desde la vista
- **Contador dinámico**: Muestra cantidad filtrada vs total

### 🌓 Modo Oscuro

#### Implementación:
- **Toggle persistente**: Botón en header que recuerda la preferencia
- **Soporte completo**: Todos los componentes tienen variantes oscuras
- **Detección automática**: Respeta la preferencia del sistema operativo
- **Script de hidratación**: Evita el flash de tema incorrecto

### 🔧 APIs Implementadas

#### Gestión de Tareas:
```
GET    /api/tasks              # Obtener todas las tareas del usuario
POST   /api/tasks              # Crear nueva tarea
GET    /api/tasks/[id]          # Obtener tarea específica
PATCH  /api/tasks/[id]          # Actualizar campos de tarea
DELETE /api/tasks/[id]          # Eliminar tarea completamente
```

#### Registros de Tiempo:
```
GET    /api/tasks/[id]/time-entries    # Obtener registros de una tarea
POST   /api/tasks/[id]/time-entries    # Crear nuevo registro de tiempo
DELETE /api/time-entries/[id]          # Eliminar registro específico
```

#### Comentarios:
```
GET    /api/tasks/[id]/comments    # Obtener comentarios de una tarea
POST   /api/tasks/[id]/comments    # Crear nuevo comentario
DELETE /api/comments/[id]          # Eliminar comentario específico
```

#### Dashboard:
```
GET    /api/dashboard/stats       # Estadísticas para el dashboard
```

### 🔐 Seguridad y Autorización

#### Verificaciones Implementadas:
- **Autenticación**: Todas las APIs requieren sesión válida
- **Autorización de workspace**: Solo miembros del workspace pueden acceder a las tareas
- **Permisos granulares**:
  - Solo el autor puede eliminar sus comentarios
  - Administradores y owners pueden eliminar cualquier comentario/registro
  - Solo miembros del workspace pueden ver/editar tareas del proyecto

### 📊 Base de Datos

El schema de Prisma incluye todos los modelos actualizados:

- **User**: Usuarios del sistema con autenticación
- **Workspace**: Espacios de trabajo para organizar proyectos
- **WorkspaceMember**: Relación de usuarios con workspaces y roles
- **Project**: Proyectos dentro de workspaces con colores
- **Task**: Tareas completas con todos los campos necesarios
- **Comment**: Comentarios en tareas con autor y timestamps
- **TimeEntry**: Registros de tiempo con duración y descripción
- **Tag**: Sistema de etiquetas (preparado para futuro uso)
- **TaskTag**: Relación muchos a muchos entre tareas y etiquetas

### 🎨 Diseño y UI

#### Características del Diseño:
- **Paleta de colores**: Púrpura (#7B68EE) como color principal con variantes
- **Tipografía**: Inter font para legibilidad moderna
- **Iconos**: Combinación de SVGs y emojis para interfaz expresiva
- **Layout responsivo**: Grid adaptable para diferentes dispositivos
- **Estados visuales**: Hover effects, loading states, y feedback inmediato
- **Consistencia**: Sistema de componentes reutilizables

#### Modo Oscuro:
- **Colores adaptados**: Grises oscuros y blancos suaves
- **Contraste óptimo**: Legibilidad mantenida en ambos temas
- **Transiciones suaves**: Cambio gradual entre temas

## 🔄 Flujo de Trabajo Recomendado

### Para Usuarios Nuevos:
1. **Registro/Login**: Crear cuenta o iniciar sesión
2. **Explorar Dashboard**: Familiarizarse con la interfaz
3. **Crear Primer Proyecto**: Configurar un proyecto de prueba
4. **Agregar Tareas**: Crear algunas tareas con diferentes prioridades
5. **Probar Cronómetro**: Iniciar trabajo en una tarea y usar el cronómetro
6. **Agregar Comentarios**: Documentar progreso y comunicaciones
7. **Revisar Registros**: Ver tiempo invertido y registros detallados

### Para Desarrollo:
1. **Revisar Logs**: Console muestra información detallada de cronómetros
2. **Probar APIs**: Usar herramientas como Postman para probar endpoints
3. **Inspeccionar localStorage**: Ver datos de cronómetros en DevTools
4. **Base de datos**: Usar Prisma Studio para ver datos almacenados

## 🐛 Debugging y Troubleshooting

### Problemas Comunes:

#### Cronómetros no funcionan:
- **Verificar localStorage**: Comprobar que no esté bloqueado
- **Revisar consola**: Buscar errores de JavaScript
- **Limpiar datos**: Limpiar localStorage si hay datos corruptos

#### Tiempo no se guarda:
- **Verificar API**: Comprobar que el endpoint responde correctamente
- **Revisar autenticación**: Asegurar que la sesión sea válida
- **Base de datos**: Verificar conexión y permisos

#### Comentarios no aparecen:
- **Verificar permisos**: Comprobar acceso al workspace
- **API response**: Revisar respuesta del endpoint de comentarios
- **Estado del componente**: Verificar que el modal se actualice correctamente

### Logs Útiles:
```javascript
// En consola del navegador:
localStorage.getItem('activeTaskTimer') // Ver cronómetro activo
localStorage.getItem('taskTime_TASK_ID_DATE') // Ver tiempo acumulado

// En server logs:
console.log('Timer stopped for task', taskId, 'saved', elapsedTime, 'seconds')
```

## 🚀 Próximos Pasos Sugeridos

### Funcionalidades Adicionales:
1. **Sistema de notificaciones**: Alertas para deadlines y mentions
2. **Archivos adjuntos**: Subida y gestión de archivos en tareas
3. **Filtros avanzados**: Búsqueda por rango de fechas y múltiples criterios
4. **Reportes exportables**: PDF/CSV de tiempo y progreso
5. **Chat en tiempo real**: Comunicación instantánea en proyectos
6. **Integraciones**: Conexión con Slack, Google Calendar, etc.

### Mejoras Técnicas:
1. **React Query/SWR**: Caché y sincronización de datos optimizada
2. **WebSockets**: Actualizaciones en tiempo real para colaboración
3. **PWA**: Capacidades offline y instalación como app
4. **Tests**: Suite completa de tests unitarios e integración
5. **Optimización**: Lazy loading y code splitting
6. **Monitoreo**: Analytics y tracking de errores

### Performance:
1. **Optimización de imágenes**: Next.js Image component
2. **SEO**: Meta tags dinámicos y sitemap
3. **Caching**: Estrategias de caché para APIs
4. **Bundle analysis**: Análisis y optimización del bundle

## 🎉 ¡Tu ClickUp Clone Avanzado está listo!

Has completado exitosamente un sistema avanzado de gestión de proyectos con:

✅ **Cronómetros individuales con persistencia**
✅ **Sistema completo de registros de tiempo**  
✅ **Comentarios separados e independientes**
✅ **Edición completa de tareas**
✅ **Dashboard con métricas en tiempo real**
✅ **Filtros y búsqueda avanzada**
✅ **Modo oscuro completo**
✅ **APIs robustas con autorización**
✅ **Interfaz responsiva y moderna**

El proyecto ahora incluye todas las características necesarias para un sistema profesional de gestión de proyectos, con una base sólida para futuras expansiones y mejoras.

Para soporte técnico o preguntas, consulta el README.md principal o crea un issue en el repositorio. ¡Disfruta tu nueva herramienta de productividad! 🚀 