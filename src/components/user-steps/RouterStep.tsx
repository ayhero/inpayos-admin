// Re-export existing router step component temporarily
import { RouterStep as OriginalRouterStep } from '../merchant-steps/RouterStepNew';
import { UserType } from '../CreateUserModal';

interface RouterStepProps {
  data: any;
  updateData: (field: string, data: any) => void;
  userType: UserType;
}

export function RouterStep({ data, updateData, userType }: RouterStepProps) {
  // Adapt the original router step to work with our new interface
  const handleChange = (routers: any) => {
    updateData('routers', routers);
  };

  return (
    <OriginalRouterStep 
      data={data.routers} 
      onChange={handleChange}
    />
  );
}