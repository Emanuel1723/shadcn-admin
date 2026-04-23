import { MaintenanceAddSheet } from '@/routes/MaintenanceAddSheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Main } from '@/components/layout/main'
import { topNav } from '@/components/layout/nav-links'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function MantenimientoView() {
  return (
    <>
      {/* 1. EL HEADER: Esto es lo que faltaba en el código */}
      <TopNav links={topNav}>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </TopNav>

      {/* 2. EL CONTENIDO PRINCIPAL */}
      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Mantenimiento</h2>
            <p className='text-muted-foreground'>
              Registro de servicios preventivos y correctivos de equipos.
            </p>
          </div>
          <MaintenanceAddSheet />
        </div>

        <Separator className='my-4' />

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo / Serial</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className='text-right'>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className='font-medium'>
                  Dell Latitude 5420 <br />
                  <span className='text-[10px] font-bold text-muted-foreground uppercase'>
                    ST: 7XJ2K93
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant='outline' className='text-blue-500'>
                    Preventivo
                  </Badge>
                </TableCell>
                <TableCell>22/04/2026</TableCell>
                <TableCell>Emanuel González</TableCell>
                <TableCell>
                  <Badge className='bg-yellow-500'>Pendiente</Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <Button variant='ghost' size='sm'>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
