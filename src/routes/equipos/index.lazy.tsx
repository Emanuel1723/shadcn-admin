// src/routes/_authenticated/colaboradores.lazy.tsx
import { createLazyFileRoute } from '@tanstack/react-router'
import { EquiposPage } from '../_authenticated/-components/equipos-view'

export const Route = createLazyFileRoute('/equipos/')({
  component: EquiposPage,
})
