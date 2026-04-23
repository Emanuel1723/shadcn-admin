import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Plus,
  Monitor,
  Pencil,
  Trash2,
  FileUp,
  FileDown,
  Search,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { Main } from '@/components/layout/main'
import { topNav } from '@/components/layout/nav-links'
import { TopNav } from '@/components/layout/top-nav'
import { ThemeSwitch } from '@/components/theme-switch'

interface Equipo {
  id: string
  // Propiedades originales del Excel (Opcionales para el estado final)
  Colaborador?: string
  Departamento?: string
  Tipo?: string
  Marca?: string
  Cargo?: string
  Modelo?: string
  'Serial / SN'?: string
  'Activo Fijo'?: string
  nombre?: string
  cargo?: string
  depto: string

  // Propiedades limpias que usas en tu sistema (Obligatorias)
  colaborador: string
  posicion: string
  tipo: string
  marca: string
  modelo: string
  sn: string
  activo: string
}
export function EquiposPage() {
  const [open, setOpen] = useState(false)
  const [showNewMarca, setShowNewMarca] = useState(false)
  const [showNewTipo, setShowNewTipo] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedEquipoId, setSelectedEquipoId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [datosTemporales, setDatosTemporales] = useState<Equipo[] | null>(null)
  const [showImportAlert, setShowImportAlert] = useState(false)

  const [equipos, setEquipos] = useState<Equipo[]>(() => {
    try {
      const saved = localStorage.getItem('aila_inventario_equipos')
      return saved ? JSON.parse(saved) : []
    } catch (_e) {
      return []
    }
  })

  const [colaboradores, setColaboradores] = useState<Equipo[]>([])

  useEffect(() => {
    const savedColabs = localStorage.getItem('aila_inventario_colaboradores')
    if (savedColabs) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setColaboradores(JSON.parse(savedColabs))
      } catch (_e) {
        // eslint-disable-next-line no-console
        console.error('Error parseando colaboradores')
      }
    }
  }, []) // Asegúrate de que este [] esté bien cerrado

  const [marcas] = useState([
    'DELL',
    'HP',
    'Lenovo',
    'Grandstream',
    'Apple',
    'Logitech',
  ])
  const [tipos] = useState([
    'Laptop',
    'Desktop',
    'Monitor',
    'Teléfono IP',
    'Impresora',
    'Scanner',
  ])

  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null)
  const [selectedColabData, setSelectedColabData] = useState({
    cargo: '',
    depto: '',
  })

  useEffect(() => {
    localStorage.setItem('aila_inventario_equipos', JSON.stringify(equipos))
  }, [equipos])

  const equiposFiltrados = useMemo(() => {
    return equipos.filter(
      (e) =>
        e.Colaborador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          toast.error('El archivo está vacío')
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapeados = (data as any[]).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any): Equipo => ({
            id: crypto.randomUUID(),
            colaborador: item.Colaborador || item.colaborador || 'N/A',
            posicion: item.Cargo || item.posicion || '',
            depto: item.Departamento || item.depto || '',
            tipo: item.Tipo || item.tipo || 'Equipo',
            marca: item.Marca || item.marca || 'Genérica',
            modelo: item.Modelo || item.modelo || '',
            sn: String(item['Serial / SN'] || item.sn || item.Serial || 'S/N'),
            activo: String(item['Activo Fijo'] || item.activo || ''),
          })
        )

        // Ahora setEquipos(mapeados) funcionará sin errores
        setEquipos(mapeados)

        setDatosTemporales(mapeados)
        setShowImportAlert(true)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } catch (_error) {
        toast.error('Error al leer el archivo Excel')
      }
    }
    reader.readAsBinaryString(file)
  }

  const confirmarImportacion = (sobreescribir: boolean) => {
    if (!datosTemporales) return
    if (sobreescribir) {
      setEquipos(datosTemporales)
      toast.success('Inventario reemplazado por completo')
    } else {
      const nuevosEquipos = datosTemporales.filter(
        (temp) =>
          !equipos.some((ex) => ex.sn?.toLowerCase() === temp.sn?.toLowerCase())
      )
      const duplicadosCount = datosTemporales.length - nuevosEquipos.length
      setEquipos((prev) => [...prev, ...nuevosEquipos])
      if (duplicadosCount > 0) {
        toast.warning(
          `Añadidos ${nuevosEquipos.length}, omitidos ${duplicadosCount} duplicados.`
        )
      } else {
        toast.success(
          `Se importaron ${nuevosEquipos.length} equipos con éxito.`
        )
      }
    }
    setShowImportAlert(false)
    setDatosTemporales(null)
  }

  const exportarExcel = () => {
    if (equipos.length === 0) {
      toast.error('No hay datos para exportar.')
      return
    }
    const ws = XLSX.utils.json_to_sheet(
      equipos.map((e) => ({
        Colaborador: e.colaborador,
        Cargo: e.posicion,
        Departamento: e.depto,
        Tipo: e.tipo,
        Marca: e.marca,
        Modelo: e.modelo,
        'Serial / SN': e.sn,
        'Activo Fijo': e.activo,
      }))
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario')
    XLSX.writeFile(
      wb,
      `Inventario_AILA_${new Date().toLocaleDateString()}.xlsx`
    )
  }

  const handleColaboradorChange = (nombre: string) => {
    const colab = colaboradores.find((c) => c.nombre === nombre)
    if (colab) {
      setSelectedColabData({
        cargo: colab.cargo || '',
        depto: colab.depto || '',
      })
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const snNuevo = formData.get('sn') as string
    const _activoNuevo = formData.get('activo') as string
    const _marcaFinal = showNewMarca
      ? (formData.get('nueva-marca') as string)
      : (formData.get('marca') as string)
    const tipoFinal = showNewTipo
      ? (formData.get('nuevo-tipo') as string)
      : (formData.get('tipo') as string)

    const snDuplicado = equipos.find(
      (eq) =>
        eq.sn?.toLowerCase() === snNuevo.toLowerCase() &&
        eq.id !== editingEquipo?.id
    )
    if (snDuplicado)
      return toast.error(
        `El Serial "${snNuevo}" ya pertenece a ${snDuplicado.colaborador}.`
      )

    const nuevo: Equipo = {
      id: editingEquipo?.id || crypto.randomUUID(),
      colaborador: String(formData.get('colaborador') || ''),
      posicion: String(formData.get('posicion') || ''),
      depto: String(formData.get('depto') || ''),
      tipo: tipoFinal,
      marca: _marcaFinal,
      modelo: String(formData.get('modelo') || ''),
      sn: String(formData.get('sn') || ''),
      activo: _activoNuevo,
    }

    setEquipos((prev) =>
      editingEquipo
        ? prev.map((x) => (x.id === nuevo.id ? nuevo : x))
        : [...prev, nuevo]
    )
    cerrarModal()
    toast.success(
      editingEquipo ? 'Equipo actualizado' : 'Nuevo equipo registrado'
    )
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
        <header className='sticky top-0 z-20 -mx-4 -mt-4 mb-6 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <div className='flex flex-col'>
              <h1 className='text-md font-bold tracking-tight'>SICA-AILA</h1>
              <span className='text-[10px] font-bold tracking-widest text-blue-500 uppercase'>
                Control de Activos IT
              </span>
            </div>
            <Separator orientation='vertical' className='mr-2 h-4' />
            <TopNav links={topNav} className='me-auto' />
          </div>

          <div className='flex items-center gap-3'>
            <div className='relative hidden lg:block'>
              <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar por SN, Activo o Nombre...'
                className='h-9 w-64 pl-9'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ThemeSwitch />
            <input
              type='file'
              ref={fileInputRef}
              className='hidden'
              accept='.xlsx, .xls'
              onChange={importarExcel}
            />
            <Button
              variant='outline'
              size='sm'
              className='hidden gap-2 md:flex'
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp size={16} /> Subir
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='hidden gap-2 md:flex'
              onClick={exportarExcel}
            >
              <FileDown size={16} /> Bajar
            </Button>
            <Button
              size='sm'
              className='bg-blue-600 font-bold text-white hover:bg-blue-500'
              onClick={() => {
                setEditingEquipo(null)
                setOpen(true)
              }}
            >
              <Plus size={18} className='mr-1' /> Nuevo Equipo
            </Button>
          </div>
        </header>

        <div className='mx-10 overflow-auto rounded-xl border bg-card shadow-sm'>
          <Table>
            <TableHeader className='bg-muted/50'>
              <TableRow>
                <TableHead className='py-4 text-[11px] font-bold uppercase'>
                  Colaborador
                </TableHead>
                <TableHead className='text-[11px] font-bold uppercase'>
                  Depto.
                </TableHead>
                <TableHead className='text-[11px] font-bold uppercase'>
                  Equipo / Modelo
                </TableHead>
                <TableHead className='text-[11px] font-bold uppercase'>
                  Serial / Activo
                </TableHead>
                <TableHead className='text-center text-[11px] font-bold uppercase'>
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equiposFiltrados.length > 0 ? (
                equiposFiltrados.map((e) => (
                  <TableRow key={e.id} className='hover:bg-muted/30'>
                    <TableCell className='py-3'>
                      <div className='font-bold'>{e.colaborador}</div>
                      <div className='text-[10px] font-semibold text-muted-foreground uppercase'>
                        {e.posicion || 'Personal AILA'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='rounded border bg-muted px-2 py-1 text-[10px] font-bold'>
                        {e.depto || 'General'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm font-medium'>{e.tipo}</div>
                      <div className='text-[11px] font-bold text-blue-500 uppercase'>
                        {e.marca} {e.modelo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col gap-1'>
                        <code className='w-fit rounded border bg-muted px-2 py-0.5 font-mono text-[10px]'>
                          SN: {e.sn}
                        </code>
                        {e.activo && (
                          <div className='flex items-center gap-1 text-[10px] font-bold text-orange-500 uppercase'>
                            <Tag size={10} /> {e.activo}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-center gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            setEditingEquipo(e)
                            setOpen(true)
                          }}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-red-500'
                          onClick={() => {
                            setSelectedEquipoId(e.id)
                            setIsConfirmOpen(true)
                          }}
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
                    colSpan={5}
                    className='h-32 text-center text-muted-foreground italic'
                  >
                    No hay registros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* DIALOG DE REGISTRO */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className='sm:max-w-137.5'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  <Monitor className='text-blue-500' />{' '}
                  {editingEquipo ? 'Editar Activo' : 'Nuevo Activo IT'}
                </DialogTitle>
              </DialogHeader>
              <div className='grid grid-cols-2 gap-4'>
                <div className='col-span-2 space-y-2'>
                  <Label className='text-[10px] font-bold uppercase'>
                    Responsable
                  </Label>
                  <Select
                    name='colaborador'
                    defaultValue={editingEquipo?.colaborador}
                    onValueChange={handleColaboradorChange}
                    required
                  >
                    <SelectTrigger className='bg-muted/50'>
                      <SelectValue placeholder='Seleccionar...' />
                    </SelectTrigger>
                    <SelectContent>
                      {colaboradores.map((c) => (
                        <SelectItem key={c.id} value={c.nombre || ''}>
                          {c.nombre} — {c.depto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label className='text-[10px] font-bold uppercase'>
                    Cargo
                  </Label>
                  <Input
                    name='posicion'
                    defaultValue={
                      editingEquipo?.posicion || selectedColabData.cargo
                    }
                    key={selectedColabData.cargo}
                    className='bg-muted/50'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-[10px] font-bold uppercase'>
                    Departamento
                  </Label>
                  <Input
                    name='depto'
                    defaultValue={
                      editingEquipo?.depto || selectedColabData.depto
                    }
                    key={selectedColabData.depto}
                    className='bg-muted/50'
                  />
                </div>
                <Separator className='col-span-2' />
                <div className='space-y-2'>
                  <Label className='text-[10px] font-bold uppercase'>
                    Tipo
                  </Label>
                  <Select
                    name='tipo'
                    defaultValue={editingEquipo?.tipo}
                    onValueChange={(v) => setShowNewTipo(v === 'new')}
                  >
                    <SelectTrigger className='bg-muted/50'>
                      <SelectValue placeholder='Tipo...' />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                      <SelectItem
                        value='new'
                        className='font-bold text-blue-500'
                      >
                        + Otro...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label className='text-[10px] font-bold uppercase'>
                    Marca
                  </Label>
                  <Select
                    name='marca'
                    defaultValue={editingEquipo?.marca}
                    onValueChange={(v) => setShowNewMarca(v === 'new')}
                  >
                    <SelectTrigger className='bg-muted/50'>
                      <SelectValue placeholder='Marca...' />
                    </SelectTrigger>
                    <SelectContent>
                      {marcas.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                      <SelectItem
                        value='new'
                        className='font-bold text-blue-500'
                      >
                        + Nueva...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(showNewTipo || showNewMarca) && (
                  <div className='col-span-2 flex gap-2'>
                    {showNewTipo && (
                      <Input
                        name='nuevo-tipo'
                        placeholder='Nuevo tipo...'
                        className='border-blue-500'
                        required
                      />
                    )}
                    {showNewMarca && (
                      <Input
                        name='nueva-marca'
                        placeholder='Nueva marca...'
                        className='border-blue-500'
                        required
                      />
                    )}
                  </div>
                )}
                <div className='space-y-2'>
                  <Label className='text-[10px] font-bold uppercase'>
                    Modelo
                  </Label>
                  <Input
                    name='modelo'
                    defaultValue={editingEquipo?.modelo}
                    placeholder='Ej: Latitude 5410'
                    className='bg-muted/50'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-[10px] font-bold uppercase'>
                    Serial (SN)
                  </Label>
                  <Input
                    name='sn'
                    defaultValue={editingEquipo?.sn}
                    placeholder='Service Tag'
                    className='bg-muted/50 font-mono text-blue-500'
                    required
                  />
                </div>
                <div className='col-span-2 space-y-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3'>
                  <Label className='text-[10px] font-bold text-orange-600 uppercase'>
                    Activo Fijo AILA
                  </Label>
                  <Input
                    name='activo'
                    defaultValue={editingEquipo?.activo}
                    placeholder='AILA-INV-000'
                    className='border-orange-500/30 font-bold text-orange-600'
                  />
                </div>
              </div>
              <div className='flex justify-end gap-2 border-t pt-4'>
                <Button type='button' variant='ghost' onClick={cerrarModal}>
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  className='bg-blue-600 font-bold text-white'
                >
                  Guardar Activo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* ALERTAS DE IMPORTACIÓN Y ELIMINACIÓN */}
        <AlertDialog open={showImportAlert} onOpenChange={setShowImportAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Importar Excel</AlertDialogTitle>
              <AlertDialogDescription>
                Detectamos {datosTemporales?.length} equipos. ¿Deseas añadirlos
                o reemplazar el inventario?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant='ghost' onClick={() => setShowImportAlert(false)}>
                Cancelar
              </Button>
              <Button
                variant='outline'
                className='text-blue-500'
                onClick={() => confirmarImportacion(false)}
              >
                Añadir
              </Button>
              <AlertDialogAction
                className='bg-red-600'
                onClick={() => confirmarImportacion(true)}
              >
                Reemplazar Todo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción es permanente y afectará los registros del AILA.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant='ghost' onClick={() => setIsConfirmOpen(false)}>
                Cancelar
              </Button>
              <AlertDialogAction
                className='bg-red-600'
                onClick={() => {
                  setEquipos((prev) =>
                    prev.filter((x) => x.id !== selectedEquipoId)
                  )
                  setIsConfirmOpen(false)
                  toast.success('Equipo eliminado')
                }}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Main>
    </AuthenticatedLayout>
  )
}
