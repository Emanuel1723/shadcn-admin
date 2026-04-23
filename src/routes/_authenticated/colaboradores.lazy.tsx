// src/routes/_authenticated/colaboradores.lazy.tsx
import { createLazyFileRoute } from '@tanstack/react-router'
import { ColaboradoresView } from './-components/colaboradores-view'

export const Route = createLazyFileRoute('/_authenticated/colaboradores')({
  component: ColaboradoresView,
})
