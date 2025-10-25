# Component Usage Guide

Esta documentação descreve como usar os componentes novos criados na **PHASE 2**.

## 🎯 Toast Component

Componente para exibir notificações temporárias com diferentes tipos (success, error, warning, info).

### Basic Usage

```tsx
import { Toast } from '@/components/Toast'

export const MyComponent = () => {
  return (
    <Toast
      message="Operação realizada com sucesso!"
      type="success"
      duration={4000}
      isOpen={true}
    />
  )
}
```

### Com Hook useToast (Recomendado)

```tsx
import { useToast, ToastContainer } from '@/components/Toast'

export const MyApp = () => {
  const { toasts, showSuccess, showError, removeToast } = useToast()

  const handleAction = async () => {
    try {
      // Fazer algo
      showSuccess('Sucesso na operação!')
    } catch (error) {
      showError('Erro ao processar')
    }
  }

  return (
    <>
      <button onClick={handleAction}>Clique aqui</button>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
```

### API

```tsx
interface ToastProps {
  message: string          // Texto da notificação
  type?: ToastType         // 'success' | 'error' | 'warning' | 'info'
  duration?: number        // Tempo em ms (padrão: 4000)
  onClose?: () => void     // Callback ao fechar
  isOpen?: boolean         // Controla visibilidade (padrão: true)
}
```

### Hook useToast

```tsx
const {
  toasts,              // Array de toasts ativos
  addToast,            // (message, type, duration) => void
  removeToast,         // (id) => void
  showSuccess,         // (message, duration?) => void
  showError,           // (message, duration?) => void
  showWarning,         // (message, duration?) => void
  showInfo,            // (message, duration?) => void
} = useToast()
```

---

## 📭 EmptyState Component

Componente para exibir estado vazio com ícone, título, descrição e ação.

### Basic Usage

```tsx
import { EmptyState } from '@/components/EmptyState'

export const TripsList = ({ trips }) => {
  if (trips.length === 0) {
    return (
      <EmptyState
        title="Nenhuma viagem encontrada"
        description="Comece criando uma nova viagem para explorar o mundo"
        action={{
          label: 'Criar Viagem',
          onClick: () => navigate('/create-trip'),
        }}
      />
    )
  }

  return <div>{/* render trips */}</div>
}
```

### Com Ícone Customizado

```tsx
import { EmptyState } from '@/components/EmptyState'

const customIcon = (
  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
    {/* SVG content */}
  </svg>
)

export const MyComponent = () => {
  return (
    <EmptyState
      icon={customIcon}
      title="Oops! Nada aqui"
      description="Tente novamente ou volte mais tarde"
    />
  )
}
```

### API

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode  // Ícone customizado (padrão: ícone genérico)
  title: string           // Título obrigatório
  description?: string    // Descrição opcional
  action?: {              // Botão de ação opcional
    label: string
    onClick: () => void
  }
  className?: string      // Classes customizadas
}
```

---

## ⏳ Skeleton Component

Componentes para exibir placeholders enquanto dados estão carregando.

### Skeleton Base

```tsx
import { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonList } from '@/components/Skeleton'

// Linha simples
<Skeleton height="h-4" className="w-1/2" />

// Múltiplas linhas
<Skeleton count={3} height="h-4" />

// Texto com múltiplas linhas
<SkeletonText lines={4} />
```

### SkeletonCard

```tsx
import { SkeletonCard } from '@/components/Skeleton'

export const TripsLoading = () => {
  return (
    <div className="grid gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}
```

### SkeletonAvatar

```tsx
import { SkeletonAvatar } from '@/components/Skeleton'

<SkeletonAvatar size="sm" />   {/* w-8 h-8 */}
<SkeletonAvatar size="md" />   {/* w-12 h-12 */}
<SkeletonAvatar size="lg" />   {/* w-16 h-16 */}
```

### SkeletonList

```tsx
import { SkeletonList } from '@/components/Skeleton'

export const UsersList = ({ isLoading, users }) => {
  if (isLoading) {
    return <SkeletonList count={5} />
  }

  return <div>{/* render users */}</div>
}
```

### Exemplo Completo de Loading

```tsx
import { SkeletonCard, SkeletonText } from '@/components/Skeleton'

export const TripsPage = () => {
  const [trips, setTrips] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTrips()
      .then(setTrips)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (trips.length === 0) {
    return <EmptyState title="Sem viagens" />
  }

  return (
    <div className="grid gap-4">
      {trips.map((trip) => (
        <Card key={trip.id}>{/* trip content */}</Card>
      ))}
    </div>
  )
}
```

### API

```tsx
// Skeleton Base
interface SkeletonProps {
  className?: string
  count?: number        // Quantas linhas (padrão: 1)
  height?: string       // Altura (padrão: 'h-4')
}

// SkeletonText
interface SkeletonTextProps {
  lines?: number        // Número de linhas (padrão: 3)
  className?: string
}

// SkeletonAvatar
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg'
}

// SkeletonList
interface SkeletonListProps {
  count?: number        // Número de items (padrão: 5)
  className?: string
}
```

---

## 📊 Design Consistency

Todos os novos componentes seguem o design system estabelecido:

- **Colors**: Utilizam as cores do Tailwind (#6366F1 Indigo primária)
- **Typography**: Seguem a hierarquia H1-H4 com body, small, caption
- **Spacing**: Utilizam escala padrão (gap-2, p-4, etc)
- **Shadows**: Utilizam shadow-lg, shadow-md do design system
- **Animations**: Utilizam fade-in, slide-up do design system
- **Dark Mode**: Todos suportam dark mode nativo

---

## 🚀 Próximos Passos (PHASE 3)

Os componentes novos serão integrados nas telas:

1. **LoginScreen**: Usar Toast para feedback de login
2. **HomeScreen**: Usar EmptyState para trips vazias, SkeletonList para carregamento
3. **CreateTripScreen**: Usar Toast para sucesso/erro
4. **TripDetailScreen**: Usar Toast para ações, SkeletonCard para loading

