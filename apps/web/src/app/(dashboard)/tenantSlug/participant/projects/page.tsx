import { Suspense } from 'react';
import { ProjectsPage } from '../../../../../components/admin/ProjectsPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProjectsPage />
    </Suspense>
  );
}
