# BFF Mobile Login API

Backend for Frontend (BFF) API para servicios de login móvil, desarrollado en Node.js con NestJS.## Estructura del Proyecto

```
src/
├── auth/                    # Módulo de autenticación
│   ├── auth.controller.ts   # Controlador de autenticación
│   ├── auth.service.ts      # Lógica de negocio de autenticación
│   ├── auth.module.ts       # Módulo de autenticación
│   ├── guards/             # Guards de autenticación
│   ├── strategies/         # Estrategias JWT
│   └── services/          # Servicios de tokens
├── subscription/           # Módulo de suscripciones
├── common/                 # Servicios y DTOs compartidos
│   ├── dto/               # Data Transfer Objects
│   ├── interfaces/        # Interfaces TypeScript
│   ├── middleware/        # Middleware personalizado
│   └── services/          # Servicios externos
├── config/                # Configuración de la aplicación
├── app.module.ts          # Módulo principal
└── main.ts               # Punto de entrada
```ste BFF actúa como intermediario entre las aplicaciones móviles y los microservicios backend, proporcionando una API optimizada para dispositivos móviles con funcionalidades de autenticación y gestión de suscripciones. Implementa un sistema robusto de seguridad con JWT, rate limiting y protecciones contra ataques comunes.

## Características

- 🚀 **NestJS Framework** - Arquitectura modular y escalable
- 📱 **Optimizado para Mobile** - Endpoints específicos para aplicaciones móviles
- 🔐 **Autenticación JWT** - Sistema robusto con tokens de acceso y refresh
- �️ **Seguridad Avanzada**:
  - Rate limiting por IP
  - Protección contra ataques comunes (Helmet)
  - Blacklist de tokens revocados
  - Validación de claims JWT
- �📧 **Gestión de Suscripciones** - Creación y validación con OTP
- 📚 **Swagger Documentation** - Documentación automática de la API
- ✅ **Validación de Datos** - Validación robusta con class-validator
- 🔄 **CORS Configurado** - Soporte seguro para aplicaciones móviles

## Endpoints

### Autenticación
- `POST /v1/private/accounts` - Crear cuenta de comercio
- `POST /v1/private/login` - Autenticación de comercio
- `POST /v1/private/refresh` - Renovar access token

### Suscripciones
- `POST /v1/private/subscriptions` - Crear suscripción
- `PUT /v1/private/subscriptions/{cuit}` - Validar suscripción con OTP
- `PATCH /v1/private/subscriptions/{cuit}` - Reenviar challenge OTP

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Configurar secret key para JWT (reemplazar con un valor seguro)
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env

# Compilar el proyecto
npm run build

# Ejecutar en modo desarrollo
npm run start:dev

# Ejecutar en modo producción
npm run start:prod
```

## Configuración

El archivo `.env` contiene la configuración del sistema:

```env
# Configuración JWT
JWT_SECRET=tu_secret_seguro_aqui
JWT_EXPIRATION=3600
REFRESH_TOKEN_EXPIRATION=604800

# Configuración de Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Configuración de servicios externos
SECURITY_SERVICE_HOST=http://localhost:8087/v1/private
SECURITY_SERVICE_TIMEOUT=10000
MERCHANTS_SERVICE_HOST=http://localhost:1080/api/merchants
MERCHANTS_SERVICE_TIMEOUT=10000
CLIENTS_SERVICE_HOST=http://localhost:8082/v1
CLIENTS_SERVICE_TIMEOUT=10000
```

## Seguridad

### JWT y Autenticación

El sistema implementa un sistema robusto de autenticación basado en JWT con las siguientes características:

- Access tokens de corta duración (1 hora por defecto)
- Refresh tokens de larga duración (7 días por defecto)
- Validación de claims en tokens
- Blacklist de tokens revocados
- Rotación de refresh tokens

### Protecciones Implementadas

1. **Rate Limiting**:
   - Límite global: 100 peticiones por IP cada 15 minutos
   - Límite específico para auth: 10 intentos por minuto

2. **Headers de Seguridad (Helmet)**:
   - XSS Protection
   - Content Security Policy
   - Frame protection
   - MIME sniffing protection

3. **Validación de Datos**:
   - Sanitización de inputs
   - Validación de tipos
   - Protección contra inyección

### Mejores Prácticas

- Usar HTTPS en producción
- Rotar JWT_SECRET periódicamente
- Monitorear intentos fallidos de autenticación
- Implementar almacenamiento persistente para blacklist de tokens

## Documentación

Una vez iniciado el servidor, la documentación de Swagger estará disponible en:
- http://localhost:3000/api

## Estructura del Proyecto

```
src/
├── auth/                    # Módulo de autenticación
│   ├── auth.controller.ts   # Controlador de autenticación
│   ├── auth.service.ts      # Lógica de negocio de autenticación
│   └── auth.module.ts       # Módulo de autenticación
├── subscription/            # Módulo de suscripciones
│   ├── subscription.controller.ts
│   ├── subscription.service.ts
│   └── subscription.module.ts
├── common/                  # Servicios y DTOs compartidos
│   ├── dto/                 # Data Transfer Objects
│   ├── interfaces/          # Interfaces TypeScript
│   └── services/            # Servicios externos
├── app.module.ts           # Módulo principal
└── main.ts                 # Punto de entrada
```

## Servicios Externos

El BFF se comunica con los siguientes microservicios:

- **Merchants Service** (puerto 1080) - Gestión de comercios
- **Clients Service** (puerto 8082) - Gestión de clientes y suscripciones
- **Security Service** (puerto 8087) - Autenticación y autorización

## Scripts Disponibles

- `npm run start:dev` - Ejecutar en modo desarrollo con hot-reload
- `npm run build` - Compilar el proyecto
- `npm run start:prod` - Ejecutar en modo producción
- `npm run lint` - Ejecutar linter
- `npm run test` - Ejecutar tests

## Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **NestJS** - Framework web para Node.js
- **TypeScript** - Superset tipado de JavaScript
- **JWT** - JSON Web Tokens para autenticación
- **Passport** - Middleware de autenticación
- **Helmet** - Seguridad de headers HTTP
- **Express Rate Limit** - Control de tasa de peticiones
- **Axios** - Cliente HTTP
- **Class Validator** - Validación de datos
- **Swagger** - Documentación de API

## Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Seguridad

Si descubres alguna vulnerabilidad de seguridad, por favor envía un email a security@example.com en lugar de usar el sistema de issues.

