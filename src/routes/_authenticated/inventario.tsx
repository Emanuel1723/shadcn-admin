import { createFileRoute } from '@tanstack/react-router'
import { InventarioPage } from './-components/inventario-view'

export const Route = createFileRoute('/_authenticated/inventario')({
  component: InventarioPage,
})
