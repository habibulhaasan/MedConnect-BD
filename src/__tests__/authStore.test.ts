import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/stores/authStore'

// Reset Zustand store between tests
beforeEach(() => {
  useAuthStore.getState().clearAuth()
})

describe('useAuthStore', () => {
  it('initializes with null user and member', () => {
    const { result } = renderHook(() => useAuthStore())
    expect(result.current.user).toBeNull()
    expect(result.current.member).toBeNull()
    expect(result.current.isAdmin).toBe(false)
  })

  it('setUser updates user', () => {
    const { result } = renderHook(() => useAuthStore())
    const mockUser = { uid: 'test-uid', email: 'test@test.com' } as never

    act(() => { result.current.setUser(mockUser) })
    expect(result.current.user).toEqual(mockUser)
  })

  it('setIsAdmin updates isAdmin', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => { result.current.setIsAdmin(true) })
    expect(result.current.isAdmin).toBe(true)
  })

  it('clearAuth resets all state', () => {
    const { result } = renderHook(() => useAuthStore())
    const mockUser = { uid: 'test-uid' } as never

    act(() => {
      result.current.setUser(mockUser)
      result.current.setIsAdmin(true)
    })

    act(() => { result.current.clearAuth() })

    expect(result.current.user).toBeNull()
    expect(result.current.member).toBeNull()
    expect(result.current.isAdmin).toBe(false)
  })
})