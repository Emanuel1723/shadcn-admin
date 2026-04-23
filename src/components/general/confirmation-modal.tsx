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

