# 🌐 Como Acessar o Pocket Guide

## ✅ Opção 1: Web (No Navegador)

### **URL Direto:**
```
http://localhost:8081
```

Ou se acessar de outro computador:
```
http://192.168.1.68:8081
```

---

## ✅ Opção 2: Android (Expo Go)

### **URL para Expo Go:**
```
exp://192.168.1.68:8081
```

**Passos:**
1. Abra **Expo Go** no emulador Android
2. Clique em **"Escanear QR code"**
3. Aponte para a tela (ou copie a URL manualmente)
4. **Pronto!** App carrega em 3 segundos

---

## 📱 Status Atual

```
✅ Expo rodando na porta 8081
✅ IP: 192.168.1.68
✅ Web compilado com sucesso
✅ Pronto para acessar!
```

---

## 🔧 Se Não Carregar

1. **Verifique a porta:**
   ```bash
   lsof -i :8081
   ```

2. **Reinicie Expo:**
   ```bash
   npm start -- --clear
   ```

3. **Limpe cache:**
   ```bash
   rm -rf .expo .metro node_modules
   npm install
   npm start
   ```

---

**Acesse agora! 🚀**

- 🌐 Web: http://localhost:8081
- 📱 Android: exp://192.168.1.68:8081
