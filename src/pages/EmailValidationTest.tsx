import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { EmailInputWithValidation } from '../components/ui/email-input-with-validation';
import { Button } from '../components/ui/button';

export function EmailValidationTest() {
  const [email, setEmail] = useState('');
  const [validationState, setValidationState] = useState({
    isValid: false,
    isAvailable: false
  });

  const handleEmailValidationChange = (isValid: boolean, isAvailable: boolean) => {
    setValidationState({ isValid, isAvailable });
    console.log('Email validation state:', { isValid, isAvailable, email });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>邮箱验证功能测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EmailInputWithValidation
            label="测试邮箱"
            placeholder="请输入邮箱进行验证测试"
            value={email}
            onChange={setEmail}
            required={true}
            onValidationChange={handleEmailValidationChange}
          />
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">验证状态</h3>
            <div className="text-sm space-y-1">
              <div>邮箱内容: {email || '(空)'}</div>
              <div>格式有效: {validationState.isValid ? '✅ 是' : '❌ 否'}</div>
              <div>邮箱可用: {validationState.isAvailable ? '✅ 可用' : '❌ 不可用'}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">测试用例</h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmail('test@example.com')}
              >
                有效邮箱
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmail('invalid-email')}
              >
                无效格式
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmail('admin@example.com')}
              >
                已存在邮箱
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmail('')}
              >
                清空
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}