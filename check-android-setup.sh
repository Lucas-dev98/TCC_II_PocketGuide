#!/bin/bash
# Firebase Android Setup Helper

echo "🔍 Verificando setup Firebase para Android..."
echo ""

# Check app.json
if [ ! -f app.json ]; then
    echo "❌ app.json não encontrado!"
    exit 1
fi

PACKAGE_NAME=$(grep -o '"package": "[^"]*' app.json | cut -d'"' -f4)
echo "✅ Package name encontrado: $PACKAGE_NAME"
echo ""

# Check google-services.json
echo "📦 Procurando google-services.json..."

if [ -f android/app/google-services.json ]; then
    echo "✅ Encontrado em: android/app/google-services.json"
    echo "   Tamanho: $(wc -c < android/app/google-services.json) bytes"
elif [ -f android/google-services.json ]; then
    echo "⚠️  Encontrado em: android/google-services.json"
    echo "   Deveria estar em: android/app/google-services.json"
    echo "   Execute: mv android/google-services.json android/app/"
else
    echo "❌ google-services.json NÃO ENCONTRADO"
    echo "   Baixe do Firebase Console em:"
    echo "   https://console.firebase.google.com/project/pocketguide-bf350"
    echo ""
    echo "   Passos:"
    echo "   1. Firebase Console → Android app"
    echo "   2. Configurações → Baixar google-services.json"
    echo "   3. Salvar em: android/app/google-services.json"
fi

echo ""
echo "🔑 Verificando SHA-1 do debug.keystore..."
echo ""

if [ -f ~/.android/debug.keystore ]; then
    SHA1=$(keytool -list -v -keystore ~/.android/debug.keystore \
        -alias androiddebugkey \
        -storepass android \
        -keypass android 2>/dev/null | grep "SHA1:" | head -1 | cut -d' ' -f3)
    
    if [ -n "$SHA1" ]; then
        echo "✅ SHA-1 encontrado:"
        echo "   $SHA1"
        echo ""
        echo "📋 Registre no Firebase Console:"
        echo "   1. Firebase Console → Android app → Configuração"
        echo "   2. Impressão digital do certificado SHA-1"
        echo "   3. Clique em 'Adicionar impressão digital'"
        echo "   4. Cole: $SHA1"
        echo "   5. Salvar"
    else
        echo "❌ Não consegui obter SHA-1"
    fi
else
    echo "❌ debug.keystore não encontrado em ~/.android/"
    echo "   Será criado automaticamente no primeiro build do Android"
fi

echo ""
echo "📋 Checklist:"
echo "  [ ] app.json: Package name = $PACKAGE_NAME"
echo "  [ ] google-services.json em android/app/"
echo "  [ ] SHA-1 registrado no Firebase"
echo "  [ ] Google Sign-In habilitado em Autenticação"
echo "  [ ] API Key válida em .env"
echo ""
echo "🚀 Próximo passo: npm run android"
