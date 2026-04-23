import { cn } from '@/lib/utils'

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
}

export function Main({ fixed, className, ...props }: MainProps) {
  return (
    <main
      className={cn(
        // flex-1: Ocupa todo el espacio disponible
        // min-w-0: CLAVE para que el flex-item no desborde al padre con tablas anchas
        // w-full: Asegura que rellene el ancho del SidebarInset
        'relative flex flex-1 flex-col w-full min-w-0 focus:outline-none',
        
        // Si es 'fixed', ocupará el alto de la pantalla sin scroll general
        fixed && 'h-svh overflow-hidden',
        
        className
      )}
      {...props}
    />
  )
}