import { useAuth } from './AuthContext'

export function useRole() {
  const { user, switchRole } = useAuth()
  const role = (user?.rol || 'EFECTOR').toLowerCase()
  return {
    role,
    setRole: (r: string) => switchRole(r.toUpperCase() as any),
  }
}

export default useRole
