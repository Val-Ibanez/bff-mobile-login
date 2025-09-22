# BFF Mobile Login API

Backend for Frontend (BFF) API para servicios de login móvil, desarrollado en Node.js con NestJS.

## Descripción

Este BFF actúa como intermediario entre las aplicaciones móviles y los microservicios backend, proporcionando una API optimizada para dispositivos móviles con funcionalidades de autenticación y gestión de suscripciones.

## Características

- 🚀 **NestJS Framework** - Arquitectura modular y escalable
- 📱 **Optimizado para Mobile** - Endpoints específicos para aplicaciones móviles
- 🔐 **Autenticación JWT** - Tokens de acceso y refresh
- 📧 **Gestión de Suscripciones** - Creación y validación con OTP
- 📚 **Swagger Documentation** - Documentación automática de la API
- ✅ **Validación de Datos** - Validación robusta con class-validator
- 🔄 **CORS Habilitado** - Soporte para aplicaciones móviles

## Endpoints

### Autenticación
- `POST /v1/private/accounts` - Crear cuenta de comercio
- `POST /v1/private/login` - Autenticación de comercio

### Suscripciones
- `POST /v1/private/subscriptions` - Crear suscripción
- `PUT /v1/private/subscriptions/{cuit}` - Validar suscripción con OTP
- `PATCH /v1/private/subscriptions/{cuit}` - Reenviar challenge OTP

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp config.env .env

# Compilar el proyecto
npm run build

# Ejecutar en modo desarrollo
npm run start:dev

# Ejecutar en modo producción
npm run start:prod
```

## Configuración

El archivo `config.env` contiene la configuración de los servicios externos:

```env
PORT=3000
MERCHANTS_SERVICE_HOST=http://localhost:1080/api/merchants
CLIENTS_SERVICE_HOST=http://localhost:8082/v1
SECURITY_SERVICE_HOST=http://localhost:8087/v1
```

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
- **Axios** - Cliente HTTP
- **Class Validator** - Validación de datos
- **Swagger** - Documentación de API
