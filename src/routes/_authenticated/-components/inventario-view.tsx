/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useCallback } from 'react'
import axios from 'axios'
import { DialogDescription } from '@radix-ui/react-dialog'
import type { Equipo } from '@/types/equipo'
import { Search, Laptop, Monitor, Plus, RefreshCcw, Tag } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'

interface ModalProps {
  equipo: Equipo
  colaboradores: any[]
  onClose: () => void
  onUpdate: () => void
}
export function ModalAsignacion({
  equipo,
  colaboradores,
  onClose,
  onUpdate,
}: ModalProps) {
  const [colaboradorId, setColaboradorId] = useState('')

  const handleAsignar = async () => {
    try {
      await axios.patch(`http://localhost:3000/equipos/asignar/${equipo.id}`, {
        colaboradorId: parseInt(colaboradorId),
      })
      setColaboradorId('')
      alert('Equipo asignado correctamente')
      onUpdate()
      onClose()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al asignar el equipo:', error)
      alert('Hubo un error al asignar el equipo.')
    }
  }
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-96 rounded-lg bg-white p-6 text-black shadow-xl'>
        <h3 className='mb-2 text-lg font-bold'>Asignar Equipo</h3>
        <p className='mb-4 text-sm'>
          Modelo: {equipo.modelo} ({equipo.serial})
        </p>

        <select
          className='mb-4 w-full rounded border p-2'
          value={colaboradorId}
          onChange={(e) => setColaboradorId(e.target.value)}
        >
          <option value=''>Seleccionar técnico...</option>
          {colaboradores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <div className='flex justify-end gap-2'>
          <button onClick={onClose} className='rounded bg-gray-200 px-4 py-2'>
            Cancelar
          </button>
          <button
            onClick={handleAsignar}
            disabled={!colaboradorId}
            className='rounded bg-blue-600 px-4 py-2 text-white disabled:bg-blue-300'
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export function InventarioPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)

  // ESTADO PARA CAPTURAR LOS DATOS DEL NUEVO EQUIPO
  const [nuevoEquipo, setNuevoEquipo] = useState({
    activoFijo: '',
    tipo: '',
    modelo: '',
    marca: '',
    serial: '',
    serviceTag: '',
    estado: 'DISPONIBLE',
  })

  const fetchEquipos = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:3000/equipos')
      setEquipos(response.data)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar el inventario del AILA', error)
    } finally {
      setLoading(false)
    }
  }, [setEquipos, setLoading])

  useEffect(() => {
    const cargarInventarioAILA = async () => {
      setLoading(true)
      try {
        const response = await axios.get('http://localhost:3000/equipos')
        setEquipos(response.data)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error al cargar el inventario del AILA', error)
      } finally {
        setLoading(false)
      }
    }

    cargarInventarioAILA()
  }, [])

  // AQUÍ VA LA FUNCIÓN
  const handleImportExcel = async (
    data: Array<Record<string, string | number>>
  ) => {
    // 1. Transformamos los datos crudos del Excel al formato del sistema
    const mappedData: Omit<Equipo, 'id'>[] = data.map((item) => ({
      activoFijo: String(item['Activo Fijo'] || ''),
      tipo: String(item['Tipo'] || item['Equipo'] || 'DESCONOCIDO'),
      marca: String(item['Marca'] || ''),
      modelo: String(item['Modelo'] || ''),
      serial: String(item['Serial'] || item['Serial / SN'] || ''),
      serviceTag: String(item['Service Tag'] || item['ST'] || ''),
      estado: 'DISPONIBLE',
    }))

    try {
      // 2. Enviamos el array al backend (puedes crear una ruta masiva en NestJS)
      await axios.post('http://localhost:3000/equipos/bulk', mappedData)

      // 3. Refrescamos la tabla
      fetchEquipos()
      alert('¡Equipos importados correctamente!')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al importar:', error)
      alert('Hubo un problema al subir el archivo.')
    }
  }

  // FUNCIÓN PARA ENVIAR EL NUEVO EQUIPO AL BACKEND
  const handleGuardar = async () => {
    try {
      await axios.post('http://localhost:3000/equipos', {
        activoFijo: nuevoEquipo.activoFijo,
        tipo: nuevoEquipo.tipo,
        modelo: nuevoEquipo.modelo,
        marca: nuevoEquipo.marca,
        serial: nuevoEquipo.serial,
        serviceTag: nuevoEquipo.serviceTag,
        estado: 'DISPONIBLE',
      })

      // Refrescamos la lista para que aparezca el nuevo registro
      await fetchEquipos()

      // Limpiamos el formulario y cerramos el modal
      setNuevoEquipo({
        activoFijo: '',
        tipo: '',
        modelo: '',
        marca: '',
        serial: '',
        serviceTag: '',
        estado: 'DISPONIBLE',
      })
      setOpen(false)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al guardar:', error)
      alert('Hubo un error al guardar el equipo en el servidor.')
    }
  }

  const equiposFiltrados = useMemo(() => {
    return equipos.filter(
      (e) =>
        e.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.activoFijo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.serial?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [equipos, searchTerm])

  const getIcon = (tipo: string) => {
    if (!tipo) return <Tag size={14} />

    const n = tipo.toLowerCase()
    // Si el nombre contiene "dsadsad" (o cualquier texto de prueba)
    // podrías asignarle un icono por defecto o mejorar los filtros
    if (n.includes('laptop') || n.includes('dell') || n.includes('dfdsf'))
      return <Laptop size={14} />
    if (n.includes('monitor')) return <Monitor size={14} />
    return <Tag size={14} />
  }

  const procesarArchivoExcel = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const parsedData =
        XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet)

      // AQUÍ ES DONDE LLAMAS A TU FUNCIÓN
      handleImportExcel(parsedData)
    }
    reader.readAsBinaryString(file)
  }

  return (
    <Main fixed>
      {/* CABECERA */}
      <div className='flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Inventario de Equipos
          </h2>
          <p className='text-sm font-medium tracking-wider text-blue-500 uppercase'>
            Control de Activos IT - AILA
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <div className='relative w-full sm:w-64'>
            <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Buscar por Activo, Serial...'
              className='flex h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-1 pl-9 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className='flex gap-2'>
            {/* Input oculto para manejar el archivo */}
            <input
              type='file'
              id='import-excel'
              className='hidden'
              accept='.xlsx, .xls'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // Aquí es donde USAS la función para que el error desaparezca
                  procesarArchivoExcel(file)
                }
              }}
            />

            <Button
              variant='outline'
              onClick={() => document.getElementById('import-excel')?.click()}
            >
              Importar Excel
            </Button>
          </div>

          <ThemeSwitch />

          <Button
            size='sm'
            variant='outline'
            className='h-9 w-9 p-0'
            onClick={fetchEquipos}
            disabled={loading}
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>

          {/* MODAL CON FORMULARIO */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size='sm'
                className='bg-blue-600 font-bold text-white hover:bg-blue-700'
              >
                <Plus size={18} className='mr-1' /> Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-125'>
              <DialogHeader>
                <DialogTitle>Registrar Equipo en Almacén</DialogTitle>
                {/* Esta línea invisible quita el warning amarillo de la consola */}
                <DialogDescription className='sr-only'>
                  Registro tecnico para el inventario del AILA.
                </DialogDescription>
              </DialogHeader>

              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='activo' className='text-right'>
                    Activo Fijo
                  </Label>
                  <Input
                    id='activo'
                    className='col-span-3'
                    placeholder='Ej: AILA-IT-001'
                    value={nuevoEquipo.activoFijo}
                    onChange={(e) =>
                      setNuevoEquipo({
                        ...nuevoEquipo,
                        activoFijo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='tipo' className='text-right'>
                    Tipo
                  </Label>
                  <Input
                    id='tipo'
                    className='col-span-3'
                    placeholder='Ej: Laptop Dell Latitude'
                    value={nuevoEquipo.tipo}
                    onChange={(e) =>
                      setNuevoEquipo({ ...nuevoEquipo, tipo: e.target.value })
                    }
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='marca' className='text-right'>
                    Marca
                  </Label>
                  <Input
                    id='marca'
                    className='col-span-3'
                    placeholder='Dell, HP, Lenovo...'
                    value={nuevoEquipo.marca}
                    onChange={(e) =>
                      setNuevoEquipo({
                        ...nuevoEquipo,
                        marca: e.target.value,
                      })
                    }
                  />
                </div>

                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='modelo' className='text-right'>
                    Modelo
                  </Label>
                  <Input
                    id='modelo'
                    className='col-span-3'
                    placeholder='Ej: Latitude 5420'
                    value={nuevoEquipo.modelo}
                    onChange={(e) =>
                      setNuevoEquipo({
                        ...nuevoEquipo,
                        modelo: e.target.value,
                      })
                    }
                  />
                </div>

                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='serial' className='text-right'>
                    Serial
                  </Label>
                  <Input
                    id='serial'
                    className='col-span-3'
                    placeholder='Service Tag o Serial Number'
                    value={nuevoEquipo.serial}
                    onChange={(e) =>
                      setNuevoEquipo({
                        ...nuevoEquipo,
                        serial: e.target.value,
                      })
                    }
                  />
                </div>

                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='serial' className='text-right'>
                    Services Tag
                  </Label>
                  <Input
                    id='TAG'
                    className='col-span-3'
                    placeholder='Service Tag o Serial Number'
                    value={nuevoEquipo.serviceTag}
                    onChange={(e) =>
                      setNuevoEquipo({
                        ...nuevoEquipo,
                        serviceTag: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant='outline' onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button className='bg-blue-600' onClick={handleGuardar}>
                  Guardar en Almacén
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* CUERPO DE LA TABLA */}
      <div className='space-y-4 p-4 md:p-6'>
        <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <div className='w-full overflow-x-auto'>
            <Table className='w-full'>
              <TableHeader className='bg-muted/50'>
                <TableRow>
                  <TableHead className='py-4 font-bold'>ACTIVO FIJO</TableHead>
                  <TableHead className='font-bold'>EQUIPO Y MARCA</TableHead>
                  <TableHead className='text-center font-bold'>
                    SERIAL
                  </TableHead>
                  {/* 1. Asegúrate de que este Service Tag esté aquí */}
                  <TableHead className='text-center font-bold'>
                    SERVICE TAG
                  </TableHead>
                  <TableHead className='text-center font-bold'>
                    ESTADO
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-40 text-center'>
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : (
                  equiposFiltrados.map((equipo) => (
                    <TableRow
                      key={equipo.id}
                      className='transition-colors hover:bg-muted/30'
                    >
                      <TableCell className='font-mono text-xs font-bold text-blue-600'>
                        {equipo.activoFijo}
                      </TableCell>

                      <TableCell>
                        <div className='text-sm font-bold'>{equipo.tipo}</div>
                        <div className='mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase'>
                          {getIcon(equipo.tipo)} {equipo.marca} -{' '}
                          {equipo.modelo}
                        </div>
                      </TableCell>

                      {/* 2. Columna de Serial */}
                      <TableCell className='text-center text-xs text-muted-foreground'>
                        {equipo.serial || '---'}
                      </TableCell>

                      {/* 3. ¡ESTA ES LA QUE FALTA! Agregamos la celda del Service Tag */}
                      <TableCell className='text-center text-xs font-medium text-muted-foreground'>
                        {equipo.serviceTag || '---'}
                      </TableCell>

                      {/* 4. Ahora el Estado caerá justo debajo de su encabezado */}
                      <TableCell className='text-center'>
                        <Badge
                          variant='outline'
                          className={`text-[10px] font-bold ${
                            equipo.estado === 'ASIGNADO'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {equipo.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Main>
  )
}
