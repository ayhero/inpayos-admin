// Re-export existing preview step component temporarily
import { PreviewStep as OriginalPreviewStep } from '../merchant-steps/PreviewStep';
import { UserType } from '../CreateUserModal';

interface PreviewStepProps {
  data: any;
  updateData: (field: string, data: any) => void;
  userType: UserType;
}

export function PreviewStep({ data, userType }: PreviewStepProps) {
  // Transform data structure to match original PreviewStep expectations
  const transformedData = {
    merchantInfo: data.userInfo,
    accounts: data.accounts,
    contracts: data.contracts,
    routers: data.routers
  };

  return (
    <OriginalPreviewStep 
      data={transformedData}
    />
  );
}