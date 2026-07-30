import { Suspense } from 'react';
import { EditSowRoute } from '../../../../../../components/participant/EditSowRoute';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <EditSowRoute />
    </Suspense>
  );
}
