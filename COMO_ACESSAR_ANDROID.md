# 📱 Como Acessar o Pocket Guide no Android

## ✅ Opção 1: Expo Go (Mais Fácil - Recomendado)

### **Passo 1: Abrir Expo Go no Emulador**
1. No emulador Android, procure pelo app **"Expo Go"**
2. Se não tiver, instale: https://play.google.com/store/apps/details?id=host.exp.exponent

### **Passo 2: Escanear QR Code**
1. Abra Expo Go
2. Clique no ícone **"Escanear QR code"** (câmera)
3. Aponte para a tela do seu computador onde está o QR code
4. **Ou copie manualmente:**

```
URL: exp://seu-ip:8082
```

Exemplo: `exp://192.168.0.100:8082`

### **Passo 3: App Carrega**
- Espere 3-5 segundos
- App carrega automaticamente
- Pronto! 🎉

---

## 📍 Encontrar seu IP

No terminal:

```bash
# Linux/Mac
ifconfig | grep "inet "

# Exemplo de saída:
# inet 192.168.0.100  netmask 0xffffff00
```

Seu IP é: `192.168.0.100` (ou similar)

---

## ✅ Opção 2: Android Studio (Sem Expo Go)

Se quiser build nativo:

```bash
# 1. Instalar Android SDK
brew install android-sdk  # macOS
# ou baixar em: https://developer.android.com/studio

# 2. Configurar ANDROID_HOME
export ANDROID_HOME=~/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 3. Rodar build nativo
npm run android
```

---

## 🚀 Atalhos no Expo Go

Depois que app carregar:

| Comando | Ação |
|---------|------|
| `r` | Recarregar app |
| `m` | Abrir menu |
| `d` | Abrir debugger |

---

## 🔧 Se Não Funcionar

### **Erro: "Cannot connect"**
- ✅ Verifique se estão na mesma rede WiFi
- ✅ Copie o URL manualmente: `exp://192.168.0.100:8082`

### **Erro: "Connection timeout"**
- ✅ Reinicie Expo: Ctrl+C e `npm start`
- ✅ Feche e reabra Expo Go

### **Erro: "Module not found"**
- ✅ Rode: `npm install`
- ✅ Limpe cache: `npm start -- --clear`

---

## 📊 Status Atual

```
✅ Expo rodando na porta 8082
✅ QR code disponível
✅ Pronto para Expo Go
❌ Android SDK não instalado (pode usar Expo Go)
```

---

## 🎯 Próximo Passo

1. **Pegue o IP** da máquina (`192.168.x.x`)
2. **Abra Expo Go** no emulador
3. **Cole a URL**: `exp://SEU-IP:8082`
4. **Pronto! App carrega em 3 segundos** 🚀

---

**Qual é o seu IP? Vou gerar um link único para você!**
