import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const createOrderSchema = z.object({
  customerName: z.string().min(1),
  siteAddress: z.string().min(1),
  description: z.string().min(1),
  externalRef: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const teamId = searchParams.get('teamId');

    // Admin sees all orders, installer sees only their own
    if (user.role === 'ADMIN') {
      const where: Prisma.OrderWhereInput = {};
      if (status) {
        where.status = status as Prisma.OrderWhereInput['status'];
      }
      if (teamId) {
        where.assignedTeamId = teamId;
      }

      const orders = await prisma.order.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ orders });
    } else {
      // Installer: only their assigned orders
      const where: Prisma.OrderWhereInput = {
        OR: [
          { assignedUserId: user.id },
          { assignedTeamId: user.teamId },
        ],
      };
      if (status) {
        where.status = status as Prisma.OrderWhereInput['status'];
      }

      const orders = await prisma.order.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ orders });
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    const order = await prisma.order.create({
      data,
    });

    return NextResponse.json({ order }, { status: 201 });
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
