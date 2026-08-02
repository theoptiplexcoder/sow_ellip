'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@sow-platform/ui';
import {
  setOrganizationStatus,
  type Organization,
} from '@/lib/data/organizations';

export function OrganizationStatusAction({
  organization,
}: {
  organization: Organization;
}) {
  const router = useRouter();
  const willDisable = organization.status === 'active';

  function handleConfirm() {
    setOrganizationStatus(organization.id, willDisable ? 'disabled' : 'active');
    toast.success(
      `${organization.name} ${willDisable ? 'disabled' : 'enabled'}`,
    );
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant={willDisable ? 'destructive' : 'default'} />}
      >
        {willDisable ? 'Disable' : 'Enable'} Organization
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {willDisable ? 'Disable' : 'Enable'} {organization.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {willDisable
              ? 'Tenant Admin and all Participants will immediately lose access to the platform.'
              : 'This will restore platform access for this organization.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
