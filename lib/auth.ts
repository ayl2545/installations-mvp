import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('dev-user-id')?.value;
  
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      assignedOrders: true,
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    redirect('/');
  }
  return user;
}

export async function requireOrderAccess(orderId: string) {
  const user = await requireAuth();
  
  // Admin can access any order
  if (user.role === 'ADMIN') {
    return user;
  }

  // Installer can only access their own orders
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Check if order is assigned to this user or their team
  if (order.assignedUserId !== user.id && order.assignedTeamId !== user.teamId) {
    throw new Error('Access denied');
  }

  return user;
}
