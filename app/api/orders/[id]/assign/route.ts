import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const assignSchema = z.object({
  teamId: z.string(),
  scheduledDate: z.string(), // ISO date string
  estimatedDays: z.number().min(1).max(30),
});

// Helper function to check for date conflicts
async function checkDateConflict(
  teamId: string, 
  scheduledDate: Date, 
  estimatedDays: number,
  excludeOrderId?: string
): Promise<{ hasConflict: boolean; conflictingOrder?: { id: string; customerName: string; scheduledDate: Date; estimatedDays: number } }> {
  // Calculate the date range for the new order
  const newOrderStart = new Date(scheduledDate);
  newOrderStart.setHours(0, 0, 0, 0);
  
  const newOrderEnd = new Date(scheduledDate);
  newOrderEnd.setDate(newOrderEnd.getDate() + estimatedDays - 1);
  newOrderEnd.setHours(23, 59, 59, 999);

  // Find all orders for this team that have scheduled dates
  const existingOrders = await prisma.order.findMany({
    where: {
      assignedTeamId: teamId,
      scheduledDate: { not: null },
      estimatedDays: { not: null },
      status: { notIn: ['DONE'] }, // Only check non-completed orders
      ...(excludeOrderId ? { id: { not: excludeOrderId } } : {}),
    },
    select: {
      id: true,
      customerName: true,
      scheduledDate: true,
      estimatedDays: true,
    },
  });

  // Check for overlaps
  for (const order of existingOrders) {
    if (!order.scheduledDate || !order.estimatedDays) continue;

    const existingStart = new Date(order.scheduledDate);
    existingStart.setHours(0, 0, 0, 0);
    
    const existingEnd = new Date(order.scheduledDate);
    existingEnd.setDate(existingEnd.getDate() + order.estimatedDays - 1);
    existingEnd.setHours(23, 59, 59, 999);

    // Check if ranges overlap
    if (newOrderStart <= existingEnd && newOrderEnd >= existingStart) {
      return {
        hasConflict: true,
        conflictingOrder: {
          id: order.id,
          customerName: order.customerName,
          scheduledDate: order.scheduledDate,
          estimatedDays: order.estimatedDays,
        },
      };
    }
  }

  return { hasConflict: false };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const body = await request.json();
    const { teamId, scheduledDate, estimatedDays } = assignSchema.parse(body);

    // Parse the scheduled date
    const parsedDate = new Date(scheduledDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Verify team exists and has an installer
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (!team.installerUserId) {
      return NextResponse.json({ error: 'Team has no installer' }, { status: 400 });
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check for date conflicts with other orders for this team
    const conflict = await checkDateConflict(teamId, parsedDate, estimatedDays, id);
    if (conflict.hasConflict && conflict.conflictingOrder) {
      return NextResponse.json({ 
        error: 'Date conflict with another order',
        conflictingOrder: {
          id: conflict.conflictingOrder.id,
          customerName: conflict.conflictingOrder.customerName,
          scheduledDate: conflict.conflictingOrder.scheduledDate,
          estimatedDays: conflict.conflictingOrder.estimatedDays,
        }
      }, { status: 409 });
    }

    // Assign order to team and installer with scheduling info
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        assignedTeamId: teamId,
        assignedUserId: team.installerUserId,
        scheduledDate: parsedDate,
        estimatedDays: estimatedDays,
        status: 'ASSIGNED',
      },
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
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
