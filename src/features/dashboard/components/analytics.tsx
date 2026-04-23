import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Overview } from './overview'

export function Analytics() {
  return (
    <div className='grid gap-4'>
      {/* Historial de Movimientos de Equipos */}
      <div className='grid gap-4 grid-cols-1'>
        <Card className='col-span-full'>
          <CardHeader>
            <CardTitle>Historial de Movimientos</CardTitle>
            <CardDescription>
              Flujo mensual de entradas y salidas de laptops y desktops del inventario.
            </CardDescription>
          </CardHeader>
          <CardContent className='pl-2'>
            <Overview />
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        {/* Resumen de Asignación */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Asignación</CardTitle>
            <CardDescription>Distribución actual del personal con equipo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>6 Colaboradores</div>
            <p className='text-xs text-muted-foreground'>Todos con equipos asignados actualmente.</p>
          </CardContent>
        </Card>

        {/* Resumen de Modelos */}
        <Card>
          <CardHeader>
            <CardTitle>Modelos Registrados</CardTitle>
            <CardDescription>Variedad de hardware en el sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>Modelos</div>
            <p className='text-xs text-muted-foreground'>Predominancia de equipos Dell.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}