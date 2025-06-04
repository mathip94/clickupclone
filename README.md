# ClickUp Clone - Gestión de Proyectos

Una aplicación completa de gestión de proyectos inspirada en ClickUp, desarrollada con Next.js 14, TypeScript, Prisma y Tailwind CSS.

## 🚀 Características Principales

- **Gestión de Proyectos**: Organiza y administra proyectos con múltiples espacios de trabajo
- **Gestión de Tareas**: Crea, asigna y da seguimiento a tareas con estados personalizables
- **Seguimiento de Tiempo**: Registra el tiempo dedicado a cada tarea con cronómetro integrado
- **Colaboración en Equipo**: Asigna tareas a miembros del equipo y gestiona roles
- **Dashboard Analítico**: Visualiza el progreso con gráficos y métricas en tiempo real
- **Comentarios**: Sistema de comentarios contextuales en las tareas
- **Etiquetas y Prioridades**: Organiza tareas con etiquetas y niveles de prioridad
- **Notificaciones**: Sistema de notificaciones en tiempo real
- **Autenticación**: Sistema completo de autenticación con NextAuth

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: SQLite (desarrollo), PostgreSQL (producción)
- **Autenticación**: NextAuth.js
- **Validación**: Zod
- **Iconos**: Lucide React
- **Gráficos**: Recharts

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
│   ├── dashboard/         # Dashboard principal
│   ├── projects/          # Gestión de proyectos
│   ├── tasks/             # Gestión de tareas
│   └── api/               # API Routes
├── components/            # Componentes reutilizables
│   ├── ui/                # Componentes de UI base
│   ├── dashboard/         # Componentes del dashboard
│   ├── projects/          # Componentes de proyectos
│   └── tasks/             # Componentes de tareas
├── lib/                   # Utilidades y configuraciones
│   ├── auth.ts            # Configuración de NextAuth
│   ├── db.ts              # Cliente de Prisma
│   └── utils.ts           # Funciones utilitarias
├── prisma/                # Schema y migraciones de Prisma
└── public/                # Archivos estáticos
```

## 📊 Funcionalidades Detalladas

### Gestión de Espacios de Trabajo
- Crear y administrar múltiples espacios de trabajo
- Invitar miembros con diferentes roles (Owner, Admin, Member, Guest)
- Configurar permisos por espacio de trabajo

### Gestión de Proyectos
- Crear proyectos dentro de espacios de trabajo
- Estados de proyecto: Activo, Completado, Archivado, En Pausa
- Fechas de inicio y fin de proyecto
- Colores personalizables para proyectos

### Gestión de Tareas
- Estados de tarea: Por Hacer, En Progreso, En Revisión, Completado, Cancelado
- Niveles de prioridad: Baja, Media, Alta, Urgente
- Asignación a miembros del equipo
- Fechas de vencimiento
- Puntos de estimación
- Sistema de etiquetas

### Seguimiento de Tiempo
- Cronómetro integrado para tareas
- Registro manual de tiempo
- Reportes de tiempo por usuario y proyecto
- Exportación de reportes

### Sistema de Comentarios
- Comentarios contextuales en tareas
- Notificaciones de nuevos comentarios
- Historial completo de actividad

## 🎨 Componentes UI

La aplicación utiliza un sistema de componentes basado en Radix UI:

- **Button**: Botones con múltiples variantes
- **Input**: Campos de entrada con validación
- **Dialog**: Modales y diálogos
- **Dropdown**: Menús desplegables
- **Toast**: Notificaciones tipo toast
- **Tabs**: Navegación por pestañas
- **Avatar**: Avatares de usuario
- **Badge**: Etiquetas y badges

## 🔐 Autenticación y Autorización

- Registro e inicio de sesión con email/contraseña
- Autenticación OAuth (Google)
- Roles de usuario a nivel de aplicación y espacio de trabajo
- Protección de rutas basada en roles
- Sesiones seguras con NextAuth

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

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
- `npm run db:push` - Sincroniza el schema con la base de datos
- `npm run db:studio` - Abre Prisma Studio
- `npm run db:generate` - Genera el cliente de Prisma

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

## 📞 Soporte

Para soporte y preguntas:
- Crea un issue en GitHub
- Contacta al equipo de desarrollo

---

Desarrollado con ❤️ usando Next.js y TypeScript 