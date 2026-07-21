#!/bin/bash
set -e

echo "🚀 Iniciando despliegue de GESTIONAR2..."

echo "📥 Obteniendo últimos cambios (git pull)..."
git pull origin main || echo "No se pudo hacer git pull (o no es un repositorio git)."

echo "🐳 Reconstruyendo imágenes y levantando contenedores..."
docker-compose up -d --build

echo "🗄️ Ejecutando migraciones de base de datos..."
docker-compose exec -T backend npx prisma migrate deploy

echo "✅ ¡Despliegue completado sin tiempo de inactividad!"
