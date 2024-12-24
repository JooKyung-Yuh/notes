import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

async function resetUserPassword(userId: string) {
  'use server'
  const hashedPassword = await hash('admin123', 12)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect('/dashboard')
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: {
        select: { memos: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Joined</th>
              <th className="py-3 px-4 text-left">Memos</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b dark:border-gray-700">
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.name || '-'}</td>
                <td className="py-3 px-4">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">{user._count.memos}</td>
                <td className="py-3 px-4">
                  <form action={resetUserPassword.bind(null, user.id)}>
                    <button
                      type="submit"
                      className="text-sm text-blue-500 hover:text-blue-600"
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
  )
}
