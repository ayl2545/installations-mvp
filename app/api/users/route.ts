import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  teamId: z.string(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { name, email, teamId } = createUserSchema.parse(body);

    // Verify team exists and doesn't already have an installer
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.installerUserId) {
      return NextResponse.json({ error: 'Team already has an installer' }, { status: 400 });
    }

    // Create installer user
    const user = await prisma.user.create({
      data: {
        name,
        email: email || undefined,
        role: 'INSTALLER',
        teamId,
      },
    });

    // Link user to team as installer
    await prisma.team.update({
      where: { id: teamId },
      data: { installerUserId: user.id },
    });

    return NextResponse.json({ user }, { status: 201 });
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
