#!/bin/bash

# OpenDoc UI Setup - Story 2.6
# This script installs the 17 core shadcn/ui components safely on your machine.

echo "📦 Baixando primitivas do shadcn/ui..."

cd "$(dirname "$0")" || exit

# Using -y flags to bypass prompts seamlessly ensuring raw component overrides if necessary.
npx -y shadcn@latest add sidebar command card table progress badge sonner dialog tabs resizable scroll-area switch input textarea checkbox skeleton -y

echo "🔧 Instalando dependência extra de Data Table..."
npm install @tanstack/react-table

echo "✅ Componentes do Dashboard prontos!"
