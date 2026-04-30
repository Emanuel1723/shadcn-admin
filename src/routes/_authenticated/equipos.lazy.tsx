// src/routes/_authenticated/equipos.lazy.tsx
import { createLazyFileRoute } from '@tanstack/react-router'
import { EquiposPage } from './-components/equipos-view'

export const Route = createLazyFileRoute('/_authenticated/equipos')({
  component: EquiposPage,
})
