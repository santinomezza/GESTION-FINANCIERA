# GESTIONAR2 - Sistema Inteligente de Gestión Financiera

Plataforma profesional de gestión financiera personal y empresarial, enfocada en registrar gastos e ingresos mediante lenguaje natural desde Telegram, visualizar métricas en tiempo real y administrar categorías.

## Arquitectura

- **Backend**: NestJS, Prisma ORM, PostgreSQL.
- **Frontend**: Next.js 14, TailwindCSS, React Query, Zustand, Recharts, Framer Motion.
- **Infraestructura**: Docker, Docker Compose, Nginx (Reverse Proxy + Rate Limiting).
- **Integraciones**: Telegram Bot API, OpenAI (opcional).

## Requisitos

- Docker y Docker Compose instalados.
- Un token de bot de Telegram (obtener desde @BotFather).

## Instalación rápida (VPS / Local)

1. Clonar el repositorio.
2. Dar permisos de ejecución a los scripts: `chmod +x scripts/*.sh`
3. Ejecutar el script de instalación:
   ```bash
   ./scripts/install.sh
   ```
4. Completar las variables de entorno cuando se le solicite (especialmente `TELEGRAM_BOT_TOKEN`).
5. El sistema levantará automáticamente la base de datos, backend y frontend usando Docker Compose.

## Estructura de Directorios

- `/backend`: Código fuente de NestJS.
- `/frontend`: Código fuente de Next.js.
- `/nginx`: Configuración del proxy inverso.
- `/scripts`: Scripts de automatización para despliegue.

## Uso del Bot de Telegram

1. Busque su bot en Telegram.
2. Envíe `/start`.
3. Inicie sesión en la plataforma web (ej. `http://localhost:3000`).
4. Vaya a Configuración, e ingrese el código que el bot le proveyó.
5. ¡Listo! Ya puede registrar movimientos enviando mensajes como:
   - "Compré nafta por 25000"
   - "Ingresaron 150000 por cobros"
   - "Me gasté 5000 en el kiosco"

## Despliegue en Producción

Para actualizar a la última versión y reiniciar los contenedores:
```bash
./scripts/deploy.sh
```

## Credenciales por defecto (Seed)
Si la base de datos se pobló usando el script de seed (`npm run seed`), se creará el siguiente usuario:
- **Email**: admin@gestionar2.com
- **Password**: demo123456
