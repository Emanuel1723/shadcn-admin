import { createFileRoute } from '@tanstack/react-router'
import { MantenimientoView } from './-components/mantenimiento-view'

export const Route = createFileRoute('/_authenticated/mantenimiento')({
  component: MantenimientoView,
})
