import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Bell, 
  Settings, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  Plus,
  Code
} from 'lucide-react';
import { MOCK_QUOTA_CONFIGS, MOCK_FEE_TIERS, MOCK_ALERT_CONFIGS } from '../constants';
import { QuotaConfig, FeeTier, AlertConfig } from '../types';

export type RuleSubView = 'quota' | 'fee' | 'alert';

interface RuleEngineProps {
  subView?: RuleSubView;
}

const RuleEngine: React.FC<RuleEngineProps> = ({ subView = 'quota' }) => {
  // State for editable configs
  const [quotas, setQuotas] = useState<QuotaConfig[]>(MOCK_QUOTA_CONFIGS);
  const [feeTiers, setFeeTiers] = useState<FeeTier[]>(MOCK_FEE_TIERS);
  const [alerts, setAlerts] = useState<AlertConfig[]>(MOCK_ALERT_CONFIGS);

  const handleQuotaChange = (id: string, field: keyof QuotaConfig, value: any) => {
    setQuotas(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleAlertToggle = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isEnabled: !a.isEnabled } : a));
  };

  const getTitle = () => {
      switch(subView) {
          case 'quota': return '定额核算模型';
          case 'fee': return '收费策略配置';
          case 'alert': return '预警规则配置';
          default: return '规则引擎配置中心';
      }
  };

  const getDescription = () => {
      switch(subView) {
          case 'quota': return '配置人员、学生及学科系数，动态计算单位公用房定额标准。';
          case 'fee': return '设定超额阶梯费率、时间折扣及豁免逻辑。';
          case 'alert': return '定义利用率、安全及财务维度的自动预警阈值。';
          default: return '';
      }
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2329]">{getTitle()}</h2>
          <p className="text-[#646a73]">{getDescription()}</p>
        </div>
        <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 border border-[#dee0e3] rounded text-sm text-[#646a73] hover:bg-[#f2f3f5] transition-colors">
                <RotateCcw size={16} /> 重置
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-[#3370ff] rounded text-sm text-white font-medium hover:bg-[#285cc9] transition-colors shadow-sm">
                <Save size={16} /> 保存配置
             </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white rounded-lg border border-[#dee0e3] shadow-sm overflow-hidden flex flex-col min-h-0">
          
          {/* QUOTA TAB */}
          {subView === 'quota' && (
            <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#1f2329] mb-2 flex items-center gap-2"><Settings size={20}/> 基础定额系数配置</h3>
                    <p className="text-sm text-[#8f959e]">修改下方数值将实时影响全校各单位的公用房定额核算结果。</p>
                </div>

                <div className="space-y-8">
                    {/* Personnel Section */}
                    <section>
                        <h4 className="text-sm font-bold text-[#1f2329] bg-[#f5f6f7] px-3 py-2 rounded mb-3 border border-[#dee0e3]">
                            人员系数 (教职工)
                        </h4>
                        <div className="space-y-2">
                            {quotas.filter(q => q.category === 'Personnel').map(item => (
                                <ConfigRow key={item.id} item={item} onChange={handleQuotaChange} />
                            ))}
                        </div>
                    </section>

                    {/* Student Section */}
                        <section>
                        <h4 className="text-sm font-bold text-[#1f2329] bg-[#f5f6f7] px-3 py-2 rounded mb-3 border border-[#dee0e3]">
                            学生系数 (人才培养)
                        </h4>
                            <div className="space-y-2">
                            {quotas.filter(q => q.category === 'Student').map(item => (
                                <ConfigRow key={item.id} item={item} onChange={handleQuotaChange} />
                            ))}
                        </div>
                    </section>

                        {/* Discipline Section */}
                        <section>
                        <h4 className="text-sm font-bold text-[#1f2329] bg-[#f5f6f7] px-3 py-2 rounded mb-3 border border-[#dee0e3]">
                            学科调节系数
                        </h4>
                            <div className="space-y-2">
                            {quotas.filter(q => q.category === 'Discipline').map(item => (
                                <ConfigRow key={item.id} item={item} onChange={handleQuotaChange} />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
          )}

          {/* FEE TAB */}
          {subView === 'fee' && (
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                    <div className="mb-2">
                    <h3 className="text-lg font-bold text-[#1f2329] mb-2 flex items-center gap-2"><DollarSign size={20}/> 收费阶梯与折扣策略</h3>
                    <p className="text-sm text-[#8f959e]">配置超额占用费率阶梯及特殊情况的豁免逻辑。</p>
                </div>

                {/* Excess Tiers Visualization */}
                <div className="bg-[#fcfcfd] border border-[#dee0e3] rounded-lg p-6">
                    <h4 className="text-sm font-bold text-[#1f2329] mb-4">超额阶梯费率模型</h4>
                    <div className="flex flex-col md:flex-row gap-2 items-stretch h-32 md:h-24 w-full">
                        {feeTiers.map((tier, index) => (
                            <div key={tier.id} className={`flex-1 rounded-lg border flex flex-col items-center justify-center p-2 relative ${tier.color.replace('text-', 'border-').replace('800', '200')}`}>
                                <div className={`absolute inset-0 opacity-10 ${tier.color.split(' ')[0]}`}></div>
                                <span className="font-bold text-sm z-10">{tier.rateName}</span>
                                <span className="text-2xl font-bold z-10">{tier.multiplier}x</span>
                                <span className="text-xs mt-1 z-10 opacity-70">
                                    {tier.minExcess}% {tier.maxExcess ? `- ${tier.maxExcess}%` : '以上'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-xs text-[#8f959e] flex gap-2 items-center">
                        <AlertTriangle size={12} />
                        说明: “超额阶梯费率模型”以“实际占用面积/核定定额面积 - 1”计算超额比例，并按阶梯区间分别乘以对应倍率计费；区间越高倍率越大，用于对长期、严重超额占用形成强约束。超过60%的部分将触发“熔断性”高倍率收费。
                    </div>
                </div>

                {/* Time-based Discount Strategy */}
                <div className="bg-white border border-[#dee0e3] rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#dee0e3] flex justify-between items-center">
                        <span className="text-sm font-bold text-[#1f2329]">时间递增折扣策略</span>
                        <button className="text-[#3370ff] text-xs font-medium hover:underline">+ 添加阶段</button>
                    </div>
                    <div className="p-4 space-y-4">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="w-8 h-8 rounded-full bg-[#3370ff] text-white flex items-center justify-center text-xs font-bold">1</div>
                                <div className="flex-1 border border-[#dee0e3] p-2 rounded bg-white">
                                    <span className="font-medium">首年 (保护期)</span>
                                </div>
                                <div className="w-16 text-center text-[#646a73]">→</div>
                                <div className="w-24 border border-[#dee0e3] p-2 rounded text-center">
                                    <span className="font-bold text-[#3370ff]">50%</span> 折扣
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="w-8 h-8 rounded-full bg-[#3370ff] text-white flex items-center justify-center text-xs font-bold">2</div>
                                <div className="flex-1 border border-[#dee0e3] p-2 rounded bg-white">
                                    <span className="font-medium">次年 (过渡期)</span>
                                </div>
                                <div className="w-16 text-center text-[#646a73]">→</div>
                                <div className="w-24 border border-[#dee0e3] p-2 rounded text-center">
                                    <span className="font-bold text-[#3370ff]">80%</span> 折扣
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="w-8 h-8 rounded-full bg-[#3370ff] text-white flex items-center justify-center text-xs font-bold">3</div>
                                <div className="flex-1 border border-[#dee0e3] p-2 rounded bg-white">
                                    <span className="font-medium">第三年及以后</span>
                                </div>
                                <div className="w-16 text-center text-[#646a73]">→</div>
                                <div className="w-24 border border-[#dee0e3] p-2 rounded text-center">
                                    <span className="font-bold text-[#3370ff]">100%</span> 全额
                                </div>
                            </div>
                    </div>
                </div>


            </div>
          )}

          {/* ALERT TAB */}
          {subView === 'alert' && (
              <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#1f2329] mb-2 flex items-center gap-2"><Bell size={20}/> 预警触发规则</h3>
                    <p className="text-sm text-[#8f959e]">定义触发系统自动预警的阈值条件，支持利用率、安全及财务维度。</p>
                </div>
                
                <div className="space-y-4">
                    {alerts.map(alert => (
                        <div key={alert.id} className="bg-white border border-[#dee0e3] p-4 rounded-lg flex items-center justify-between hover:border-[#3370ff] transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${alert.type === 'Safety' ? 'bg-red-50 text-red-500' : alert.type === 'Finance' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#1f2329]">{alert.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs px-1.5 py-0.5 bg-[#f5f6f7] text-[#646a73] rounded border border-[#dee0e3]">{alert.type === 'Safety' ? '安全' : alert.type === 'Finance' ? '财务' : '效能'}</span>
                                        <span className="text-xs text-[#8f959e]">
                                            当前阈值: {alert.type === 'Utilization' ? '低于' : '超过'} <span className="font-mono font-medium text-[#1f2329]">{alert.thresholdValue} {alert.thresholdUnit}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 bg-[#f5f6f7] px-3 py-1.5 rounded border border-[#dee0e3] group-hover:bg-white group-hover:border-[#3370ff] transition-colors">
                                    <span className="text-sm text-[#646a73]">阈值:</span>
                                    <input 
                                        type="number" 
                                        defaultValue={alert.thresholdValue}
                                        className="w-16 bg-transparent outline-none text-right font-bold text-[#1f2329] border-b border-transparent focus:border-[#3370ff]"
                                    />
                                    <span className="text-sm text-[#646a73]">{alert.thresholdUnit}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${alert.isEnabled ? 'text-[#3370ff]' : 'text-[#8f959e]'}`}>
                                        {alert.isEnabled ? '已启用' : '已停用'}
                                    </span>
                                    <button 
                                        onClick={() => handleAlertToggle(alert.id)}
                                        className={`w-11 h-6 rounded-full p-1 transition-colors ${alert.isEnabled ? 'bg-[#3370ff]' : 'bg-[#dee0e3]'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${alert.isEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-center">
                    <button className="flex items-center gap-2 text-[#3370ff] font-medium px-4 py-2 hover:bg-[#e1eaff] rounded transition-colors">
                        <Plus size={18} /> 新增自定义预警规则
                    </button>
                </div>
              </div>
          )}

      </div>
    </div>
  );
};

const ConfigRow = ({ item, onChange }: { item: QuotaConfig, onChange: (id: string, f: keyof QuotaConfig, v: any) => void }) => {
    return (
        <div className="flex items-center justify-between p-3 border border-[#dee0e3] rounded hover:bg-[#fcfcfd] transition-colors group">
            <div className="flex-1">
                <div className="font-medium text-[#1f2329] text-sm">{item.name}</div>
                <div className="text-xs text-[#8f959e] mt-0.5">{item.description}</div>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-[#dee0e3] group-hover:border-[#3370ff] transition-colors">
                <input 
                    type="number" 
                    value={item.value}
                    onChange={(e) => onChange(item.id, 'value', parseFloat(e.target.value))}
                    className="w-16 text-right outline-none font-bold text-[#1f2329] text-sm"
                />
                <span className="text-xs text-[#646a73] border-l border-[#dee0e3] pl-2">{item.unit}</span>
            </div>
        </div>
    );
};

export default RuleEngine;