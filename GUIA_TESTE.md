# 🧪 Guia de Teste - Pocket Guide MVP

## Pré-requisitos

✅ npm install já executado
✅ TypeScript compilation sem erros
✅ .env configurado com credenciais reais

## 🚀 Iniciando Testes

### Passo 1: Iniciar o Servidor Expo

```bash
cd /home/lucasbastos/TCC/TCC_II_POCKET_GUIDE
npm start
```

Você verá:
```
 ✔ Metro server started
 ├─ To test your app in a web browser, open: exp://...
 ├─ To open your app on iOS, press 'i'
 ├─ To open your app on Android, press 'a'
 └─ Press '?' for help
```

### Passo 2: Escolher Plataforma de Teste

#### Opção A: Android Emulator
```bash
npm run android
```
- Abre Android emulator automaticamente
- App instala e carrega em segundos

#### Opção B: iOS Simulator (Mac)
```bash
npm run ios
```
- Abre iOS simulator
- Requer macOS

#### Opção C: Web (Qualquer OS)
```bash
npm run web
```
- Abre em localhost:19006
- Requer react-native-web

### Passo 3: Testar Fluxo Principal

#### 1️⃣ Tela de Login
```
Esperado:
- Logo/Header do Pocket Guide
- Botão "Sign in with Google"
- Input campo vazios inicialmente

Ações:
- Clicar "Sign in with Google"
- Selecionar conta Google
- Deve redirecionar para OnboardingQuiz
```

#### 2️⃣ Tela de Onboarding Quiz
```
Esperado:
- 3 perguntas:
  1. What are your interests? (gastronomia, natureza, etc)
  2. What's your travel pace? (rápido, médio, lento)
  3. Who are you traveling with? (casal, família, solo, grupo)
- Botão "Next" desabilitado inicialmente
- Loading spinner quando enviando

Ações:
- Selecionar opções em cada pergunta
- Clicar "Next"
- Deve salvar preferências no Firebase
- Redirecionar para HomeScreen
```

#### 3️⃣ Tela Home
```
Esperado:
- Mensagem de boas-vindas com nome do usuário
- Lista de viagens (vazia inicialmente)
- FAB (Floating Action Button) para nova viagem
- Menu/Perfil no topo

Ações:
- Clicar FAB
- Deve abrir CreateTripScreen
```

#### 4️⃣ Tela de Criar Viagem
```
Esperado:
- Campo de Destinação (autocomplete)
- Seletor de Data Início
- Seletor de Data Fim
- Botão "Generate Itinerary"
- Loading state

Ações:
- Digitar destinação (ex: "Paris")
- Selecionar data início (ex: 2025-01-01)
- Selecionar data fim (ex: 2025-01-07)
- Clicar "Generate Itinerary"
- API Gemini é chamada
- Deve mostrar progressbar de loading
```

#### 5️⃣ Tela de Itinerário (TripDetailScreen)
```
Esperado:
- Nome da viagem (ex: "Trip to Paris")
- Data início e fim
- Seletor de dias (Dia 1, Dia 2, ...)
- Lista de atrações do dia
- Cards de atração com:
  - Nome da atração
  - Horário
  - Descrição
  - Localização
- Botão para ver mapa
- Drag handle para reordenar

Ações:
- Navegar entre dias com seletores
- Clicar em atração para detalhes
- Clicar "View Map" para ir ao mapa
```

#### 6️⃣ Tela de Mapa (MapDayScreen)
```
Esperado:
- Mapa interativo com pins
- Cada pin representa uma atração
- Rota conectando as atrações
- Info windows com detalhes
- Botão "Directions" para navegação

Ações:
- Explorar mapa
- Clicar em pins
- Clicar "Directions" (abre Google Maps)
```

## 🔍 Testes de Cenários

### Cenário 1: Primeiro Acesso
```
1. App abre → Login Screen
2. Fazer Google Sign-In
3. Novo usuário → vai para Onboarding
4. Completar Quiz
5. Vai para Home (sem viagens)
```

### Cenário 2: Criar Viagem
```
1. Clicar FAB na Home
2. Preencher formulário de criação
3. Clicar Generate
4. Aguardar IA gerar atrações
5. Ver itinerário criado
```

### Cenário 3: Editar Itinerário
```
1. Clicar em viagem existente
2. Navegar entre dias
3. Reordenar atrações (drag & drop)
4. Atrações devem sincronizar com Firebase
```

### Cenário 4: Offline
```
1. Criar viagem online
2. Desabilitar internet (airplane mode)
3. App ainda funciona (dados em cache)
4. Fazer edições
5. Ligar internet novamente
6. Dados sincronizam com Firebase
```

### Cenário 5: Logout
```
1. Clicar menu/perfil
2. Clicar "Logout"
3. Voltar para LoginScreen
4. Dados locais ainda existem quando faz login novamente
```

## ✅ Checklist de Testes

### Login Flow
- [ ] Google Sign-In abre popup corretamente
- [ ] Redirect para Onboarding após login
- [ ] Usuario criado no Firestore

### Onboarding Quiz
- [ ] 3 perguntas aparecem
- [ ] Seleções são salvas
- [ ] Next button só ativa quando selecionado
- [ ] Redirect para Home após completar
- [ ] Dados salvos no Firestore

### Trip Creation
- [ ] Autocomplete funciona para destinações
- [ ] Date picker abre e seleciona datas
- [ ] Validação de datas (fim > início)
- [ ] Gemini API é chamada
- [ ] Atrações aparecem no itinerário

### Trip Display
- [ ] Todas as atrações aparecem
- [ ] Seletor de dias funciona
- [ ] Informações de atração são precisas
- [ ] Mapa carrega corretamente

### Persistence
- [ ] Dados existem após fecha app
- [ ] Sincronização com Firebase
- [ ] Offline mode funciona
- [ ] Não perdem dados sem internet

### UI/UX
- [ ] Loading spinners aparecem
- [ ] Sem erros na console
- [ ] Sem warnings TypeScript
- [ ] Responsividade em diferentes tamanhos

## 🐛 Solução de Problemas

### App não inicia
```
Solução:
1. npm install novamente
2. npm start -c (limpar cache)
3. Fechar emulator e reabrir
```

### Google Sign-In não funciona
```
Verificar:
1. EXPO_PUBLIC_GOOGLE_*_CLIENT_ID estão corretos
2. Google Console está habilitado
3. OAuth consent screen configurada
```

### API Gemini retorna erro
```
Verificar:
1. EXPO_PUBLIC_GEMINI_API_KEY é válido
2. API está habilitada no Google Cloud
3. Limite de requisições não foi excedido
```

### Firebase não sincroniza
```
Verificar:
1. Firebase credentials no .env
2. Firestore security rules estão ok
3. Internet está conectada
4. Console do Firebase sem erros
```

### Mapa não aparece
```
Verificar:
1. EXPO_PUBLIC_GOOGLE_MAPS_API_KEY é válido
2. Google Maps API está habilitada
3. Regiões geográficas são válidas
```

## 📊 Métricas de Teste

Após testes completos, verificar:

| Métrica | Esperado | Status |
|---------|----------|--------|
| Time to Login | < 3s | ⏳ |
| Time to Onboarding | < 2s | ⏳ |
| Time to Generate | < 10s | ⏳ |
| Time to Map Display | < 2s | ⏳ |
| Offline Functionality | 100% | ⏳ |
| Type Errors | 0 | ⏳ |
| Runtime Errors | 0 | ⏳ |

## 📝 Relatório de Teste

Após concluir todos os testes, anotar:

```markdown
# Teste Executado em: [DATA]
# Plataforma: [iOS/Android/Web]
# Resultado: [PASSOU/FALHOU]

## Testes Realizados
- [ ] Login Flow
- [ ] Onboarding Quiz
- [ ] Trip Creation
- [ ] Itinerary View
- [ ] Map Display
- [ ] Offline Mode
- [ ] Sync Check

## Bugs Encontrados
(listar qualquer problema)

## Observações
(feedback geral)
```

## 🎯 Conclusão

Se todos os checklist items passarem:
✅ **MVP está pronto para produção**

Se houver falhas:
⚠️ **Verificar logs e corrigir antes de publicar**

---

*Guia de teste versão 1.0*
*Atualizado em: 21/10/2024*
