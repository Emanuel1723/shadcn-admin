import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function RecentSales() {
  return (
    <div className='space-y-8'>
      {/* Ejemplo de un colaborador real o genérico del AILA */}
      <div className='flex items-center gap-4'>
        <Avatar className='h-9 w-9'>
          <AvatarImage src='/avatars/01.png' alt='Avatar' />
          <AvatarFallback>EG</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Emanuel González</p>
            <p className='text-sm text-muted-foreground'>
              Soporte Técnico - AILA
            </p>
          </div>
          <div className='text-xs font-medium text-muted-foreground'>Laptop Dell</div>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <Avatar className='flex h-9 w-9 items-center justify-center space-y-0 border'>
          <AvatarImage src='/avatars/02.png' alt='Avatar' />
          <AvatarFallback>OV</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Ovimer</p>
            <p className='text-sm text-muted-foreground'>
              Supervisor IT
            </p>
          </div>
          <div className='text-xs font-medium text-muted-foreground'>Laptop HP</div>
        </div>
      </div>

      {/* Puedes seguir agregando a tus otros 4 colaboradores aquí */}
      <div className='flex items-center gap-4 text-muted-foreground italic text-xs justify-center pt-4'>
        Mostrando últimas asignaciones de personal.
      </div>
    </div>
  )
}