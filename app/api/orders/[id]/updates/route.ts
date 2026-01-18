import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOrderAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createUpdateSchema = z.object({
  type: z.enum(['PROGRESS', 'BLOCKER', 'COMPLETE', 'NOTE']),
  message: z.string().min(1),
  needs: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireOrderAccess(id);

    const updates = await prisma.jobUpdate.findMany({
      where: { orderId: id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ updates });
  } catch (error) {
    if (error instanceof Error && error.message === 'Access denied') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireOrderAccess(id);
    
    const body = await request.json();
    const data = createUpdateSchema.parse(body);

    // Installers can only add updates to their own orders
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

    const update = await prisma.jobUpdate.create({
      data: {
        orderId: id,
        createdByUserId: user.id,
        ...data,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ update }, { status: 201 });
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
