#!/bin/bash
set -e

echo "🚀 Iniciando instalación de GESTIONAR2..."

# Check if .env exists, if not copy from example
if [ ! -f .env ]; then
    echo "📋 Copiando .env.example a .env..."
    cp .env.example .env
    echo "⚠️ ATENCIÓN: Por favor edita el archivo .env con tus credenciales (TELEGRAM_BOT_TOKEN, etc)."
    echo "Presiona ENTER cuando hayas configurado el archivo .env para continuar..."
    read
fi

# Build and start containers
echo "🐳 Construyendo y levantando contenedores con Docker Compose..."
docker-compose up -d --build

# Wait for database
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 10

# Run migrations and seed
echo "🗄️ Ejecutando migraciones de base de datos..."
docker-compose exec -T backend npx prisma migrate deploy

echo "🌱 Poblado de datos iniciales (Seed)..."
docker-compose exec -T backend npx prisma db seed

echo "✅ ¡Instalación completada!"
echo "🌐 La aplicación está disponible en el puerto configurado (ej. http://localhost o el dominio mapeado)."
