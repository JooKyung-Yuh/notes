import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  isAdmin?: boolean
}

interface Session {
  user: User | null
}

async function resetUserPassword(userId: string, formData: FormData) {
  'use server'
  const hashedPassword = await hash('admin123', 12)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })
}

export default async function AdminPage() {
  const session = (await getServerSession(authOptions)) as Session | null

  if (!session?.user?.isAdmin) {
    redirect('/')
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      isAdmin: true,
    },
  })

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    {user.isAdmin ? 'Admin' : 'User'}
                  </td>
                  <td className="px-4 py-2">
                    <form action={resetUserPassword.bind(null, user.id)}>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Reset Password
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
