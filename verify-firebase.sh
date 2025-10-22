#!/bin/bash
# Verify Firebase credentials

echo "🔍 Verificando credenciais do Firebase..."
echo ""

# Check .env file
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

echo "📄 Valores carregados do .env:"
echo ""

API_KEY=$(grep "EXPO_PUBLIC_FIREBASE_API_KEY=" .env | cut -d'=' -f2)
AUTH_DOMAIN=$(grep "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=" .env | cut -d'=' -f2)
PROJECT_ID=$(grep "EXPO_PUBLIC_FIREBASE_PROJECT_ID=" .env | cut -d'=' -f2)
STORAGE_BUCKET=$(grep "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=" .env | cut -d'=' -f2)
SENDER_ID=$(grep "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=" .env | cut -d'=' -f2)
APP_ID=$(grep "EXPO_PUBLIC_FIREBASE_APP_ID=" .env | cut -d'=' -f2)

echo "API_KEY: ${API_KEY:0:20}... (${#API_KEY} chars)"
echo "AUTH_DOMAIN: $AUTH_DOMAIN"
echo "PROJECT_ID: $PROJECT_ID"
echo "STORAGE_BUCKET: $STORAGE_BUCKET"
echo "SENDER_ID: $SENDER_ID"
echo "APP_ID: $APP_ID"

echo ""
echo "⚠️  Verifique se a API_KEY é válida (não é um placeholder)"
echo ""
echo "Se a API_KEY começar com 'AIzaSy' e tiver ~39 caracteres, provavelmente é válida."
echo ""
echo "Para obter credenciais reais:"
echo "1. Acesse: https://console.firebase.google.com/"
echo "2. Selecione projeto: pocketguide-bf350"
echo "3. Vá para ⚙️ Configurações do Projeto → Apps"
echo "4. Copie o SDK config completo"
echo "5. Atualize este arquivo .env"
