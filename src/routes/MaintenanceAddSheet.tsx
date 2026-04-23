import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'

export function MaintenanceAddSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' /> Añadir Mantenimiento
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nuevo Mantenimiento</SheetTitle>
          <SheetDescription>
            Registra un nuevo servicio técnico para los equipos del aeropuerto.
          </SheetDescription>
        </SheetHeader>
        
        <div className='grid gap-4 py-4'>
          {/* Selección de Equipo */}
          <div className='grid gap-2'>
            <Label htmlFor='equipo'>Equipo / Service Tag</Label>
            <Input id='equipo' placeholder='Ej: Dell Latitude - 7XJ2K93' />
          </div>

          {/* Tipo de Mantenimiento */}
          <div className='grid gap-2'>
            <Label htmlFor='tipo'>Tipo de Servicio</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preventivo">Preventivo</SelectItem>
                <SelectItem value="correctivo">Correctivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha */}
          <div className='grid gap-2'>
            <Label htmlFor='fecha'>Fecha Programada</Label>
            <Input id='fecha' type='date' />
          </div>

          {/* Técnico */}
          <div className='grid gap-2'>
            <Label htmlFor='tecnico'>Técnico Responsable</Label>
            <Input id='tecnico' placeholder='Nombre del técnico' />
          </div>

          {/* Observaciones */}
          <div className='grid gap-2'>
            <Label htmlFor='obs'>Observaciones Iniciales</Label>
            <Textarea 
              id='obs' 
              placeholder='Describe el estado del equipo o la falla...' 
              className='resize-none'
            />
          </div>
        </div>

        <SheetFooter className='mt-6'>
          <SheetClose asChild>
            <Button variant='outline' className='w-full sm:w-auto'>Cancelar</Button>
          </SheetClose>
          <Button type='submit' className='w-full sm:w-auto'>Guardar Registro</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}