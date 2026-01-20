import React, { useState } from 'react';
import { User, Lock, Globe, Shield, Users, School } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'account' | 'code'>('account');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.AssetAdmin);

  const roles = [
    { id: UserRole.Teacher, label: '教职工', icon: User },
    { id: UserRole.CollegeAdmin, label: '学院管理员', icon: School },
    { id: UserRole.AssetAdmin, label: '资产处管理员', icon: Shield },
    { id: UserRole.Guest, label: '游客', icon: Users },
  ];

  return (
    <div className="min-h-screen w-full flex font-sans bg-white text-[#1f2329]">
        {/* Left Side: Brand/Illustration Area */}
        <div className="hidden lg:flex lg:w-[480px] xl:w-[600px] bg-[#f2f3f5] flex-col justify-between p-12 relative overflow-hidden">
             <div className="z-10">
                 <div className="flex items-center gap-3 mb-8">
                     <div className="w-10 h-10 bg-[#3370ff] rounded-lg flex items-center justify-center text-white shadow-md">
                         <div className="w-5 h-5 border-2 border-white rounded-sm"></div>
                     </div>
                     <span className="text-xl font-bold tracking-tight text-[#1f2329]">UniAssets</span>
                 </div>
                 <h1 className="text-4xl font-bold text-[#1f2329] leading-tight mb-4">
                     高效连接，<br/>智能资产管理
                 </h1>
                 <p className="text-[#646a73] text-lg">
                     赋能高校资产全生命周期管理，<br/>让数据创造价值。
                 </p>
             </div>

             {/* Abstract Decor */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#3370ff]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
             
             <div className="z-10 text-sm text-[#8f959e]">
                 © 2024 Fujian University of Technology
             </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
            <div className="absolute top-8 right-8 flex items-center gap-4">
                <button className="flex items-center gap-1 text-sm text-[#646a73] hover:text-[#3370ff] transition-colors">
                    <Globe size={16} />
                    <span>English</span>
                </button>
            </div>

            <div className="w-full max-w-[400px]">
                <h2 className="text-2xl font-bold text-[#1f2329] mb-2">欢迎登录</h2>
                <p className="text-[#8f959e] mb-8">请选择您的身份角色进行登录</p>
                
                {/* Role Selector */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setSelectedRole(role.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                                selectedRole === role.id 
                                ? 'bg-[#e1eaff] border-[#3370ff] text-[#3370ff]' 
                                : 'bg-white border-[#dee0e3] text-[#646a73] hover:bg-[#f5f6f7]'
                            }`}
                        >
                            <role.icon size={20} className="mb-2" />
                            <span className="text-xs font-medium">{role.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-[#dee0e3] mb-6">
                    <button 
                        className={`pb-3 text-base font-medium transition-all relative px-4 ${activeTab === 'account' ? 'text-[#3370ff]' : 'text-[#646a73] hover:text-[#1f2329]'}`}
                        onClick={() => setActiveTab('account')}
                    >
                        账号登录
                        {activeTab === 'account' && <div className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-[#3370ff]"></div>}
                    </button>
                    <button 
                        className={`pb-3 text-base font-medium transition-all relative px-4 ${activeTab === 'code' ? 'text-[#3370ff]' : 'text-[#646a73] hover:text-[#1f2329]'}`}
                        onClick={() => setActiveTab('code')}
                    >
                        验证码登录
                         {activeTab === 'code' && <div className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-[#3370ff]"></div>}
                    </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(selectedRole); }}>
                    {selectedRole !== UserRole.Guest ? (
                    <>
                    <div className="space-y-4">
                        <div className="group">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    className="block w-full px-4 py-3 bg-white border border-[#bbbfc4] rounded hover:border-[#3370ff] focus:border-[#3370ff] focus:ring-1 focus:ring-[#3370ff] transition-all outline-none text-[#1f2329] placeholder-[#8f959e]" 
                                    placeholder={selectedRole === UserRole.Teacher ? "请输入工号" : "请输入管理员账号"}
                                    defaultValue="admin"
                                />
                            </div>
                        </div>
                        <div className="group">
                             <div className="relative">
                                <input 
                                    type="password" 
                                    className="block w-full px-4 py-3 bg-white border border-[#bbbfc4] rounded hover:border-[#3370ff] focus:border-[#3370ff] focus:ring-1 focus:ring-[#3370ff] transition-all outline-none text-[#1f2329] placeholder-[#8f959e]" 
                                    placeholder="请输入密码" 
                                    defaultValue="password"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center cursor-pointer text-[#646a73] hover:text-[#1f2329]">
                            <input type="checkbox" className="w-4 h-4 mr-2 rounded border-[#bbbfc4] text-[#3370ff] focus:ring-[#3370ff]" />
                            下次自动登录
                        </label>
                        <a href="#" className="text-[#3370ff] hover:underline">忘记密码?</a>
                    </div>
                    </>
                    ) : (
                        <div className="text-center p-4 bg-gray-50 rounded-md border">
                            <p className="text-sm text-gray-600">您将以游客身份访问，仅可查看部分公开数据。</p>
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-[#3370ff] hover:bg-[#285cc9] text-white font-medium py-3 rounded-md shadow-sm transition-all text-base flex items-center justify-center gap-2"
                    >
                        {selectedRole === UserRole.Guest ? '进入系统' : `以 ${roles.find(r => r.id === selectedRole)?.label} 身份登录`}
                    </button>
                </form>
                
            </div>
            
            <div className="absolute bottom-8 text-xs text-[#8f959e] text-center w-full px-4">
                登录即代表您已同意 <a href="#" className="text-[#3370ff]">用户协议</a> 和 <a href="#" className="text-[#3370ff]">隐私政策</a>
            </div>
        </div>
    </div>
  );
};

export default Login;