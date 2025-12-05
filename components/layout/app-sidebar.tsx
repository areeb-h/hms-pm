'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  Activity,
  Building,
  ChevronUp,
  FileText,
  Home,
  LogOut,
  Stethoscope,
  User,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'

// Hospital Logo Component
function HospitalLogo() {
  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
        <Stethoscope className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">MediCare HMS</span>
        <span className="truncate text-xs text-muted-foreground">Hospital Management</span>
      </div>
    </div>
  )
}

// User Nav Component
function UserNav({ user }: { user: { name: string; email: string; role: string } | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      const { logoutAction } = await import('@/app/login/actions')
      await logoutAction()
      router.push('/login')
    })
  }

  const initials =
    user?.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user?.name || 'Guest'}</span>
            <span className="truncate text-xs text-muted-foreground capitalize">
              {user?.role || 'User'}
            </span>
          </div>
          <ChevronUp className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuItem disabled>
          <User className="mr-2 h-4 w-4" />
          {user?.email || 'N/A'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isPending}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppSidebar({
  user,
}: {
  user: { name: string; email: string; role: string } | null
}) {
  const pathname = usePathname()

  // Main navigation items
  const mainNavItems = [
    {
      title: 'Dashboard',
      url: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      title: 'Patients',
      url: '/patients',
      icon: User,
      isActive: pathname === '/patients',
    },
  ]

  // Management navigation items
  const managementItems = [
    {
      title: 'Doctors',
      url: '/doctors',
      icon: Stethoscope,
      isActive: pathname === '/doctors',
    },
    {
      title: 'Wards',
      url: '/wards',
      icon: Building,
      isActive: pathname === '/wards',
    },
    {
      title: 'Teams',
      url: '/teams',
      icon: Users,
      isActive: pathname === '/teams',
    },
  ]

  // Clinical navigation items
  const clinicalItems = [
    {
      title: 'Treatments',
      url: '/treatment',
      icon: Activity,
      isActive: pathname === '/treatment',
    },
    ...(user?.role === 'superadmin'
      ? [
          {
            title: 'Audit Logs',
            url: '/audit-logs',
            icon: FileText,
            isActive: pathname === '/audit-logs',
          },
        ]
      : []),
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <HospitalLogo />
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Clinical Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Clinical</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clinicalItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserNav user={user} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
