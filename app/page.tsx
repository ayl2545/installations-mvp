import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Installations MVP</h1>
        <p>Please select a user from the dev auth selector above.</p>
      </div>
    );
  }

  if (user.role === 'ADMIN') {
    redirect('/admin/orders');
  } else {
    redirect('/team/orders');
  }
}
