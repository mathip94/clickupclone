# 🔐 Guía de Seguridad - ClickUp Clone

## ⚠️ INFORMACIÓN IMPORTANTE ANTES DE SUBIR A PRODUCCIÓN

### 🚨 Variables de Entorno Sensibles

**NUNCA subas estos archivos al repositorio:**
- `.env.local`
- `.env.production`
- `.env`
- Cualquier archivo que contenga claves reales

### 🔑 Claves que DEBES cambiar en producción:

#### 1. NEXTAUTH_SECRET
```bash
# Generar una clave segura:
openssl rand -base64 32
# O usar un generador online seguro
```

#### 2. DATABASE_URL
```bash
# Desarrollo (SQLite):
DATABASE_URL="file:./dev.db"

# Producción (PostgreSQL):
DATABASE_URL="postgresql://username:password@host:5432/database"
```

#### 3. Google OAuth (si se usa)
- Obtener credenciales reales en [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- Configurar URLs de callback autorizadas
- **NUNCA** usar credenciales de prueba en producción

### 🛡️ Lista de Verificación de Seguridad

#### Antes de subir el código:
- [ ] Verificar que `.env.local` esté en `.gitignore`
- [ ] Confirmar que no hay claves hardcodeadas en el código
- [ ] Revisar que `env.example` solo tenga placeholders
- [ ] Validar que las claves de prueba sean obviamente falsas

#### En producción:
- [ ] Generar `NEXTAUTH_SECRET` único y seguro
- [ ] Configurar base de datos de producción
- [ ] Usar variables de entorno del servidor (no archivos .env)
- [ ] Habilitar HTTPS
- [ ] Configurar dominios autorizados
- [ ] Implementar rate limiting
- [ ] Configurar logs de seguridad

### 🔍 Archivos Revisados

Los siguientes archivos han sido verificados y NO contienen información sensible:

#### ✅ Seguros para subir:
- `lib/auth.ts` - Solo usa `process.env.*`
- `lib/db.ts` - Configuración genérica de Prisma
- `next.config.js` - Configuración básica
- `package.json` - Solo dependencias públicas
- Todos los componentes React - Sin hardcoded secrets

#### ⚠️ Verificar antes de subir:
- `env.example` - Solo placeholders, seguro ✅
- `.gitignore` - Incluye archivos sensibles ✅

### 📝 Variables de Entorno Requeridas

#### Mínimo para desarrollo:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="clave-de-desarrollo-local"
NEXTAUTH_URL="http://localhost:3000"
```

#### Adicionales para producción:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="clave-super-segura-32-caracteres"
NEXTAUTH_URL="https://tudominio.com"
GOOGLE_CLIENT_ID="..." # Si usas OAuth
GOOGLE_CLIENT_SECRET="..." # Si usas OAuth
```

### 🚨 Qué hacer si accidentalmente subes una clave

1. **Rotación inmediata**: Cambia la clave comprometida
2. **Revisar logs**: Verifica si fue usada maliciosamente
3. **Limpiar historial**: Usar `git filter-branch` o herramientas como BFG
4. **Notificar**: Si es una aplicación en producción, considera notificar a usuarios

### 📚 Recursos Adicionales

- [OWASP Security Guidelines](https://owasp.org/)
- [NextAuth.js Security Considerations](https://next-auth.js.org/configuration/options#secret)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

### 🔄 Revisión Regular

- Revisar este documento mensualmente
- Auditar variables de entorno trimestralmente
- Rotar claves según políticas de seguridad
- Mantener dependencias actualizadas

---

**Fecha de última revisión:** Diciembre 2024  
**Responsable:** Equipo de Desarrollo  
**Próxima revisión:** Marzo 2025 