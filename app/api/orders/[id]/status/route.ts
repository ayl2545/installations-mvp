import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOrderAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusSchema = z.object({
  status: z.enum(['ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'DONE']),
  blockedReason: z.string().optional(), // Required when status is BLOCKED
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireOrderAccess(id);
    
    const body = await request.json();
    const { status, blockedReason } = statusSchema.parse(body);

    // Validate that blockedReason is provided when status is BLOCKED
    if (status === 'BLOCKED' && (!blockedReason || blockedReason.trim() === '')) {
      return NextResponse.json({ 
        error: 'Blocked reason is required when setting status to BLOCKED' 
      }, { status: 400 });
    }

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

    // Use transaction to update status and create blocker update if needed
    const result = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
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

      // If status is BLOCKED, create a BLOCKER job update automatically
      if (status === 'BLOCKED' && blockedReason) {
        await tx.jobUpdate.create({
          data: {
            orderId: id,
            createdByUserId: user.id,
            type: 'BLOCKER',
            message: blockedReason,
          },
        });
      }

      return updatedOrder;
    });

    return NextResponse.json({ order: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    if (error instanceof Error && (error.message === 'Access denied' || error.message === 'Admin access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
