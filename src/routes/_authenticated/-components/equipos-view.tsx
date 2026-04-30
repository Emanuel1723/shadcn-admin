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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Main } from '@/components/layout/main'

// Interfaz corregida para evitar errores de tipado
interface Equipo {
  id: string
  colaborador: string
  posicion: string
  depto: string
  tipo: string
  marca: string
  modelo: string
  sn: string
  activo: string
  nombre?: string
  cargo?: string
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
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null)
  const [selectedColabData, setSelectedColabData] = useState({
    cargo: '',
    depto: '',
  })

  // 1. Cargar equipos
  const [equipos, setEquipos] = useState<Equipo[]>(() => {
    const saved = localStorage.getItem('sica_aila_equipos')
    try {
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar equipos:', error)
      return []
    }
  })

  // 2. Cargar colaboradores (SOLO UNA VEZ)
  const [colaboradores] = useState<Equipo[]>(() => {
    const savedColabs = localStorage.getItem('colaboradores')
    try {
      return savedColabs ? JSON.parse(savedColabs) : []
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al parsear colaboradores:', error)
      return []
    }
  })

  // 3. Persistencia automática
  useEffect(() => {
    localStorage.setItem('sica_aila_equipos', JSON.stringify(equipos))
  }, [equipos])

  const marcas = ['DELL', 'HP', 'Lenovo', 'Grandstream', 'Apple', 'Logitech']
  const tipos = [
    'Laptop',
    'Desktop',
    'Monitor',
    'Teléfono IP',
    'Impresora',
    'Scanner',
  ]

  const equiposFiltrados = useMemo(() => {
    return equipos.filter((e) =>
      [e.colaborador, e.tipo, e.marca, e.sn, e.activo].some((val) =>
        val?.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[]

        if (data.length === 0) return toast.error('El archivo está vacío')

        const mapeados = data.map((item): Equipo => {
          // Cast temporal para acceder a llaves dinámicas del Excel sin errores de TS
          const row = item
          return {
            id: crypto.randomUUID(),
            colaborador:
              (row['colaborador'] as string) ||
              (row['Colaborador'] as string) ||
              'N/A',
            posicion:
              (row['cargo'] as string) ||
              (row['posicion'] as string) ||
              (row['Posicion'] as string) ||
              '',
            depto:
              (row['depto'] as string) ||
              (row['Depto'] as string) ||
              (row['Departamento'] as string) ||
              '',
            tipo:
              (row['tipo'] as string) || (row['Tipo'] as string) || 'Equipo',
            marca:
              (row['marca'] as string) ||
              (row['Marca'] as string) ||
              'Genérica',
            modelo:
              (row['modelo'] as string) || (row['Modelo'] as string) || '',
            activo: String(row['Activo Fijo'] || row['activo'] || ''),
            sn: String(row['Serial / SN'] || row['sn'] || 'S/N'),
          }
        })

        setDatosTemporales(mapeados)
        setShowImportAlert(true)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } catch {
        toast.error('Error al leer el archivo Excel')
      }
    }
    reader.readAsBinaryString(file)
  }

  const confirmarImportacion = (sobreescribir: boolean) => {
    if (!datosTemporales) return
    if (sobreescribir) {
      setEquipos(datosTemporales)
      toast.success('Inventario reemplazado')
    } else {
      const nuevos = datosTemporales.filter(
        (t) => !equipos.some((ex) => ex.sn.toLowerCase() === t.sn.toLowerCase())
      )
      setEquipos((prev) => [...prev, ...nuevos])
      toast.success(`Se añadieron ${nuevos.length} equipos nuevos.`)
    }
    setShowImportAlert(false)
    setDatosTemporales(null)
  }

  const exportarExcel = () => {
    if (equipos.length === 0) return toast.error('No hay datos.')
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
    if (colab)
      setSelectedColabData({
        cargo: colab.cargo || '',
        depto: colab.depto || '',
      })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const snNuevo = formData.get('sn') as string
    const duplicado = equipos.find(
      (eq) =>
        eq.sn.toLowerCase() === snNuevo.toLowerCase() &&
        eq.id !== editingEquipo?.id
    )
    if (duplicado)
      return toast.error(`El Serial "${snNuevo}" ya está registrado.`)

    const nuevo: Equipo = {
      id: editingEquipo?.id || crypto.randomUUID(),
      colaborador: String(formData.get('colaborador') || ''),
      posicion: String(formData.get('posicion') || ''),
      depto: String(formData.get('depto') || ''),
      tipo: showNewTipo
        ? String(formData.get('nuevo-tipo'))
        : String(formData.get('tipo')),
      marca: showNewMarca
        ? String(formData.get('nueva-marca'))
        : String(formData.get('marca')),
      modelo: String(formData.get('modelo') || ''),
      sn: snNuevo,
      activo: String(formData.get('activo') || ''),
    }

    setEquipos((prev) =>
      editingEquipo
        ? prev.map((x) => (x.id === nuevo.id ? nuevo : x))
        : [...prev, nuevo]
    )
    cerrarModal()
    toast.success(editingEquipo ? 'Equipo actualizado' : 'Equipo registrado')
  }

  const cerrarModal = () => {
    setOpen(false)
    setEditingEquipo(null)
    setShowNewMarca(false)
    setShowNewTipo(false)
    setSelectedColabData({ cargo: '', depto: '' })
  }

  return (
    <Main fixed>
      <div className='space-y-6 p-15'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Equipos Asignados
            </h2>
            <p className='text-sm font-medium tracking-wider text-blue-500 uppercase'>
              Control de Activos IT - AILA
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <div className='relative w-full sm:w-64'>
              <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar por SN, Activo...'
                className='h-9 pl-9'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

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
              onClick={() => fileInputRef.current?.click()}
              className='hidden gap-2 md:flex'
            >
              <FileUp size={16} /> Subir
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={exportarExcel}
              className='hidden gap-2 md:flex'
            >
              <FileDown size={16} /> Bajar
            </Button>

            <Button
              size='sm'
              className='bg-blue-600 font-bold text-white'
              onClick={() => {
                setEditingEquipo(null)
                setOpen(true)
              }}
            >
              <Plus size={18} className='mr-1' /> Nuevo
            </Button>
          </div>
        </div>

        <div className='rounded-xl border bg-card shadow-sm'>
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
                  <TableRow key={e.id}>
                    <TableCell className='py-3 text-sm font-bold'>
                      {e.colaborador}
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
                      <code className='block font-mono text-[10px]'>
                        SN: {e.sn}
                      </code>
                      {e.activo && (
                        <div className='flex items-center gap-1 text-[10px] font-bold text-orange-500 uppercase'>
                          <Tag size={10} /> {e.activo}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className='text-center'>
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
                    className='h-32 text-center text-muted-foreground'
                  >
                    No hay registros encontrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal de Registro/Edición */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-xl'>
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
                    <SelectValue placeholder='Seleccionar colaborador...' />
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
                <Label className='text-[10px] font-bold uppercase'>Cargo</Label>
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
                <Label className='text-[10px] font-bold uppercase'>Depto</Label>
                <Input
                  name='depto'
                  defaultValue={editingEquipo?.depto || selectedColabData.depto}
                  key={selectedColabData.depto}
                  className='bg-muted/50'
                />
              </div>
              <Separator className='col-span-2' />
              <div className='space-y-2'>
                <Label className='text-[10px] font-bold uppercase'>Tipo</Label>
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
                    <SelectItem value='new' className='font-bold text-blue-500'>
                      + Otro...
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label className='text-[10px] font-bold uppercase'>Marca</Label>
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
                    <SelectItem value='new' className='font-bold text-blue-500'>
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
                  className='bg-muted/50 font-mono text-blue-600'
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

      {/* Alertas de Confirmación */}
      <AlertDialog open={showImportAlert} onOpenChange={setShowImportAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Importar Excel</AlertDialogTitle>
            <AlertDialogDescription>
              Detectamos {datosTemporales?.length} equipos. ¿Deseas añadirlos o
              reemplazar el inventario actual?
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
              Esta acción es permanente y afectará los registros del sistema
              SICA-AILA.
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
  )
}
