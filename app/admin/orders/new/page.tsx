import { requireAdmin } from '@/lib/auth';
import NewOrderForm from './NewOrderForm';

export default async function NewOrderPage() {
  await requireAdmin();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Create New Order</h1>
      <NewOrderForm />
    </div>
  );
}
