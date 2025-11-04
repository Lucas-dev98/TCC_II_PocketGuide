# 🎨 Mockups Visuais - Opções de Busca

## OPÇÃO 1: Ordenação + Ícones

```
┌─────────────────────────────────────┐
│ 🔍 Buscar cidade...             ↓ │
├─────────────────────────────────────┤
│                                     │
│  ⏳ Carregando...                    │
│                                     │
└─────────────────────────────────────┘

Usuário digita: "lis"

┌─────────────────────────────────────┐
│ 🔍 lis                          ↓ │
├─────────────────────────────────────┤
│                                     │
│  🏙️ Lisboa                         │
│     Portugal                      →│
│                                     │
│  🇵🇹 Portugal                       │
│     País                          →│
│                                     │
│  🏖️ Algarve                        │
│     Portugal                      →│
│                                     │
│  📍 "Nenhuma outra opção"          │
│                                     │
└─────────────────────────────────────┘
```

---

## OPÇÃO 2: Agrupamento por Tipo

```
┌─────────────────────────────────────┐
│ 🔍 Buscar cidade...             ↓ │
├─────────────────────────────────────┤
│                                     │
│  🌍 PAÍSES                         │
│  ─────────────────────────────────  │
│  Portugal                         →│
│  Brasil                           →│
│                                     │
│  🏙️ CIDADES PRINCIPAIS             │
│  ─────────────────────────────────  │
│  Lisboa, Portugal                 →│
│  Porto, Portugal                  →│
│  Rio de Janeiro, Brasil           →│
│                                     │
│  🏖️ DESTINOS POPULARES             │
│  ─────────────────────────────────  │
│  Algarve, Portugal                →│
│  Bahia, Brasil                    →│
│                                     │
└─────────────────────────────────────┘
```

---

## OPÇÃO 3: Inteligência (Detecta o que procura)

### Cenário 1: Digita "Portugal" (País)
```
┌─────────────────────────────────────┐
│ 🔍 Portugal                     ↓ │
├─────────────────────────────────────┤
│                                     │
│  ⭐ DESTINO: Portugal              │
│     🌍 País • 10.3M hab.          →│
│                                     │
│  🏙️ PRINCIPAIS CIDADES             │
│     Lisboa • Porto • Braga         │
│                                     │
│  🏖️ DESTINOS POPULARES             │
│     Algarve • Madeira • Cascais   │
│                                     │
└─────────────────────────────────────┘
```

### Cenário 2: Digita "Lisboa" (Cidade)
```
┌─────────────────────────────────────┐
│ 🔍 Lisboa                       ↓ │
├─────────────────────────────────────┤
│                                     │
│  ⭐ DESTINO: Lisboa                │
│     🏙️ Cidade • 505k hab.         →│
│     Portugal • Europa              │
│                                     │
│  📍 REGIÃO: Área Metropolitana     │
│     Sintra • Cascais • Almada     │
│                                     │
│  🌍 PAÍS: Portugal                 │
│     Ver opções nacionais          →│
│                                     │
└─────────────────────────────────────┘
```

### Cenário 3: Digita "Algarve" (Região)
```
┌─────────────────────────────────────┐
│ 🔍 Algarve                      ↓ │
├─────────────────────────────────────┤
│                                     │
│  ⭐ DESTINO: Algarve               │
│     🏖️ Região • Praias famosas    →│
│     Portugal • Sudoeste            │
│                                     │
│  🏙️ CIDADES NA REGIÃO              │
│     Lagos • Portimão • Faro       │
│                                     │
│  🌊 PRAIAS POPULARES               │
│     Meia Praia • Benagil • Vau   │
│                                     │
└─────────────────────────────────────┘
```

---

## OPÇÃO 4: Filtros (Google Maps Style)

```
┌─────────────────────────────────────┐
│ 🔍 Buscar                           │
├─────────────────────────────────────┤
│                                     │
│  Tipo: [Cidades ▼] País: [Todos ▼] │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🏙️ CIDADES ENCONTRADAS       │  │
│  ├───────────────────────────────┤  │
│  │ Lisboa, Portugal             →│  │
│  │ Porto, Portugal              →│  │
│  │ Braga, Portugal              →│  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘

Mudando filtros:
Tipo: [Praias ▼] País: [Todos ▼]

┌───────────────────────────────────────┐
│  Algarve, Portugal                  →│
│  Madeira, Portugal                  →│
│  Peniche, Portugal                  →│
│  Copacabana, Brasil                 →│
└───────────────────────────────────────┘
```

---

## OPÇÃO 5: Context (Informações Adicionais)

```
┌─────────────────────────────────────┐
│ 🔍 Buscar cidade...             ↓ │
├─────────────────────────────────────┤
│                                     │
│  Lisboa, Portugal 🇵🇹               │
│  505,526 hab. • Capital • Europa  →│
│                                     │
│  Porto, Portugal 🇵🇹                │
│  1.7M metro • 2ª maior • Norte    →│
│                                     │
│  Braga, Portugal 🇵🇹                │
│  195k hab. • Histórica • Cultura  →│
│                                     │
│  Portugal (País) 🇵🇹                │
│  10.3M hab. • Europa • Península   →│
│                                     │
└─────────────────────────────────────┘
```

---

## OPÇÃO COMBO: 1️⃣ + 2️⃣ (O Melhor!)

```
┌─────────────────────────────────────┐
│ 🔍 portugal                     ↓ │
├─────────────────────────────────────┤
│                                     │
│  🌍 PAÍS                            │
│  ─────────────────────────────────  │
│  🇵🇹 Portugal                       │
│     10.3M habitantes              →│
│                                     │
│  🏙️ CIDADES PRINCIPAIS             │
│  ─────────────────────────────────  │
│  Lisboa 505k hab.                 →│
│  Porto 1.7M metro                 →│
│  Braga 195k hab.                  →│
│                                     │
│  🏖️ DESTINOS POPULARES             │
│  ─────────────────────────────────  │
│  Algarve                          →│
│  Madeira                          →│
│  Açores                           →│
│                                     │
│  🏛️ PATRIMÔNIO/CULTURA             │
│  ─────────────────────────────────  │
│  Sintra                           →│
│  Évora                            →│
│  Cascais                          →│
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 Versão Mobile (Todas as Opções)

```
Opção 1 - Simples:
┌───────────────────┐
│ 🔍 Lisboa     ↓ │
├───────────────────┤
│ 🏙️ Lisboa        │
│    Portugal     →│
│ 🇵🇹 Portugal      │
│    País        →│
│ 🏖️ Algarve       │
│    Portugal    →│
└───────────────────┘

Opção 2 - Agrupado:
┌───────────────────┐
│ 🔍 Portugal   ↓ │
├───────────────────┤
│ 🌍 PAÍS          │
│ ─────────────────│
│ Portugal        →│
│                 │
│ 🏙️ CIDADES      │
│ ─────────────────│
│ Lisboa         →│
│ Porto          →│
│ Braga          →│
│                 │
│ 🏖️ PRAIAS       │
│ ─────────────────│
│ Algarve        →│
│ Madeira        →│
└───────────────────┘
```

---

## 🎯 Qual é Melhor?

| Opção | Desktop | Mobile | Simples | Claro |
|-------|---------|--------|---------|-------|
| 1️⃣ Ordenação | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 2️⃣ Agrupamento | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 3️⃣ Inteligência | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| 4️⃣ Filtros | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| 5️⃣ Context | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

🏆 **Recomendação**: Opção 1️⃣ + 2️⃣ (Combo!)

