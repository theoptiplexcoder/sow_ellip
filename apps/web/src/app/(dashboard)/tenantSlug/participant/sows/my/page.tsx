import { Suspense } from 'react';
import { SowsPage } from '../../../../../../components/participant/SowsPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SowsPage hideCreateButton={true} />
    </Suspense>
  );
}
