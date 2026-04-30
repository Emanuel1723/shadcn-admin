export interface Equipo {
  id: number
  activoFijo: string
  tipo: string // Cambiado de 'nombre' a 'tipo' para mayor claridad técnica
  marca: string
  modelo: string
  serial: string // Se mantiene para CPUs y periféricos
  serviceTag: string // Campo específico para laptops/Dell
  estado: 'DISPONIBLE' | 'ASIGNADO' | 'MANTENIMIENTO'
  colaboradorId?: number
  colaborador?: {
    nombre: string
    departamento: string
  }
}
