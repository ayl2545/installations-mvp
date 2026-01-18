import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import HomeClient from './HomeClient';

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return <HomeClient />;
  }

  if (user.role === 'ADMIN') {
    redirect('/admin/orders');
  } else {
    redirect('/team/orders');
  }
}
