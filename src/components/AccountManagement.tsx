import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FleetTeamAccount } from './FleetTeamAccount';
import { CashierMemberAccount } from './CashierMemberAccount';

export function AccountManagement() {
  const [activeTab, setActiveTab] = useState('fleet');

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">账户管理</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="fleet">车队账户</TabsTrigger>
          <TabsTrigger value="cashier">出纳员账户</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fleet" className="mt-6">
          <FleetTeamAccount />
        </TabsContent>
        
        <TabsContent value="cashier" className="mt-6">
          <CashierMemberAccount />
        </TabsContent>
      </Tabs>
    </div>
  );
}
