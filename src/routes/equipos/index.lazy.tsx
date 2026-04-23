import { useState, useRef, useEffect, useMemo } from 'react'
import { ThemeSwitch } from '@/components/theme-switch'
import { createLazyFileRoute } from '@tanstack/react-router'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Plus, Monitor, Pencil, Trash2, FileUp, FileDown, Search, User, Hash, Tag } from 'lucide-react'
import { toast } from 'sonner'

import { TopNav } from '@/components/layout/top-nav'
import { topNav } from '@/components/layout/nav-links';

// IMPORTACIONES DE LAYOUT Y UI
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { Main } from '@/components/layout/main'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export const Route = createLazyFileRoute('/equipos/')({
  component: EquiposPage,
})

function EquiposPage() {
  const [open, setOpen] = useState(false)
  const [showNewMarca, setShowNewMarca] = useState(false)
  const [showNewTipo, setShowNewTipo] = useState(false)
  
  // Estados para el modal de eliminación
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedEquipoId, setSelectedEquipoId] = useState<string | null>(null)
  
  // Referencia para el input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [datosTemporales, setDatosTemporales] = useState<any[] | null>(null)
  const [showImportAlert, setShowImportAlert] = useState(false)

  const [equipos, setEquipos] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('aila_inventario_equipos')
      return saved ? JSON.parse(saved) : []
    } catch (e) { return [] }
  })

  const [colaboradores, setColaboradores] = useState<any[]>([])
  
  useEffect(() => {
    const savedColabs = localStorage.getItem('aila_inventario_colaboradores')
    if (savedColabs) {
      setColaboradores(JSON.parse(savedColabs))
    }
  }, [open])

  const [marcas] = useState(['DELL', 'Grandstream', 'HP', 'Lenovo', 'Apple'])
  const [tipos] = useState(['Laptop', 'Desktop', 'Monitor', 'Teléfono IP', 'Impresora', 'Tablet'])

  const [editingEquipo, setEditingEquipo] = useState<any | null>(null)
  const [selectedColabData, setSelectedColabData] = useState({ cargo: '', depto: '' })

  useEffect(() => {
    localStorage.setItem('aila_inventario_equipos', JSON.stringify(equipos))
  }, [equipos])

  const equiposFiltrados = useMemo(() => {
    return equipos.filter(e => 
      e.colaborador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.sn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.activo?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [equipos, searchTerm])

  const importarExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsName = wb.SheetNames[0]
        const ws = wb.Sheets[wsName]
        const data = XLSX.utils.sheet_to_json(ws)

        if (data.length === 0) {
          toast.error("El archivo está vacío")
          return
        }

        const mapeados = data.map((item: any) => ({
          id: crypto.randomUUID(),
          colaborador: item.Colaborador || item.colaborador || "N/A",
          posicion: item.Cargo || item.posicion || "",
          depto: item.Departamento || item.depto || "",
          tipo: item.Tipo || item.tipo || "Equipo",
          marca: item.Marca || item.marca || "Genérica",
          modelo: item.Modelo || item.modelo || "",
          sn: item['Serial / SN'] || item.sn || item.Serial || "S/N",
          activo: item['Activo Fijo'] || item.activo || ""
        }))

        setDatosTemporales(mapeados)
        setShowImportAlert(true)
        
        if (fileInputRef.current) fileInputRef.current.value = ""
        
      } catch (error) { 
        console.error(error)
        toast.error("Error al leer el archivo Excel") 
      }
    }
    reader.readAsBinaryString(file)
  }

  const confirmarImportacion = (sobreescribir: boolean) => {
  if (!datosTemporales) return

  if (sobreescribir) {
    setEquipos(datosTemporales)
    toast.success("Inventario reemplazado por completo")
  } else {
    // Filtrar los que ya existen por SN (ignorando mayúsculas/minúsculas)
    const nuevosEquipos = datosTemporales.filter(temp => 
      !equipos.some(existente => existente.sn?.toLowerCase() === temp.sn?.toLowerCase())
    )

    const duplicadosCount = datosTemporales.length - nuevosEquipos.length

    if (nuevosEquipos.length === 0) {
      toast.error("Todos los equipos del Excel ya existen en el sistema.")
    } else {
      setEquipos(prev => [...prev, ...nuevosEquipos])
      if (duplicadosCount > 0) {
        toast.warning(`Se añadieron ${nuevosEquipos.length} equipos, pero se omitieron ${duplicadosCount} que ya estaban duplicados.`)
      } else {
        toast.success(`Se importaron ${nuevosEquipos.length} equipos nuevos con éxito.`)
      }
    }
  }
  
  setShowImportAlert(false)
  setDatosTemporales(null)
}

  const exportarExcel = () => {
    if (equipos.length === 0) {
      toast.error("No hay datos para exportar.")
      return
    }
    const ws = XLSX.utils.json_to_sheet(equipos.map(e => ({
      Colaborador: e.colaborador,
      Cargo: e.posicion,
      Departamento: e.depto,
      Tipo: e.tipo,
      Marca: e.marca,
      Modelo: e.modelo,
      'Serial / SN': e.sn,
      'Activo Fijo': e.activo
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Inventario")
    XLSX.writeFile(wb, `Inventario_AILA_${new Date().toLocaleDateString()}.xlsx`)
  }

  const handleColaboradorChange = (nombre: string) => {
    const colab = colaboradores.find(c => c.nombre === nombre)
    if (colab) {
      setSelectedColabData({
        cargo: colab.cargo || '',
        depto: colab.depto || ''
      })
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  
  const snNuevo = formData.get('sn') as string
  const activoNuevo = formData.get('activo') as string
  const marcaFinal = showNewMarca ? formData.get('nueva-marca') as string : formData.get('marca') as string
  const tipoFinal = showNewTipo ? formData.get('nuevo-tipo') as string : formData.get('tipo') as string

  // --- VALIDACIONES ---

  // 1. Verificar si el SN ya existe en otro equipo (excluyendo el que estamos editando)
  const snDuplicado = equipos.find(eq => 
    eq.sn?.toLowerCase() === snNuevo.toLowerCase() && eq.id !== editingEquipo?.id
  )
  if (snDuplicado) {
    return toast.error(`Error: El Serial Number "${snNuevo}" ya está registrado a nombre de ${snDuplicado.colaborador}.`)
  }

  // 2. Verificar si el Activo Fijo ya existe
  if (activoNuevo) {
    const activoDuplicado = equipos.find(eq => 
      eq.activo?.toLowerCase() === activoNuevo.toLowerCase() && eq.id !== editingEquipo?.id
    )
    if (activoDuplicado) {
      return toast.error(`Error: El código de Activo "${activoNuevo}" ya existe.`)
    }
  }

  // 3. Validación de campos obligatorios básicos (HTML5 ya hace parte, pero esto es extra seguridad)
  if (!tipoFinal || !marcaFinal) {
    return toast.error("Por favor, selecciona el tipo y la marca del equipo.")
  }

  // --- FIN DE VALIDACIONES ---

  const nuevo = {
    id: editingEquipo ? editingEquipo.id : crypto.randomUUID(),
    colaborador: formData.get('colaborador'),
    posicion: formData.get('posicion'),
    depto: formData.get('depto'),
    tipo: tipoFinal,
    marca: marcaFinal,
    modelo: formData.get('modelo'),
    sn: snNuevo,
    activo: activoNuevo,
  }

  setEquipos(prev => editingEquipo ? prev.map(x => x.id === nuevo.id ? nuevo : x) : [...prev, nuevo])
  cerrarModal()
  toast.success(editingEquipo ? 'Equipo actualizado' : 'Nuevo equipo registrado')
}

  const cerrarModal = () => {
    setOpen(false)
    setEditingEquipo(null)
    setShowNewMarca(false)
    setShowNewTipo(false)
    setSelectedColabData({ cargo: '', depto: '' })
  }

  return (
    <AuthenticatedLayout>
      <Main fixed>
        <header className='flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 -mt-4 -mx-4 mb-6 bg-background sticky top-0 z-20 border-border'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />
          <div className='flex flex-col text-foreground'>
            <h1 className='text-md font-bold tracking-tight leading-none'>Inventario IT - AILA</h1>
            <span className='text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1'>Control de Activos</span>
          </div>
            <Separator orientation='vertical' className='mr-2 h-4' />
          <TopNav links={topNav} className="me-auto" />
            
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block group">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
              <Input
                type="search"
                placeholder="Buscar por SN, Activo o Nombre..."
                className="w-64 pl-9 bg-muted/50 border-border text-foreground focus:ring-1 focus:ring-blue-500 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <ThemeSwitch />

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx, .xls"
              onChange={importarExcel} 
            />

            <Button 
              variant="outline" 
              size="sm" 
              className="hidden md:flex gap-2 text-foreground h-9" 
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp size={16} /> Subir
            </Button>
            
            <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-foreground h-9" onClick={exportarExcel}>
              <FileDown size={16} /> Bajar
            </Button>

            <Button size="sm" className='gap-2 bg-blue-600 text-white hover:bg-blue-500 font-bold px-4 h-9 shadow-sm active:scale-95 transition-all' onClick={() => { setEditingEquipo(null); setOpen(true); }}>
              <Plus size={18} strokeWidth={2.5} /> <span className="hidden sm:inline">Nuevo Equipo</span>
            </Button>
          </div>
        </header>
        
        <div className='flex-1 overflow-auto rounded-xl border border-border bg-card shadow-sm mt-10 mx-10'>
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow className="border-border">
                <TableHead className="text-[11px] uppercase font-bold text-muted-foreground py-4">Colaborador</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-muted-foreground">Depto.</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-muted-foreground">Equipo / Modelo</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-muted-foreground">Serial / Activo</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-muted-foreground text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equiposFiltrados.length > 0 ? (
                equiposFiltrados.map((e) => (
                  <TableRow key={e.id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="py-3">
                      <div className="font-bold text-foreground">{e.colaborador}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">{e.posicion || 'Personal AILA'}</div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded bg-muted text-foreground text-[10px] border border-border font-bold">{e.depto || 'General'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground font-medium">{e.tipo}</div>
                      <div className="text-[11px] font-bold text-blue-500 uppercase tracking-tighter">{e.marca} {e.modelo}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <code className="bg-muted border border-border text-foreground px-2 py-0.5 rounded text-[10px] font-mono w-fit">
                          SN: {e.sn}
                        </code>
                        {e.activo && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded w-fit uppercase">
                            <Tag size={10} /> {e.activo}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500" onClick={() => { setEditingEquipo(e); setOpen(true); }}>
                          <Pencil size={14}/>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-red-500" 
                          onClick={() => {
                            setSelectedEquipoId(e.id);
                            setIsConfirmOpen(true);
                          }}
                        >
                          <Trash2 size={14}/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">No hay registros.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* --- MODAL DE NUEVO/EDITAR --- */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[550px] border-border bg-card text-foreground shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Monitor size={20} /></div>
                  {editingEquipo ? 'Actualizar Información' : 'Registrar Nuevo Activo'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><User size={10} /> Colaborador Responsable</Label>
                  <Select name="colaborador" defaultValue={editingEquipo?.colaborador} onValueChange={handleColaboradorChange} required>
                    <SelectTrigger className="bg-muted/50 border-border"><SelectValue placeholder="Seleccionar del personal..." /></SelectTrigger>
                    <SelectContent>
                      {colaboradores.map(c => <SelectItem key={c.id} value={c.nombre}>{c.nombre} <span className="text-[10px] opacity-50 ml-2">— {c.depto}</span></SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Cargo</Label>
                  <Input name="posicion" defaultValue={editingEquipo?.posicion || selectedColabData.cargo} key={selectedColabData.cargo} placeholder="Soporte Técnico" className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Departamento</Label>
                  <Input name="depto" defaultValue={editingEquipo?.depto || selectedColabData.depto} key={selectedColabData.depto} placeholder="TI" className="bg-muted/50" />
                </div>

                <Separator className="col-span-2 my-2" />

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Tipo</Label>
                  <Select name="tipo" defaultValue={editingEquipo?.tipo} onValueChange={(v) => setShowNewTipo(v === 'new')}>
                    <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Laptop..." /></SelectTrigger>
                    <SelectContent>
                      {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      <SelectItem value="new" className="text-blue-500 font-bold">+ Otro...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Marca</Label>
                  <Select name="marca" defaultValue={editingEquipo?.marca} onValueChange={(v) => setShowNewMarca(v === 'new')}>
                    <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Dell..." /></SelectTrigger>
                    <SelectContent>
                      {marcas.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      <SelectItem value="new" className="text-blue-500 font-bold">+ Nueva...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {showNewTipo && <div className="col-span-2"><Input name="nuevo-tipo" placeholder="Especificar tipo" className="bg-muted border-blue-500" required/></div>}
                {showNewMarca && <div className="col-span-2"><Input name="nueva-marca" placeholder="Especificar marca" className="bg-muted border-blue-500" required/></div>}

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Modelo</Label>
                  <Input name="modelo" defaultValue={editingEquipo?.modelo} placeholder="Ej: Latitude 5410" className="bg-muted/50" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Serial Number (SN)</Label>
                  <Input name="sn" defaultValue={editingEquipo?.sn} placeholder="S/N o Service Tag" className="bg-muted/50 font-mono text-blue-500" required />
                </div>

                <div className="col-span-2 p-4 rounded-lg bg-orange-500/5 border border-orange-500/10 space-y-2">
                  <Label className="text-[10px] font-bold text-orange-600 uppercase flex items-center gap-1">
                    <Hash size={10} /> Código de Activo Fijo (AILA)
                  </Label>
                  <Input 
                    name="activo" 
                    defaultValue={editingEquipo?.activo} 
                    placeholder="Ej: AILA-INV-2024-001" 
                    className="bg-background border-orange-500/30 focus:border-orange-500 text-orange-600 font-bold" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="ghost" onClick={cerrarModal}>Cerrar</Button>
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-500 font-bold px-8">Guardar Registro</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* --- ALERT DIALOG PARA CONFIRMAR IMPORTACIÓN --- */}
        <AlertDialog open={showImportAlert} onOpenChange={setShowImportAlert}>
          <AlertDialogContent className="bg-card border-border text-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle>Importar desde Excel</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Se detectaron {datosTemporales?.length} equipos. ¿Cómo deseas proceder?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2">
              <Button variant="ghost" onClick={() => { setDatosTemporales(null); setShowImportAlert(false); }}>
                Cancelar
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                onClick={() => confirmarImportacion(false)}
              >
                Añadir a la lista
              </Button>
              <AlertDialogAction 
                onClick={() => confirmarImportacion(true)} 
                className="bg-red-600 hover:bg-red-700 text-white border-none"
              >
                Borrar y Reemplazar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* --- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN --- */}
<AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
  <AlertDialogContent className="bg-card border-border text-foreground">
    <AlertDialogHeader>
      <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
      <AlertDialogDescription className="text-muted-foreground">
        Esta acción eliminará el equipo permanentemente del inventario del AILA y no se puede deshacer.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>
        Cancelar
      </Button>
      <AlertDialogAction 
        className="bg-red-600 hover:bg-red-700 text-white border-none"
        onClick={() => {
          setEquipos(prev => prev.filter(x => x.id !== selectedEquipoId));
          setIsConfirmOpen(false);
          toast.success("Equipo eliminado del sistema");
        }}
      >
        Eliminar Equipo
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

</Main>
</AuthenticatedLayout>
  )
}

