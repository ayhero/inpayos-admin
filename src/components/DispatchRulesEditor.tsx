import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

// 规则字段定义
interface RuleFieldConfig {
  key: string;
  label: string;
  type: 'boolean' | 'string' | 'number' | 'percentage' | 'array' | 'amount';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
}

// 规则配置
const RULE_FIELDS: RuleFieldConfig[] = [
  // 用户级别过滤
  {
    key: 'user_online_required',
    label: '用户在线',
    type: 'boolean',
  },
  {
    key: 'user_status_required',
    label: '用户状态',
    type: 'array',
    options: [
      { value: 'active', label: '启用' },
      { value: 'inactive', label: '禁用' },
    ],
  },
  {
    key: 'user_payin_status',
    label: '用户代收状态',
    type: 'array',
    options: [
      { value: 'active', label: '启用' },
      { value: 'inactive', label: '禁用' },
    ],
  },
  {
    key: 'user_payout_status',
    label: '用户代付状态',
    type: 'array',
    options: [
      { value: 'active', label: '启用' },
      { value: 'inactive', label: '禁用' },
    ],
  },
  // 账户级别过滤
  {
    key: 'account_online_required',
    label: '账户在线',
    type: 'boolean',
  },
  {
    key: 'account_status_required',
    label: '账户状态',
    type: 'array',
    options: [
      { value: 'active', label: '启用' },
      { value: 'inactive', label: '禁用' },
    ],
  },
  {
    key: 'account_payin_status',
    label: '账户代收状态',
    type: 'array',
    options: [
      { value: 'active', label: '启用' },
      { value: 'inactive', label: '禁用' },
    ],
  },
  {
    key: 'account_payout_status',
    label: '账户代付状态',
    type: 'array',
    options: [
      { value: 'active', label: '启用' },
      { value: 'inactive', label: '禁用' },
    ],
  },
  // 余额检查
  {
    key: 'min_balance_ratio',
    label: '最小余额倍数',
    type: 'number',
    placeholder: '例如: 1.5',
    min: 0,
    step: 0.1,
  },
  // UPI冲突检查
  {
    key: 'prevent_same_upi',
    label: '防止相同UPI',
    type: 'boolean',
  },
  // 交易限额检查
  {
    key: 'enforce_trx_config',
    label: '执行交易配置检查',
    type: 'boolean',
  },
  // 排序和限制
  {
    key: 'sort_by',
    label: '排序方式',
    type: 'string',
    options: [
      { value: 'score_desc', label: '分数降序' },
      { value: 'random', label: '随机' },
      { value: 'round_robin', label: '轮询' },
    ],
  },
  {
    key: 'sort_random_factor',
    label: '随机因子(0-1)',
    type: 'percentage',
    placeholder: '例如: 0.1',
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: 'limit_max_candidates',
    label: '最大候选人数',
    type: 'number',
    placeholder: '例如: 50',
    min: 0,
  },
  {
    key: 'limit_min_candidates',
    label: '最小候选人数',
    type: 'number',
    placeholder: '例如: 1',
    min: 0,
  },
];

interface DispatchRule {
  key: string;
  config: RuleFieldConfig;
  value: any;
}

interface DispatchRulesEditorProps {
  value?: Record<string, any>;
  onChange: (rules: Record<string, any>) => void;
}

export function DispatchRulesEditor({ value, onChange }: DispatchRulesEditorProps) {
  const [rules, setRules] = useState<DispatchRule[]>([]);
  const [availableFields, setAvailableFields] = useState<RuleFieldConfig[]>([]);

  useEffect(() => {
    // 初始化所有规则字段
    const initialRules: DispatchRule[] = RULE_FIELDS.map(config => {
      const existingValue = value?.[config.key];
      return {
        key: config.key,
        config,
        value: existingValue !== undefined ? existingValue : getDefaultValue(config.type)
      };
    });
    setRules(initialRules);
    setAvailableFields([]);
  }, []);

  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      // 更新已有值
      setRules(prev => prev.map(rule => ({
        ...rule,
        value: value[rule.key] !== undefined ? value[rule.key] : rule.value
      })));
    }
  }, [value]);

  const updateAvailableFields = (currentRules: DispatchRule[]) => {
    const usedKeys = new Set(currentRules.map(r => r.key));
    setAvailableFields(RULE_FIELDS.filter(f => !usedKeys.has(f.key)));
  };

  const addRule = (fieldKey: string) => {
    const config = RULE_FIELDS.find(f => f.key === fieldKey);
    if (!config) return;

    const defaultValue = getDefaultValue(config.type);
    const newRule: DispatchRule = { key: fieldKey, config, value: defaultValue };
    const newRules = [...rules, newRule];
    setRules(newRules);
    updateAvailableFields(newRules);
    emitChange(newRules);
  };

  const removeRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
    updateAvailableFields(newRules);
    emitChange(newRules);
  };

  const updateRuleValue = (index: number, newValue: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], value: newValue };
    setRules(newRules);
    emitChange(newRules);
  };

  const emitChange = (currentRules: DispatchRule[]) => {
    const rulesObject: Record<string, any> = {};
    currentRules.forEach(rule => {
      rulesObject[rule.key] = rule.value;
    });
    onChange(rulesObject);
  };

  const getDefaultValue = (type: string): any => {
    switch (type) {
      case 'boolean': return true;
      case 'number': return 0;
      case 'percentage': return 0;
      case 'array': return [];
      case 'string': return '';
      case 'amount': return '';
      default: return null;
    }
  };

  const renderValueInput = (rule: DispatchRule, index: number) => {
    const { config, value } = rule;

    switch (config.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`rule-${index}`}
              checked={value === true}
              onCheckedChange={(checked) => updateRuleValue(index, checked)}
            />
            <label
              htmlFor={`rule-${index}`}
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              是
            </label>
          </div>
        );

      case 'number':
      case 'percentage':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => updateRuleValue(index, parseFloat(e.target.value) || 0)}
            placeholder={config.placeholder}
            min={config.min}
            max={config.max}
            step={config.step}
            className="w-full text-sm"
          />
        );

      case 'string':
        if (config.options) {
          return (
            <Select
              value={value || ''}
              onValueChange={(val) => updateRuleValue(index, val)}
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                {config.options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => updateRuleValue(index, e.target.value)}
            placeholder={config.placeholder}
            className="w-full text-sm"
          />
        );

      case 'array':
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-1.5">
            {config.options?.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`rule-${index}-${opt.value}`}
                  checked={arrayValue.includes(opt.value)}
                  onCheckedChange={(checked) => {
                    let newValue;
                    if (checked) {
                      newValue = [...arrayValue, opt.value];
                    } else {
                      newValue = arrayValue.filter((v: string) => v !== opt.value);
                    }
                    updateRuleValue(index, newValue);
                  }}
                />
                <label
                  htmlFor={`rule-${index}-${opt.value}`}
                  className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* 标题和添加规则下拉 */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">规则配置</h3>
        {availableFields.length > 0 && (
          <Select onValueChange={addRule}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="添加规则" />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map(field => (
                <SelectItem key={field.key} value={field.key}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* 规则列表 - 4列布局 */}
      <div className="grid grid-cols-4 gap-3">
        {rules.map((rule, index) => (
          <div key={`${rule.key}-${index}`} className="relative flex flex-col gap-2 p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex-1">{rule.config.label}</Label>
              <button
                type="button"
                onClick={() => removeRule(index)}
                className="flex-shrink-0 ml-2 text-gray-500 hover:text-red-600 transition-colors"
                title="删除规则"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              {renderValueInput(rule, index)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
