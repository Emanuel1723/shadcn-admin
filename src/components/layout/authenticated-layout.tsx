import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'

  return (
    <SearchProvider>
      <LayoutProvider>
        {/* IMPORTANTE: SidebarProvider ya es un contenedor flex. 
           No le agregues 'w-full' manualmente si usas la variante 'inset'.
        */}
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          
          <AppSidebar />
          
          <SidebarInset
            className={cn(
              // flex-1 permite que el contenido ocupe todo el espacio restante.
              // min-w-0 es VITAL para que las tablas con scroll no rompan el layout.
              'relative flex min-h-svh flex-1 flex-col bg-background min-w-0',
              '@container/content'
            )}
          >
            {/* Renderiza la página. Asegúrate de que en 'ColaboradoresPage' 
                NO estés llamando a AuthenticatedLayout otra vez.
            */}
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}