import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
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
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              'relative flex min-h-svh min-w-0 flex-1 flex-col bg-background',
              '@container/content'
            )}
          >
            {/* --- HEADER GLOBAL (Aquí vive el botón ahora) --- */}
            <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
              <SidebarTrigger className='-ml-1' />
              <Separator orientation='vertical' className='mr-2 h-4' />
              <div className='flex flex-col'>
                <h1 className='text-sm font-bold tracking-tight'>SICA-AILA</h1>
                <span className='text-[10px] font-bold tracking-widest text-blue-500 uppercase'>
                  Sistema de Inventario
                </span>
              </div>
            </header>

            {/* --- CONTENIDO DE LAS PÁGINAS --- */}
            <div className='flex flex-1 flex-col overflow-hidden'>
              {children ?? <Outlet />}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
