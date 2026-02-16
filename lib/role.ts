export function getUserRole(): string {
  // This is a client-side helper
  // For server-side, use the auth.ts version
  return 'engineer'
}

export function isAdmin(role: string): boolean {
  return role === 'admin'
}
