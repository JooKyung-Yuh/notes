export function isAdmin(email: string | null | undefined) {
  return email === process.env.ADMIN_EMAIL
}
