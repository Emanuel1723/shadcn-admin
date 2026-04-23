import { useState } from 'react'
import { MaintenanceAddSheet } from '@/routes/MaintenanceAddSheet'
import { Search, Pencil, Trash2, Calendar, User, Monitor } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'

export function MantenimientoView() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <Main className='m-0 flex w-full min-w-0 flex-1 flex-col p-0'>
      {/* HEADER IDÉNTICO AL DE COLABORADORES */}
      <header className='sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b bg-background px-4 md:px-6'>
        <div className='flex items-center gap-2'>
          <SidebarTrigger />
          <Separator orientation='vertical' className='mx-2 h-4' />
          <div className='flex flex-col'>
            <h1 className='text-sm font-bold tracking-tight'>
              Mantenimiento - AILA
            </h1>
            <span className='text-[10px] font-bold text-blue-500 uppercase'>
              Registro de Servicios
            </span>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className='relative hidden sm:block'>
            <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Buscar equipo o técnico...'
              className='h-9 w-48 bg-muted/50 pl-9 md:w-80'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ThemeSwitch />
          {/* Botón de añadir (MaintenanceAddSheet ya debe venir con el trigger de botón) */}
          <MaintenanceAddSheet />
        </div>
      </header>

      {/* CONTENIDO DE LA TABLA CON EL DISEÑO DE COLABORADORES */}
      <div className='w-full min-w-0 flex-1 px-10 pt-10'>
        <div className='w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <div className='w-full overflow-x-auto'>
            <Table className='w-full'>
              <TableHeader className='bg-muted/50'>
                <TableRow>
                  <TableHead className='min-w-50 py-4 text-[11px] font-bold uppercase'>
                    Equipo / Serial
                  </TableHead>
                  <TableHead className='min-w-30 text-[11px] font-bold uppercase'>
                    Tipo y Fecha
                  </TableHead>
                  <TableHead className='min-w-40 text-[11px] font-bold uppercase'>
                    Técnico Responsable
                  </TableHead>
                  <TableHead className='min-w-28 text-[11px] font-bold uppercase'>
                    Estado
                  </TableHead>
                  <TableHead className='pr-6 text-right text-[11px] font-bold uppercase'>
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Ejemplo de fila con el nuevo estilo */}
                <TableRow className='transition-colors hover:bg-muted/30'>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <div className='rounded bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20'>
                        <Monitor size={16} />
                      </div>
                      <div>
                        <div className='text-sm font-bold'>
                          Dell Latitude 5420
                        </div>
                        <div className='text-[10px] font-semibold text-muted-foreground uppercase'>
                          ST: 7XJ2K93
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col gap-1'>
                      <Badge
                        variant='secondary'
                        className='w-fit text-[10px] font-bold text-blue-600 uppercase'
                      >
                        Preventivo
                      </Badge>
                      <div className='flex items-center gap-1 text-[10px] text-muted-foreground'>
                        <Calendar size={10} /> 22/04/2026
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2 text-sm font-medium'>
                      <User size={14} className='text-muted-foreground' />
                      Emanuel González
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className='bg-yellow-500 text-[10px] font-bold uppercase hover:bg-yellow-600'>
                      Pendiente
                    </Badge>
                  </TableCell>
                  <TableCell className='pr-4 text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 hover:text-blue-600'
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700'
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Main>
  )
}
