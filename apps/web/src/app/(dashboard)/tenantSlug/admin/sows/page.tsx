import { Suspense } from 'react';
import { SowsPage } from '../../../../../components/admin/SowsPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SowsPage />
    </Suspense>
  );
}
