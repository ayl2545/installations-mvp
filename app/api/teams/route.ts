import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createTeamSchema = z.object({
  name: z.string().min(1),
});

export async function GET() {
  try {
    await requireAdmin();
    
    const teams = await prisma.team.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Fetch installer users for each team
    const teamsWithInstallers = await Promise.all(
      teams.map(async (team) => {
        const installer = team.installerUserId
          ? await prisma.user.findUnique({
              where: { id: team.installerUserId },
              select: {
                id: true,
                name: true,
                email: true,
              },
            })
          : null;
        return { ...team, installer };
      })
    );

    return NextResponse.json({ teams: teamsWithInstallers });
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { name } = createTeamSchema.parse(body);

    const team = await prisma.team.create({
      data: { name },
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
