import {
  LayoutDashboard,
  Laptop, 
  Users,
  Wrench,
  Settings,
  Command,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Emanuel González',
    email: 'Windel6789@Gmail.com',
    avatar: '/avatars/emanuel.jpg',
  },
  teams: [
    {
      name: 'Inventario IT - AILA',
      logo: Command,
      plan: 'Soporte Técnico',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Equipos',
          url: '/equipos',
          icon: Laptop,
        },
        {
          title: 'Colaboradores',
          url: '/colaboradores',
          icon: Users,
        },
      ],
    },
    {
      title: 'Administración',
      items: [
        {
          title: 'Mantenimiento',
          url: '/mantenimiento',
          icon: Wrench,
        },
        {
          title: 'Configuración',
          url: '/settings',
          icon: Settings,
        },
      ],
    },
  ],
}