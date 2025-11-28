// Re-export existing contract step component temporarily
import { ContractStep as OriginalContractStep } from '../merchant-steps/ContractStepNew';
import { UserType } from '../CreateUserModal';

interface ContractStepProps {
  data: any;
  updateData: (field: string, data: any) => void;
  userType: UserType;
}

export function ContractStep({ data, updateData, userType }: ContractStepProps) {
  // Adapt the original contract step to work with our new interface
  const handleChange = (contracts: any) => {
    updateData('contracts', contracts);
  };

  return (
    <OriginalContractStep 
      data={data.contracts} 
      onChange={handleChange}
    />
  );
}