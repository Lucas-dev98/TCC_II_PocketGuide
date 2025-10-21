# 🎯 INSTRUÇÕES PARA TESTAR NO ANDROID - RESUMIDO

## ✅ STATUS ATUAL
- ✅ Expo Server está rodando em background
- ✅ Metro Bundler compilou o app
- ✅ Pronto para conectar!

## 📱 COMO FAZER FUNCIONAR (3 PASSOS)

### Passo 1: Abra o Expo Go no Android
- Abra o app **Expo Go** (já deve estar instalado no emulador)
- Se não tiver, baixe na Play Store

### Passo 2: Conecte ao Servidor
No **Expo Go**, escolha uma opção:

**Opção A - Escanear QR Code (MAIS FÁCIL):**
- Pressione o botão "Scan QR code"
- Escaneie o QR abaixo:

```
╔════════════════════════════════════════╗
║ PRESSIONE 's' NO TERMINAL ABAIXO PARA  ║
║ VER O QR CODE E COPIAR A URL           ║
╚════════════════════════════════════════╝
```

No terminal, pressione: **`s`** (mostra o QR code)

**Opção B - Copiar URL Manualmente:**
- Cole a URL `exp://localhost:8081` no Expo Go
- Ou abra o terminal e veja a URL real

### Passo 3: Aguarde o App Carregar
- O app deve aparecer em 30-60 segundos
- Se tiver erro, pressione **Ctrl+Z** no Expo Go para recarregar

## 🌐 ALTERNATIVA: TESTAR NO NAVEGADOR

Se não conseguir no Android, teste no navegador:

```bash
npm run web
```

Abrirá automaticamente: `http://localhost:8081`

## 📋 COMANDOS ÚTEIS

**Ver o QR code:**
```bash
# No terminal onde o Expo está rodando, pressione:
s
```

**Recarregar o app:**
```bash
# No terminal Expo, pressione:
r
```

**Abrir debugger:**
```bash
# No terminal Expo, pressione:
j
```

**Abrir web automaticamente:**
```bash
# No terminal Expo, pressione:
w
```

## ⚠️ SE DER ERRO

**"QR code inválido"**
- Certifique-se que smartphone/emulador está na mesma rede WiFi
- Tente copiar a URL manualmente

**"Erro de conexão"**
- Pressione `r` para recarregar
- Ou reinicie o Expo: `Ctrl+C` e `npm start`

**"Módulos não encontrados"**
- Rode: `npm install`
- Pressione `r` para recarregar

**"Blank screen"**
- Aguarde 30-60 segundos
- Pressione `r` para recarregar
- Verifique o console de erro: pressione `j`

## 🎯 RESUMO RÁPIDO

1. Abra **Expo Go** no Android
2. **Pressione `s`** no terminal (vê o QR)
3. **Escaneie** o QR code
4. **Pronto!** App está funcionando

---

**Precisa de ajuda?** Check terminal logs para ver erros em tempo real!

**Expo rodando em:** `http://localhost:8081` 🚀
