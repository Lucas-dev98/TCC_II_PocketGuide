#!/bin/bash

# Script para verificar status do Firestore após configuração

echo "🔍 Verificando Firestore Setup..."
echo ""

# Função para testar API
test_firestore_api() {
    local project_id="pocketguide-bf350"
    
    echo "📡 Testando conexão com Firestore..."
    
    # Tentar acessar Firestore (sem autenticação, será bloqueado se regras estiverem OK)
    response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        "https://firestore.googleapis.com/v1/projects/${project_id}/databases/(default)/documents:beginTransaction" \
        -H "Content-Type: application/json" \
        -d '{}')
    
    http_code=$(echo "$response" | tail -1)
    
    echo "Status HTTP: $http_code"
    
    if [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
        echo "✅ Firestore está bloqueando requisições não autenticadas (esperado)"
    elif [ "$http_code" = "200" ]; then
        echo "⚠️  Firestore permitiu requisição sem autenticação (inseguro?)"
    else
        echo "❓ Status inesperado"
    fi
}

# Função para listar links úteis
show_links() {
    echo ""
    echo "📚 Links Importantes:"
    echo ""
    echo "1. Firebase Console (Rules):"
    echo "   https://console.firebase.google.com/project/pocketguide-bf350/firestore/rules"
    echo ""
    echo "2. Firestore Database:"
    echo "   https://console.firebase.google.com/project/pocketguide-bf350/firestore/data"
    echo ""
    echo "3. Aplicação Web:"
    echo "   http://localhost:8081"
    echo ""
}

# Função para checklist
show_checklist() {
    echo ""
    echo "📋 Checklist de Tarefas:"
    echo ""
    echo "[ ] 1. Acessar Firebase Console (Rules)"
    echo "[ ] 2. Copiar regra de desenvolvimento"
    echo "[ ] 3. Publicar regras"
    echo "[ ] 4. Aguardar 1-2 minutos"
    echo "[ ] 5. Recarregar http://localhost:8081"
    echo "[ ] 6. Testar Google Sign-In"
    echo "[ ] 7. Verificar documento em /users/"
    echo ""
}

# Executar
echo "📊 Informações do Projeto:"
echo "- Projeto: pocketguide-bf350"
echo "- Web: http://localhost:8081"
echo ""

# Testar se web está rodando
if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "✅ Web server respondendo"
else
    echo "❌ Web server NÃO está respondendo"
    echo "   Execute: npm run web"
fi

echo ""

# Mostrar informações
test_firestore_api
show_links
show_checklist

echo "⚡ Dica: Após atualizar as regras, monitore o console com:"
echo "   npm run web (e abra F12 → Console)"
echo ""
echo "🚀 Pronto para começar!"
