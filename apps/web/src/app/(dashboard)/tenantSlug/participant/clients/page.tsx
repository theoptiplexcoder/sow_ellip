import { Suspense } from 'react';
import { ClientsPage } from '../../../../../components/admin/ClientsPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientsPage />
    </Suspense>
  );
}
