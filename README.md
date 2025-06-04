# ClickUp Clone - Gestión de Proyectos

Una aplicación completa de gestión de proyectos inspirada en ClickUp, desarrollada con Next.js 14, TypeScript, Prisma y Tailwind CSS.

## 🚀 Características Principales

- **Gestión de Proyectos**: Organiza y administra proyectos con múltiples espacios de trabajo
- **Gestión de Tareas Completa**: Crea, edita, asigna y da seguimiento a tareas con estados personalizables
- **Cronómetros Individuales**: Sistema avanzado de cronómetros por tarea con persistencia de datos
- **Seguimiento de Tiempo Detallado**: Registra y visualiza el tiempo dedicado con reportes completos
- **Sistema de Comentarios**: Comentarios separados e independientes del sistema de tiempo
- **Colaboración en Equipo**: Asigna tareas a miembros del equipo y gestiona roles
- **Dashboard Analítico**: Visualiza el progreso con gráficos y métricas en tiempo real
- **Edición Completa de Tareas**: Modifica todas las características de las tareas
- **Modo Oscuro**: Interfaz adaptable con tema claro y oscuro
- **Autenticación**: Sistema completo de autenticación con NextAuth

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS con soporte para modo oscuro
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: SQLite (desarrollo), PostgreSQL (producción)
- **Autenticación**: NextAuth.js
- **Validación**: Zod
- **Estado Local**: localStorage para persistencia de cronómetros
- **Iconos**: SVG integrados y emojis

## 📦 Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/clickup-clone.git
   cd clickup-clone
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura la base de datos**
   ```bash
   # Genera el cliente de Prisma
   npx prisma generate
   
   # Ejecuta las migraciones
   npx prisma db push
   ```

4. **Configura las variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus configuraciones:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="tu-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🏗️ Estructura del Proyecto

```
clickup-clone/
├── app/                    # Directorio de la aplicación (App Router)
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard principal y páginas de tareas
│   │   └── tasks/         # Lista completa de tareas con filtros
│   └── api/               # API Routes
│       ├── tasks/         # CRUD de tareas y sub-recursos
│       │   └── [id]/
│       │       ├── comments/     # API de comentarios
│       │       └── time-entries/ # API de registros de tiempo
│       ├── comments/      # Gestión de comentarios
│       ├── time-entries/  # Gestión de registros de tiempo
│       └── ...
├── components/            # Componentes reutilizables
│   ├── modals/            # Modales (CreateTask, EditTask, TimeEntries, Comments)
│   ├── TaskCard.tsx       # Tarjeta de tarea con cronómetro integrado
│   ├── TaskTimer.tsx      # Componente de cronómetro individual
│   ├── TimeEntriesModal.tsx # Modal para ver registros de tiempo
│   ├── CommentsModal.tsx  # Modal para gestionar comentarios
│   ├── ThemeToggle.tsx    # Toggle para modo oscuro
│   └── providers/         # Proveedores de contexto
├── lib/                   # Utilidades y configuraciones
│   ├── auth.ts            # Configuración de NextAuth
│   ├── db.ts              # Cliente de Prisma
│   └── utils.ts           # Funciones utilitarias
├── prisma/                # Schema y migraciones de Prisma
└── public/                # Archivos estáticos
```

## 🔧 APIs Implementadas

### Tareas
- `GET /api/tasks` - Obtener todas las tareas
- `POST /api/tasks` - Crear nueva tarea
- `GET /api/tasks/[id]` - Obtener tarea específica
- `PATCH /api/tasks/[id]` - Actualizar tarea
- `DELETE /api/tasks/[id]` - Eliminar tarea

### Registros de Tiempo
- `GET /api/tasks/[id]/time-entries` - Obtener registros de tiempo de una tarea
- `POST /api/tasks/[id]/time-entries` - Crear nuevo registro de tiempo
- `DELETE /api/time-entries/[id]` - Eliminar registro de tiempo específico

### Comentarios
- `GET /api/tasks/[id]/comments` - Obtener comentarios de una tarea
- `POST /api/tasks/[id]/comments` - Crear nuevo comentario
- `DELETE /api/comments/[id]` - Eliminar comentario específico

### Dashboard
- `GET /api/dashboard/stats` - Obtener estadísticas del dashboard

## 🎨 Componentes UI

La aplicación utiliza componentes personalizados optimizados:

- **TaskCard**: Tarjeta de tarea con cronómetro integrado y acciones
- **TaskTimer**: Cronómetro individual con persistencia
- **TimeEntriesModal**: Modal para visualizar registros de tiempo
- **CommentsModal**: Modal para gestionar comentarios
- **EditTaskModal**: Modal para edición completa de tareas
- **ThemeToggle**: Alternador de tema claro/oscuro

## 🔐 Autenticación y Autorización

- **NextAuth.js**: Sistema de autenticación robusto
- **Roles y permisos**: Control de acceso basado en roles de workspace
- **Protección de APIs**: Todas las rutas protegidas con verificación de sesión
- **Autorización granular**: Permisos específicos para eliminar comentarios y registros

## 🚀 Características Técnicas

### Persistencia de Datos
- **localStorage**: Para cronómetros activos y tiempo acumulado diario
- **Base de datos**: Para registros permanentes de tiempo y comentarios
- **Sincronización**: Coordinación entre localStorage y base de datos

### Manejo de Errores
- **Try-catch robusto**: Manejo de errores en todas las operaciones críticas
- **Logs detallados**: Sistema de logging para debugging
- **Feedback visual**: Mensajes de error y éxito para el usuario
- **Validación de datos**: Esquemas Zod para validación server-side

### Performance
- **Carga condicional**: Componentes cargados solo cuando son necesarios
- **Actualizaciones optimizadas**: Re-renders mínimos con estado local optimizado
- **Llamadas API eficientes**: Reducción de llamadas innecesarias a la API

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- **Desktop** (1024px+): Interfaz completa con todas las funcionalidades
- **Tablet** (768px - 1023px): Diseño adaptado con navegación optimizada
- **Mobile** (320px - 767px): Interfaz móvil con componentes redimensionados

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Despliega automáticamente

### Manual

1. **Build de producción**
   ```bash
   npm run build
   ```

2. **Inicia el servidor**
   ```bash
   npm start
   ```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Crea el build de producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npx prisma db push` - Sincroniza el schema con la base de datos
- `npx prisma studio` - Abre Prisma Studio
- `npx prisma generate` - Genera el cliente de Prisma

## 🎯 Casos de Uso Principales

1. **Gestión de Proyectos Empresariales**: Equipos que necesitan seguimiento detallado de tiempo y tareas
2. **Freelancers**: Profesionales independientes que requieren facturación basada en tiempo
3. **Equipos de Desarrollo**: Seguimiento de sprints y estimaciones de tiempo
4. **Agencias Creativas**: Gestión de proyectos cliente con múltiples colaboradores

## 🔄 Flujo de Trabajo Típico

1. **Crear Proyecto**: Configura un nuevo proyecto con color y detalles
2. **Agregar Tareas**: Crea tareas con descripciones, fechas y asignaciones
3. **Trabajar con Cronómetro**: Inicia el cronómetro al comenzar a trabajar
4. **Agregar Comentarios**: Documenta progreso y comunicaciones
5. **Revisar Registros**: Analiza tiempo invertido y productividad
6. **Completar Tareas**: Actualiza estados y revisa métricas del proyecto

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🐛 Reportar Bugs

Si encuentras algún bug, por favor crea un issue en GitHub con:
- Descripción detallada del problema
- Pasos para reproducir el bug
- Capturas de pantalla (si aplica)
- Información del sistema
- Logs de consola (si aplica)

## 📞 Soporte

Para soporte y preguntas:
- Crea un issue en GitHub
- Contacta al equipo de desarrollo
- Revisa la documentación en INSTRUCCIONES.md

---

Desarrollado con ❤️ usando Next.js, TypeScript y Prisma 
