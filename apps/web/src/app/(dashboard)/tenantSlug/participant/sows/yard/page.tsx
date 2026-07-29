import { Suspense } from 'react';
import { SowsYardPage } from '../../../../../../components/participant/SowsYardPage';

export default function ParticipantSowsYardPage() {
  return (
    <Suspense fallback={null}>
      <SowsYardPage />
    </Suspense>
  );
}
