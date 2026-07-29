import { Suspense } from 'react';
import { WorkflowsPage } from '../../../../../components/admin/WorkflowsPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <WorkflowsPage />
    </Suspense>
  );
}
