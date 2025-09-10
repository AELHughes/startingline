import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/supabase-api'
import { useAuth } from '@/contexts/auth-context'

// Login mutation
export const useLogin = () => {
  const { login } = useAuth()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return await login(email, password)
    },
    onError: (error) => {
      console.error('❌ Login failed:', error)
    }
  })
}

// Register mutation
export const useRegister = () => {
  const { register } = useAuth()

  return useMutation({
    mutationFn: async (userData: any) => {
      return await register(userData)
    },
    onError: (error) => {
      console.error('❌ Registration failed:', error)
    }
  })
}

// Logout mutation
export const useLogout = () => {
  const { logout } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await authApi.logout()
      logout()
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear()
    }
  })
}

// Get current user (from context)
export const useCurrentUser = () => {
  const { user, isLoading } = useAuth()
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user
  }
}

// Check if user has specific role
export const useUserRole = (requiredRole?: string) => {
  const { user } = useAuth()
  
  return {
    user,
    hasRole: requiredRole ? user?.role === requiredRole : true,
    isOrganiser: user?.role === 'organiser',
    isAdmin: user?.role === 'admin',
    isParticipant: user?.role === 'participant'
  }
}
