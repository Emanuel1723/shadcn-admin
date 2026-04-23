import { useState, useMemo, useEffect } from 'react'
import {
  Users,
  Search,
  Pencil,
  Trash2,
  UserPlus,
  Building2,
  Briefcase,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { topNav } from '@/components/layout/nav-links'
import { TopNav } from '@/components/layout/top-nav'
import { ThemeSwitch } from '@/components/theme-switch'

// 1. Interfaz para eliminar errores de "any"
interface Colaborador {
  id: string
  nombre: string
  cargo: string
  depto: string
}

export function ColaboradoresView() {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingColaborador, setEditingColaborador] =
    useState<Colaborador | null>(null)

  const [colaboradores, setColaboradores] = useState<Colaborador[]>(() => {
    try {
      const saved = localStorage.getItem('aila_inventario_colaboradores')
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: '1',
              nombre: 'Emanuel González',
              cargo: 'Soporte Técnico',
              depto: 'TI',
            },
            {
              id: '2',
              nombre: 'Ovimer',
              cargo: 'Soporte Técnico',
              depto: 'TI',
            },
          ]
    } catch (_e) {
      // Usamos _e para que ESLint no se queje de variable no usada
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(
      'aila_inventario_colaboradores',
      JSON.stringify(colaboradores)
    )
  }, [colaboradores])

  const colaboradoresFiltrados = useMemo(() => {
    return colaboradores.filter(
      (c) =>
        c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.depto?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [colaboradores, searchTerm])

  const cerrarModal = () => {
    setOpen(false)
    setEditingColaborador(null)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const nuevo: Colaborador = {
      id: editingColaborador ? editingColaborador.id : crypto.randomUUID(),
      nombre: formData.get('nombre') as string,
      cargo: formData.get('cargo') as string,
      depto: formData.get('depto') as string,
    }

    if (editingColaborador) {
      setColaboradores((prev) =>
        prev.map((c) => (c.id === nuevo.id ? nuevo : c))
      )
      toast.success('Colaborador actualizado')
    } else {
      setColaboradores((prev) => [...prev, nuevo])
      toast.success('Colaborador registrado')
    }
    cerrarModal()
  }

  const eliminarColaborador = (id: string) => {
    setColaboradores((prev) => prev.filter((c) => c.id !== id))
    toast.error('Colaborador eliminado')
  }

  return (
    <Main className='m-0 flex w-full min-w-0 flex-1 flex-col p-0'>
      <header className='sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b bg-background px-4 md:px-6'>
        <div className='flex items-center gap-2'>
          <SidebarTrigger />
          <Separator orientation='vertical' className='mx-2 h-4' />
          <div className='flex flex-col'>
            <h1 className='text-sm font-bold tracking-tight'>
              Colaboradores - AILA
            </h1>
            <span className='text-[10px] font-bold text-blue-500 uppercase'>
              Gestión de Personal
            </span>
          </div>
          <Separator orientation='vertical' className='mx-2 h-4' />
          <TopNav links={topNav} className='me-auto' />
        </div>

        <div className='flex items-center gap-3'>
          <div className='relative hidden sm:block'>
            <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Buscar por nombre o depto...'
              className='h-9 w-48 bg-muted/50 pl-9 md:w-80'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ThemeSwitch />
          <Button
            size='sm'
            className='gap-2 bg-blue-600 hover:bg-blue-700'
            onClick={() => {
              setEditingColaborador(null)
              setOpen(true)
            }}
          >
            <UserPlus size={16} />
            <span className='hidden md:inline'>Añadir Colaborador</span>
          </Button>
        </div>
      </header>

      <div className='w-full min-w-0 flex-1 px-10 pt-10'>
        <div className='w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <div className='w-full overflow-x-auto'>
            <Table className='w-full'>
              <TableHeader className='bg-muted/50'>
                <TableRow>
                  {/* Clases sugeridas por Tailwind */}
                  <TableHead className='min-w-50 py-4 font-bold'>
                    NOMBRE Y CARGO
                  </TableHead>
                  <TableHead className='min-w-37.5 font-bold'>
                    DEPARTAMENTO
                  </TableHead>
                  <TableHead className='pr-6 text-right font-bold'>
                    ACCIONES
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradoresFiltrados.length > 0 ? (
                  colaboradoresFiltrados.map((c) => (
                    <TableRow
                      key={c.id}
                      className='transition-colors hover:bg-muted/30'
                    >
                      <TableCell>
                        <div className='text-sm font-bold'>{c.nombre}</div>
                        <div className='mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase'>
                          <Briefcase size={10} /> {c.cargo || 'Soporte Técnico'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className='flex w-fit items-center gap-1 rounded border bg-muted/80 px-2 py-1 text-[10px] font-bold uppercase'>
                          <Building2 size={10} /> {c.depto || 'TI'}
                        </span>
                      </TableCell>
                      <TableCell className='pr-4 text-right'>
                        <div className='flex justify-end gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 hover:text-blue-600'
                            onClick={() => {
                              setEditingColaborador(c)
                              setOpen(true)
                            }}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700'
                            onClick={() => eliminarColaborador(c.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className='h-40 text-center text-muted-foreground italic'
                    >
                      No se encontraron colaboradores.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-112.5'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-3 text-xl font-bold'>
                <div className='rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30'>
                  <Users className='text-blue-600' size={20} />
                </div>
                {editingColaborador
                  ? 'Editar Colaborador'
                  : 'Nuevo Colaborador'}
              </DialogTitle>
            </DialogHeader>

            <div className='grid gap-5'>
              <div className='space-y-2'>
                <Label className='text-[10px] font-bold uppercase'>
                  Nombre Completo
                </Label>
                <Input
                  name='nombre'
                  defaultValue={editingColaborador?.nombre}
                  placeholder='Ej: Emanuel González'
                  required
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-[10px] font-bold uppercase'>
                    Cargo
                  </Label>
                  <Input
                    name='cargo'
                    defaultValue={editingColaborador?.cargo}
                    placeholder='Soporte Técnico'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-[10px] font-bold uppercase'>
                    Departamento
                  </Label>
                  <Input
                    name='depto'
                    defaultValue={editingColaborador?.depto}
                    placeholder='TI'
                  />
                </div>
              </div>
            </div>

            <div className='mt-4 flex justify-end gap-3 border-t pt-6'>
              <Button type='button' variant='ghost' onClick={cerrarModal}>
                Cancelar
              </Button>
              <Button
                type='submit'
                className='bg-blue-600 px-8 hover:bg-blue-700'
              >
                {editingColaborador ? 'Actualizar' : 'Registrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Main>
  )
}
