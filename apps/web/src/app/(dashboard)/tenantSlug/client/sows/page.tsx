import { Suspense } from 'react';
import { SowsPage } from '../../../../../components/client/SowsPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SowsPage />
    </Suspense>
  );
}
