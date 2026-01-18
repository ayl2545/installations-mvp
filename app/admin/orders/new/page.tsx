import { requireAdmin } from '@/lib/auth';
import NewOrderForm from './NewOrderForm';

export default async function NewOrderPage() {
  await requireAdmin();
  return <NewOrderForm />;
}
