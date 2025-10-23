# 🎨 Guia de Implementação - Design System Premium

**Data**: 22 de outubro de 2025  
**Versão**: 1.0 - Fase 1-3 Completas  
**Status**: Pronto para Integração

---

## 📋 Resumo do que foi criado

### ✅ Fase 1: Design System Premium
- **src/theme/index.ts** (200+ linhas)
  - Paleta de cores consolidada (primary, secondary, semantic)
  - Tipografia em 8 níveis
  - Espaçamento base 4px/8px
  - Border radius presets
  - 5 níveis de shadows
  - Temas light e dark
  
### ✅ Fase 2: Componentes Base
- **src/components/Button.tsx** - 4 variants, 3 sizes, animações
- **src/components/Input.tsx** - Validação, error states, counter
- **src/components/Card.tsx** - Componentes compostos (Header/Body/Footer)
- **src/components/Badge.tsx** - 6 variantes, dot mode

### ✅ Fase 3: Sistema de Animações
- **src/animations/index.ts** - 8+ presets de animações
  - Fade In/Out, Slide Up/Down, Scale Fade
  - Rotate, Pulse, Bounce
  - Staggered List
  - Easing presets

### ✅ Tema Context
- **src/theme/ThemeContext.tsx** - Provider com persistência
  - `useTheme()` - Tema completo
  - `useThemeColors()` - Apenas cores
  - `useThemeSpacing()` - Apenas espaçamento
  - `useThemeTypography()` - Apenas tipografia
  - Auto detection + manual toggle

### 📖 Documentação
- **DESIGN_SYSTEM_SENIOR.md** - Plano completo (400+ linhas)
- **exemplo-screen-com-tema.tsx** - Exemplo prático

---

## 🚀 PRÓXIMOS PASSOS - Como Integrar

### PASSO 1: Envolver App em ThemeProvider

```typescript
// App.tsx
import { ThemeProvider } from './src/theme/ThemeContext';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  return (
    <ThemeProvider>
      <HomeScreen />
    </ThemeProvider>
  );
}
```

### PASSO 2: Usar Tema em Screens

```typescript
// src/screens/HomeScreen.tsx
import { useTheme, useThemeColors, useThemeSpacing } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const HomeScreen = () => {
  const { theme, isDark } = useTheme();
  const colors = useThemeColors();
  const spacing = useThemeSpacing();

  return (
    <View style={{ backgroundColor: colors.background, padding: spacing.lg }}>
      <Card elevation="md">
        <Card.Header>
          <Text>Bem-vindo</Text>
        </Card.Header>
        <Card.Body>
          <Button variant="primary" onPress={() => {}}>
            Começar
          </Button>
        </Card.Body>
      </Card>
    </View>
  );
};
```

### PASSO 3: Substituir TripCard, AttractionCard

```typescript
// ANTES
<TouchableOpacity style={{...}}>
  <Text>{trip.name}</Text>
</TouchableOpacity>

// DEPOIS
<Card elevation="md" onPress={onPress}>
  <Card.Body>
    <Text style={{ color: theme.colors.onSurface }}>{trip.name}</Text>
  </Card.Body>
</Card>
```

### PASSO 4: Adicionar Dark Mode Toggle

```typescript
// src/screens/SettingsScreen.tsx
export const SettingsScreen = () => {
  const { isDark, setMode } = useTheme();
  const theme = useTheme();

  return (
    <View>
      <Switch
        value={isDark}
        onValueChange={(value) => setMode(value ? 'dark' : 'light')}
      />
      <Text>Dark Mode: {isDark ? 'On' : 'Off'}</Text>
    </View>
  );
};
```

---

## 🎨 Como Usar Cada Componente

### Button

```typescript
// Primary button
<Button
  variant="primary"
  size="lg"
  onPress={() => {}}
  icon={<Text>✈️</Text>}
>
  Criar Viagem
</Button>

// Loading state
<Button
  variant="primary"
  loading={isLoading}
  disabled={!destination}
>
  Enviando...
</Button>

// Destructive
<Button
  variant="destructive"
  onPress={handleDelete}
>
  Deletar
</Button>
```

### Input

```typescript
<Input
  label="Destino"
  placeholder="Paris, Tokyo..."
  value={destination}
  onChangeText={setDestination}
  icon={<Text>🌍</Text>}
  hint="Digite um local válido"
  error={error}
  maxLength={100}
  showCounter
  state={loading ? 'loading' : error ? 'error' : 'default'}
/>
```

### Card

```typescript
// Simples
<Card elevation="md">
  <Card.Body>
    <Text>Conteúdo</Text>
  </Card.Body>
</Card>

// Com header e footer
<Card elevation="lg" onPress={() => {}}>
  <Card.Header>
    <Text>Título</Text>
  </Card.Header>
  <Card.Divider />
  <Card.Body>
    <Text>Conteúdo principal</Text>
  </Card.Body>
  <Card.Divider />
  <Card.Footer>
    <Button onPress={() => {}}>Ação</Button>
  </Card.Footer>
</Card>
```

### Badge

```typescript
// Texto
<Badge variant="success" label="Confirmado" />

// Com ícone
<Badge variant="warning" label="Pendente" icon={<Text>⚠️</Text>} />

// Dot
<Badge variant="error" dot />

// Sizes
<Badge variant="primary" size="sm" label="Pequeno" />
<Badge variant="primary" size="md" label="Médio" />
<Badge variant="primary" size="lg" label="Grande" />
```

---

## 🎬 Usando Animações

### Fade In

```typescript
import { createFadeInAnimation } from '../animations';

const MyComponent = () => {
  const { opacity, animate } = createFadeInAnimation(300);

  useEffect(() => {
    animate();
  }, []);

  return (
    <Animated.View style={{ opacity }}>
      <Text>Conteúdo</Text>
    </Animated.View>
  );
};
```

### Slide Up (Modal)

```typescript
const { translateY, opacity, animate } = createSlideUpAnimation(300);

useEffect(() => {
  animate();
}, []);

return (
  <Animated.View
    style={{
      transform: [{ translateY }],
      opacity,
    }}
  >
    <Modal />
  </Animated.View>
);
```

### Staggered List

```typescript
const { animations, animate } = createStaggeredListAnimation(items.length, 300);

useEffect(() => {
  animate();
}, []);

return items.map((item, index) => (
  <Animated.View
    key={index}
    style={{
      transform: [{ scale: animations[index].scale }],
      opacity: animations[index].opacity,
    }}
  >
    <ListItem {...item} />
  </Animated.View>
));
```

---

## 🌙 Dark Mode

### Auto Ativa (Recomendado)
```typescript
<ThemeProvider>
  {/* Detecta preferência do sistema automaticamente */}
</ThemeProvider>
```

### Manual Toggle
```typescript
const { isDark, setMode } = useTheme();

<Switch
  value={isDark}
  onValueChange={(value) => setMode(value ? 'dark' : 'light')}
/>

// Preferência salva em AsyncStorage automaticamente
```

### Check Em Runtime
```typescript
const { theme, isDark } = useTheme();

if (isDark) {
  // Fazer algo no dark mode
} else {
  // Fazer algo no light mode
}
```

---

## 📐 Usando Design Tokens

### Colors
```typescript
const { colors } = theme;

// Primary palette
colors.primary[50]  // Lightest
colors.primary[500] // Main
colors.primary[900] // Darkest

// Semantic
colors.success
colors.warning
colors.error

// Backgrounds
colors.background
colors.surface
```

### Typography
```typescript
const { typography } = theme;

const h1Style = {
  fontSize: typography.h1.fontSize,
  fontWeight: typography.h1.fontWeight,
  lineHeight: typography.h1.lineHeight,
};
```

### Spacing
```typescript
const { spacing } = theme;

// 4px base scale
spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 12px
spacing.lg    // 16px
spacing.xl    // 24px
spacing.xxl   // 32px
```

---

## ♿ Acessibilidade Integrada

Todos os componentes já vêm com:
- ✅ `accessible`, `accessibilityLabel`, `accessibilityHint`
- ✅ `accessibilityRole` apropriado (button, button, text)
- ✅ `accessibilityState` (disabled)
- ✅ Touch targets ≥ 48x48dp
- ✅ Contrast ratios ≥ 4.5:1

### Adicionar customizado:

```typescript
<Button
  accessible
  accessibilityLabel="Criar nova viagem"
  accessibilityHint="Abre formulário para criar uma viagem"
  onPress={handleCreate}
>
  Criar
</Button>
```

---

## 📊 Exemplo Completo - Refatorar LoginScreen

### ANTES (Sem design system)
```typescript
export const LoginScreen = () => {
  const [email, setEmail] = useState('');

  return (
    <View style={{ padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Login</Text>
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ 
          borderWidth: 1,
          padding: 12,
          marginVertical: 16,
          borderRadius: 8
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{ 
          backgroundColor: '#4A9EFF',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          Entrar
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

### DEPOIS (Com design system)
```typescript
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

export const LoginScreen = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✈️ Bem-vindo</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>
      </View>

      <Card elevation="md" style={styles.card}>
        <Card.Body>
          <Input
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            icon={<Text>📧</Text>}
            error={error}
            keyboardType="email-address"
          />

          <View style={styles.spacing} />

          <Button
            variant="primary"
            size="lg"
            onPress={handleLogin}
            loading={loading}
            disabled={!email}
          >
            Entrar
          </Button>
        </Card.Body>
      </Card>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
    },
    header: {
      marginBottom: theme.spacing.xxl,
    },
    title: {
      fontSize: theme.typography.h1.fontSize,
      fontWeight: '700',
      color: theme.colors.onBackground,
    },
    subtitle: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.neutral[600],
      marginTop: theme.spacing.sm,
    },
    card: {
      marginBottom: theme.spacing.lg,
    },
    spacing: {
      height: theme.spacing.md,
    },
  });
```

---

## ✅ Checklist de Migração

- [ ] Envolver App em `ThemeProvider`
- [ ] Atualizar `LoginScreen` com novos componentes
- [ ] Atualizar `HomeScreen` com novos componentes
- [ ] Refatorar `TripCard` → usar `Card`
- [ ] Refatorar `AttractionCard` → usar `Card`
- [ ] Adicionar Dark Mode toggle em Settings
- [ ] Testar dark mode em todos os screens
- [ ] Adicionar animações de transição
- [ ] Auditar acessibilidade
- [ ] Testar performance (60fps)

---

## 📈 Próximas Fases

| Fase | Descrição | Arquivos | Duração | Status |
|------|-----------|----------|---------|--------|
| 4 | Integração em App.tsx | App.tsx refatorado | 2h | ⏳ |
| 5 | Atualizar Screens | LoginScreen, HomeScreen, etc | 3h | ⏳ |
| 6 | Dark Mode em Screens | Testar todos screens | 2h | ⏳ |
| 7 | Animações | Transições, loading, etc | 3h | ⏳ |
| 8 | Responsive | Tablet/Web optimization | 3h | ⏳ |
| 9 | Acessibilidade | WCAG 2.1 AA audit | 2h | ⏳ |
| 10 | Performance | Lazy loading, code split | 2h | ⏳ |

---

## 🎯 Métricas de Sucesso

- ✅ Lighthouse score > 90
- ✅ Core Web Vitals green
- ✅ WCAG 2.1 AA compliance
- ✅ Dark mode em 100% dos screens
- ✅ Animações 60fps
- ✅ Loading < 2s
- ✅ Bundle size otimizado

---

## 📞 Referências Rápidas

### Cores Principais
```
Primary Blue: #4A9EFF
Secondary Orange: #FF8C42
Success Green: #10B981
Warning Amber: #F59E0B
Error Red: #EF4444
```

### Espaçamento
```
4px (xs)  → 8px (sm)  → 12px (md) → 16px (lg) → 24px (xl)
```

### Tipografia
```
Display: 48px, h1: 34px, h2: 28px, h3: 22px
Body: 16px (body1), 14px (body2), 12px (body3)
Label: 14px (label1), 12px (label2)
```

---

**Início da Integração**: Próximo passo  
**Documentação**: Completa  
**Exemplos**: Inclusos  
**Status**: 🚀 PRONTO PARA IMPLEMENTAR

Desenvolvido por: GitHub Copilot  
Data: 22 de outubro de 2025
