import { Suspense } from 'react';
import { EditSowRoute } from '../../../../../../components/admin/sows/EditSowRoute';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <EditSowRoute />
    </Suspense>
  );
}
