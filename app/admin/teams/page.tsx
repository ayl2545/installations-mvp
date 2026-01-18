import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TeamsClient from './TeamsClient';

export default async function TeamsPage() {
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

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Teams</h1>
      <TeamsClient teams={teamsWithInstallers} />
    </div>
  );
}
