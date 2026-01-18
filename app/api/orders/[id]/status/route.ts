import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOrderAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusSchema = z.object({
  status: z.enum(['ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'DONE']),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireOrderAccess(id);
    
    const body = await request.json();
    const { status } = statusSchema.parse(body);

    // Installers can only update status for their own orders
    if (user.role === 'INSTALLER') {
      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (order.assignedUserId !== user.id && order.assignedTeamId !== user.teamId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        assignedTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    if (error instanceof Error && (error.message === 'Access denied' || error.message === 'Admin access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
