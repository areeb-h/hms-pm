'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { loginAction } from './actions'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }

    startTransition(async () => {
      const result = await loginAction({ email, password })

      if (result.success) {
        toast.success('Login successful!')
        router.push('/')
      } else {
        toast.error(result.message || 'Invalid credentials')
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Header */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="h-8 w-8" />
            <h1 className="text-2xl font-bold">HMS</h1>
          </div>
          <p className="text-sm text-muted-foreground">Hospital Management System</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@hospital.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Demo Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="space-y-1">
              <p className="font-medium">Super Admin:</p>
              <p className="text-muted-foreground">superadmin@hospital.com / super123</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Admin:</p>
              <p className="text-muted-foreground">admin@hospital.com / admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
