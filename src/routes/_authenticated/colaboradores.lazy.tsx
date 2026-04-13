import { useState, useMemo, useEffect } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Users, 
  Search, 
  Pencil, 
  Trash2, 
  UserPlus,
  Mail,
  Building2,
  Briefcase
} from 'lucide-react'
import { toast } from 'sonner'

// Layouts y UI de tu proyecto
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { Main } from '@/components/layout/main'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeSwitch } from '@/components/theme-switch'

export const Route = createLazyFileRoute('/_authenticated/colaboradores')({
  component: ColaboradoresPage,
})

function ColaboradoresPage() {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingColaborador, setEditingColaborador] = useState<any | null>(null)

  // Carga inicial desde LocalStorage
  const [colaboradores, setColaboradores] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('aila_inventario_colaboradores')
      return saved ? JSON.parse(saved) : [
        { id: '1', nombre: 'Emanuel González', cargo: 'Soporte Técnico', depto: 'TI', email: 'egonzalez@aila.com' },
        { id: '2', nombre: 'Ovimer', cargo: 'Soporte Técnico', depto: 'TI', email: 'ovimer@aila.com' }
      ]
    } catch (e) { return [] }
  })

  // Guardar cambios automáticamente
  useEffect(() => {
    localStorage.setItem('aila_inventario_colaboradores', JSON.stringify(colaboradores))
  }, [colaboradores])

  // Filtrado para la búsqueda
  const colaboradoresFiltrados = useMemo(() => {
    return colaboradores.filter(c => 
      c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.depto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [colaboradores, searchTerm])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const nuevo = {
      id: editingColaborador ? editingColaborador.id : crypto.randomUUID(),
      nombre: formData.get('nombre'),
      cargo: formData.get('cargo'),
      depto: formData.get('depto'),
      email: formData.get('email'),
    }

    if (editingColaborador) {
      setColaboradores(prev => prev.map(c => c.id === nuevo.id ? nuevo : c))
      toast.success('Colaborador actualizado')
    } else {
      setColaboradores(prev => [...prev, nuevo])
      toast.success('Colaborador registrado')
    }
    cerrarModal()
  }

  const cerrarModal = () => {
    setOpen(false)
    setEditingColaborador(null)
  }

  const eliminarColaborador = (id: string) => {
    setColaboradores(prev => prev.filter(c => c.id !== id))
    toast.error('Colaborador eliminado')
  }

  return (
    <AuthenticatedLayout>
      <Main fixed>
        <header className='flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 -mt-4 -mx-4 mb-6 bg-background sticky top-0 z-20 border-border'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <div className='flex flex-col text-foreground'>
              <h1 className='text-md font-bold tracking-tight leading-none'>Colaboradores - AILA</h1>
              <span className='text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1'>Gestión de Personal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block group">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Buscar por nombre o depto..."
                className="w-64 pl-9 bg-muted/50 border-border text-foreground focus:ring-1 focus:ring-blue-500 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <ThemeSwitch />

            <Button 
              size="sm" 
              className='gap-2 bg-blue-600 text-white hover:bg-blue-500 font-bold px-4 shadow-sm transition-all' 
              onClick={() => { setEditingColaborador(null); setOpen(true); }}
            >
              <UserPlus size={18} /> <span className="hidden sm:inline">Añadir Colaborador</span>
            </Button>
          </div>
        </header>

        <div className='flex-1 overflow-auto rounded-xl border border-border bg-card shadow-sm'>
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow className="border-border">
                <TableHead className="text-[11px] uppercase font-bold text-muted-foreground py-4">Nombre y Cargo</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-muted-foreground">Departamento</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-muted-foreground">Email</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-muted-foreground text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradoresFiltrados.length > 0 ? (
                colaboradoresFiltrados.map((c) => (
                  <TableRow key={c.id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3">
                      <div className="font-bold text-foreground">{c.nombre}</div>
                      <div className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                        <Briefcase size={10} /> {c.cargo || 'General'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded bg-muted text-foreground text-[10px] border border-border font-bold flex items-center gap-1 w-fit">
                        <Building2 size={10} /> {c.depto || 'TI'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono italic">
                      {c.email}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10" onClick={() => { setEditingColaborador(c); setOpen(true); }}>
                          <Pencil size={14}/>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" onClick={() => eliminarColaborador(c.id)}>
                          <Trash2 size={14}/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                    No se encontraron colaboradores.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal de Registro/Edición */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[450px] border-border bg-card text-foreground shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Users size={20} />
                  </div>
                  {editingColaborador ? 'Editar Colaborador' : 'Nuevo Colaborador'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Nombre Completo</Label>
                  <Input name="nombre" defaultValue={editingColaborador?.nombre} placeholder="Ej: Juan Pérez" className="bg-muted/50 border-border" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Cargo</Label>
                    <Input name="cargo" defaultValue={editingColaborador?.cargo} placeholder="Soporte Técnico" className="bg-muted/50 border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Departamento</Label>
                    <Input name="depto" defaultValue={editingColaborador?.depto} placeholder="TI" className="bg-muted/50 border-border" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input name="email" type="email" defaultValue={editingColaborador?.email} placeholder="usuario@aila.com" className="bg-muted/50 border-border pl-9" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={cerrarModal}>Cancelar</Button>
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-500 font-bold px-8">
                  {editingColaborador ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </Main>
    </AuthenticatedLayout>
  )
}