import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

// Importamos la navegación centralizada
import { topNav } from '@/components/layout/nav-links'

export function Dashboard() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} className='me-auto' />
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      {/* ===== Main ===== */}
      <Main className='pt-10 px-10'>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard Inventario IT</h1>
          <div className='flex items-center space-x-2'>
            <Button>Descargar Reporte</Button>
          </div>
        </div>

        <Tabs orientation='vertical' defaultValue='overview' className='space-y-4'>
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Resumen</TabsTrigger>
              <TabsTrigger value='analytics'>Analíticas</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {/* Equipos Totales */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Equipos Totales</CardTitle>
                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'
                    fill='none' stroke='currentColor' strokeLinecap='round'
                    strokeLinejoin='round' strokeWidth='2'
                    className='h-4 w-4 text-muted-foreground'>
                    <rect width='8' height='8' x='14' y='14' rx='2' />
                    <path d='M20 7h-9m3 3H5m16-6H3' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>4</div>
                  <p className='text-xs text-muted-foreground'>
                    Activos registrados en AILA
                  </p>
                </CardContent>
              </Card>

              {/* Laptops */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Laptops</CardTitle>
                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'
                    fill='none' stroke='currentColor' strokeLinecap='round'
                    strokeLinejoin='round' strokeWidth='2'
                    className='h-4 w-4 text-muted-foreground'>
                    <rect width='20' height='14' x='2' y='3' rx='2' />
                    <path d='M2 21h20' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>4</div>
                  <p className='text-xs text-muted-foreground'>
                    Unidades portátiles
                  </p>
                </CardContent>
              </Card>

              {/* Desktops */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Desktops</CardTitle>
                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'
                    fill='none' stroke='currentColor' strokeLinecap='round'
                    strokeLinejoin='round' strokeWidth='2'
                    className='h-4 w-4 text-muted-foreground'>
                    <rect width='14' height='10' x='5' y='2' rx='2' />
                    <path d='M2 22h20' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>0</div>
                  <p className='text-xs text-muted-foreground'>
                    Estaciones fijas
                  </p>
                </CardContent>
              </Card>

              {/* Personal */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Personal</CardTitle>
                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'
                    fill='none' stroke='currentColor' strokeLinecap='round'
                    strokeLinejoin='round' strokeWidth='2'
                    className='h-4 w-4 text-muted-foreground'>
                    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                    <circle cx='9' cy='7' r='4' />
                    <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>6</div>
                  <p className='text-xs text-muted-foreground'>
                    Colaboradores asignados
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Resumen Operativo</CardTitle>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Asignaciones Recientes</CardTitle>
                  <CardDescription>
                    Últimos 5 equipos añadidos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='analytics' className='space-y-4'>
            <Analytics />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
