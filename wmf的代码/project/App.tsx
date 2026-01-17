import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Menu,
  Bell,
  Database,
  Sliders,
  Briefcase,
  ChevronDown,
  ListTodo
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import AssetTransfer from './components/AssetTransfer';
import HousingAllocation from './components/HousingAllocation';
import FeeManagement from './components/FeeManagement';
import MaintenanceEnhanced from './components/MaintenanceEnhanced';
import BusinessHall from './components/BusinessHall';
import AssetDigitalization from './components/AssetDigitalization';
import RuleEngine from './components/RuleEngine';
import ReportCenterEnhanced from './components/ReportCenterEnhanced';
import CommercialHousing from './components/CommercialHousing';
import InventoryCheckEnhanced from './components/InventoryCheckEnhanced';
import BigScreen from './components/BigScreen';
import Login from './components/Login';
import MyTodos from './components/MyTodos'; // New Component
import { UserRole } from './types';

// Updated Router State
export type View = 
  | 'cockpit'      // Decision Cockpit (was dashboard)
  | 'todos'        // My Todos (New)
  
  // Digital Assets
  | 'digital'      // Root/Default
  | 'digital-land'
  | 'digital-building'
  | 'digital-room'

  // Rule Engine
  | 'rules'        // Root/Default
  | 'rules-quota'
  | 'rules-fee'
  | 'rules-alert'

  | 'hall'         // Business Hall (Hub)
  // Sub-modules of Hall
  | 'assets' 
  | 'allocation' 
  | 'fees' 
  | 'commercial' 
  | 'maintenance' 
  | 'inventory'
  | 'reports';
  

const viewToPath: Record<View, string> = {
  cockpit: '/',
  todos: '/todos',
  hall: '/hall',
  assets: '/hall/assets',
  allocation: '/hall/allocation',
  fees: '/hall/fees',
  commercial: '/hall/commercial',
  maintenance: '/hall/maintenance',
  inventory: '/hall/inventory',
  reports: '/hall/reports',
  digital: '/digital',
  'digital-land': '/digital/land',
  'digital-building': '/digital/building',
  'digital-room': '/digital/room',
  rules: '/rules',
  'rules-quota': '/rules/quota',
  'rules-fee': '/rules/fee',
  'rules-alert': '/rules/alert'
};

const pathToView: Record<string, View> = Object.fromEntries(
  Object.entries(viewToPath).map(([k, v]) => [v, k as View])
) as Record<string, View>;

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>(UserRole.AssetAdmin);
  const [currentView, setCurrentView] = useState<View>(() => {
    const view = pathToView[window.location.pathname];
    return view ?? 'cockpit';
  });
  const [isBigScreen, setIsBigScreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Sidebar State
  const [isHallExpanded, setIsHallExpanded] = useState(true);
  const [isDigitalExpanded, setIsDigitalExpanded] = useState(true);
  const [isRulesExpanded, setIsRulesExpanded] = useState(true);

  // Helper to determine active section
  const isHallModule = ['assets', 'allocation', 'fees', 'commercial', 'maintenance', 'inventory', 'reports'].includes(currentView);
  const isHallSection = currentView === 'hall' || isHallModule;
  const isDigitalModule = ['digital-land', 'digital-building', 'digital-room'].includes(currentView);
  const isDigitalSection = currentView === 'digital' || isDigitalModule;
  const isRulesModule = ['rules-quota', 'rules-fee', 'rules-alert'].includes(currentView);
  const isRulesSection = currentView === 'rules' || isRulesModule;

  // Keep currentView in sync with URL (browser navigation)
  useEffect(() => {
    const view = pathToView[location.pathname];
    if (view && view !== currentView) {
      setCurrentView(view);
    }
  }, [location.pathname]);

  // Synchronize URL when currentView changes
  useEffect(() => {
    navigate(viewToPath[currentView]);
  }, [currentView, navigate]);

  // Auto-expand menus based on current view
  useEffect(() => {
    if (isHallSection) setIsHallExpanded(true);
    if (isDigitalSection) setIsDigitalExpanded(true);
    if (isRulesSection) setIsRulesExpanded(true);
  }, [currentView, isHallSection, isDigitalSection, isRulesSection]);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    // Reset view based on role
    if (role === UserRole.Guest) {
      setCurrentView('commercial');
    } else if (role === UserRole.Teacher) {
      setCurrentView('hall');
    } else {
      setCurrentView('cockpit');
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (userRole === UserRole.Guest) {
      return <CommercialHousing userRole={userRole} />;
    }
    switch(currentView) {
      case 'cockpit': return <Dashboard userRole={userRole} onEnterBigScreen={() => setIsBigScreen(true)} />;
      case 'todos': return <MyTodos onNavigate={setCurrentView} />; // Pass navigation function
      case 'hall': return <BusinessHall userRole={userRole} onNavigate={setCurrentView} />;
      
      // Hall Sub-modules with UserRole passed down
      case 'assets': return <AssetTransfer userRole={userRole} />;
      case 'allocation': return <HousingAllocation userRole={userRole} />;
      case 'fees': return <FeeManagement userRole={userRole} />;
      case 'maintenance': return <MaintenanceEnhanced userRole={userRole} />;
      case 'reports': return <ReportCenterEnhanced userRole={userRole} />;
      
      // Asset Digitalization (Sub-views)
      case 'digital':
      case 'digital-land': return <AssetDigitalization userRole={userRole} subView="land" />;
      case 'digital-building': return <AssetDigitalization userRole={userRole} subView="building" />;
      case 'digital-room': return <AssetDigitalization userRole={userRole} subView="room" />;

      // Rule Engine (Sub-views)
      case 'rules':
      case 'rules-quota': return <RuleEngine subView="quota" />;
      case 'rules-fee': return <RuleEngine subView="fee" />;
      case 'rules-alert': return <RuleEngine subView="alert" />;

      // Placeholders
      case 'commercial': return <CommercialHousing userRole={userRole} />;
      case 'inventory':
        return <InventoryCheckEnhanced />;
        
      default: return <Dashboard userRole={userRole} />;
    }
  };

  const NavItem = ({ view, label, icon: Icon, isActive, hasSubMenu, isOpen, onToggle }: any) => {
    const active = isActive || currentView === view;
    return (
    <button
      onClick={() => {
        if (hasSubMenu && onToggle) {
             onToggle();
             // Optionally navigate to main view if not already in section
             if (!active) setCurrentView(view);
        } else {
            setCurrentView(view as View);
            setSidebarOpen(false);
        }
      }}
      className={`w-full flex items-center justify-between px-4 py-2.5 mx-2 rounded-md transition-all duration-200 font-medium text-sm mb-1 max-w-[calc(100%-16px)] ${
        active
          ? 'bg-[#e1eaff] text-[#3370ff]' 
          : 'text-[#646a73] hover:bg-[#f2f3f5] hover:text-[#1f2329]'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? 'text-[#3370ff]' : 'text-[#8f959e]'} />
        <span className="tracking-wide">{label}</span>
      </div>
      {hasSubMenu && (
          <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${active ? 'text-[#3370ff]' : 'text-[#8f959e]'}`} />
      )}
    </button>
  )};

  const SubNavItem = ({ view, label }: { view: View, label: string }) => (
      <button
        onClick={() => {
            setCurrentView(view);
            setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-2 mx-2 rounded-md transition-all duration-200 font-medium text-xs mb-1 max-w-[calc(100%-16px)] pl-11 ${
            currentView === view 
            ? 'text-[#3370ff] bg-[#f0f5ff]' 
            : 'text-[#646a73] hover:bg-[#f2f3f5] hover:text-[#1f2329]'
        }`}
      >
        <span className="truncate">{label}</span>
      </button>
  );

  const getBreadcrumb = () => {
    const hallCrumb = <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('hall')}> / 业务大厅</span>;
    const digitalCrumb = <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('digital')}> / 资产数字化</span>;
    const rulesCrumb = <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('rules')}> / 规则引擎</span>;

    switch(currentView) {
        case 'cockpit': return userRole === UserRole.Teacher ? '个人中心' : '决策驾驶仓';
        case 'todos': return '我的代办';
        case 'hall': return '业务大厅';
        
        // Digital Breadcrumbs
        case 'digital': return '资产数字化';
        case 'digital-land': return <>{digitalCrumb} <span className="text-[#1f2329]"> / 土地资源</span></>;
        case 'digital-building': return <>{digitalCrumb} <span className="text-[#1f2329]"> / 房屋建筑</span></>;
        case 'digital-room': return <>{digitalCrumb} <span className="text-[#1f2329]"> / 房间原子单元</span></>;

        // Rules Breadcrumbs
        case 'rules': return '规则引擎';
        case 'rules-quota': return <>{rulesCrumb} <span className="text-[#1f2329]"> / 定额核算</span></>;
        case 'rules-fee': return <>{rulesCrumb} <span className="text-[#1f2329]"> / 收费策略</span></>;
        case 'rules-alert': return <>{rulesCrumb} <span className="text-[#1f2329]"> / 预警规则</span></>;

        // Hall Breadcrumbs
        case 'assets': return <>{hallCrumb} <span className="text-[#1f2329]"> / 资产建设与转固</span></>;
        case 'allocation': return <>{hallCrumb} <span className="text-[#1f2329]"> / 公用房归口调配</span></>;
        case 'fees': return <>{hallCrumb} <span className="text-[#1f2329]"> / 公房使用收费</span></>;
        case 'commercial': return <>{hallCrumb} <span className="text-[#1f2329]"> / 经营与周转房</span></>;
        case 'maintenance': return <>{hallCrumb} <span className="text-[#1f2329]"> / 维修与物业</span></>;
        case 'inventory': return <>{hallCrumb} <span className="text-[#1f2329]"> / 房产盘点核查</span></>;
        case 'reports': return <>{hallCrumb} <span className="text-[#1f2329]"> / 统计报表中心</span></>;
        default: return '未知模块';
    }
  };

  const getRoleLabel = () => {
    switch(userRole) {
      case UserRole.Teacher: return '教职工';
      case UserRole.CollegeAdmin: return '学院管理员';
      case UserRole.AssetAdmin: return '资产管理员';
      case UserRole.Guest: return '游客';
      default: return '用户';
    }
  };

  const hallSubMenus: { id: View; label: string; roles: UserRole[] }[] = [
    { id: 'assets', label: '资产建设与转固', roles: [UserRole.AssetAdmin] },
    { id: 'allocation', label: '公用房归口调配', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
    { id: 'fees', label: '公房使用收费', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
    { id: 'commercial', label: '经营与周转房', roles: [UserRole.AssetAdmin, UserRole.Teacher, UserRole.Guest] },
    { id: 'maintenance', label: '维修与物业', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin, UserRole.Teacher] },
    { id: 'inventory', label: '房产盘点核查', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
    { id: 'reports', label: '统计报表中心', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
  ];

  const digitalSubMenus: { id: View; label: string; }[] = [
      { id: 'digital-land', label: '土地资源' },
      { id: 'digital-building', label: '房屋建筑' },
      { id: 'digital-room', label: '房间原子单元' },
  ];

  const rulesSubMenus: { id: View; label: string; }[] = [
      { id: 'rules-quota', label: '定额核算模型' },
      { id: 'rules-fee', label: '收费策略配置' },
      { id: 'rules-alert', label: '预警规则配置' },
  ];

  if (isBigScreen) {
    return <BigScreen onExit={() => setIsBigScreen(false)} />;
  }

  return (
    <div className="flex h-screen bg-[#f5f6f7] overflow-hidden font-sans text-[#1f2329]">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#dee0e3] transform transition-transform duration-300 ease-in-out shadow-sm md:shadow-none
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-[#dee0e3]">
            <div className="w-8 h-8 bg-[#3370ff] rounded flex items-center justify-center mr-3 shadow-sm">
                <Building2 className="text-white" size={18} />
            </div>
            <div>
                <h1 className="text-lg font-bold text-[#1f2329] tracking-tight">UniAssets</h1>
            </div>
        </div>

        <nav className="py-4 space-y-1 px-2 custom-scrollbar overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="px-4 py-2 text-xs font-medium text-[#8f959e]">主菜单</div>
            
            {/* Conditional Rendering based on Role */}
            {userRole === UserRole.AssetAdmin && (
               <NavItem view="todos" label="我的代办" icon={ListTodo} />
            )}
            {userRole !== UserRole.Teacher && userRole !== UserRole.Guest && (
               <NavItem view="cockpit" label="决策驾驶仓" icon={LayoutDashboard} />
            )}
            
            {/* Business Hall with Sub Menu */}
            <NavItem 
                view="hall" 
                label="业务大厅" 
                icon={Briefcase} 
                isActive={isHallSection}
                hasSubMenu
                isOpen={isHallExpanded}
                onToggle={() => setIsHallExpanded(!isHallExpanded)}
            />
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isHallExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                 {hallSubMenus.filter(item => item.roles.includes(userRole)).map(item => (
                     <SubNavItem key={item.id} view={item.id} label={item.label} />
                 ))}
            </div>
            
            {userRole === UserRole.AssetAdmin && (
              <>
                {/* Asset Digitalization with Sub Menu */}
                <NavItem 
                    view="digital" 
                    label="资产数字化" 
                    icon={Database} 
                    isActive={isDigitalSection}
                    hasSubMenu
                    isOpen={isDigitalExpanded}
                    onToggle={() => setIsDigitalExpanded(!isDigitalExpanded)}
                />
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDigitalExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {digitalSubMenus.map(item => (
                        <SubNavItem key={item.id} view={item.id} label={item.label} />
                    ))}
                </div>

                {/* Rule Engine with Sub Menu */}
                <NavItem 
                    view="rules" 
                    label="规则引擎" 
                    icon={Sliders} 
                    isActive={isRulesSection}
                    hasSubMenu
                    isOpen={isRulesExpanded}
                    onToggle={() => setIsRulesExpanded(!isRulesExpanded)}
                />
                 <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isRulesExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {rulesSubMenus.map(item => (
                        <SubNavItem key={item.id} view={item.id} label={item.label} />
                    ))}
                </div>
              </>
            )}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-[#dee0e3] bg-[#fcfcfd]">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#3370ff]/10 rounded-full flex items-center justify-center text-[#3370ff] font-bold border border-[#3370ff]/20 text-xs">
                   {getRoleLabel().substring(0, 1)}
                </div>
                <div>
                    <p className="text-sm font-medium text-[#1f2329]">{getRoleLabel()}</p>
                    <p className="text-xs text-[#8f959e]">{userRole === UserRole.CollegeAdmin ? '机械学院' : userRole === UserRole.Teacher ? '教师' : userRole === UserRole.Guest ? '访客' : '信息办'}</p>
                </div>
                <button 
                  onClick={() => setIsLoggedIn(false)}
                  className="ml-auto text-xs text-[#f54a45] hover:underline"
                >
                  退出
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#dee0e3] flex items-center justify-between px-6 z-10 sticky top-0">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 text-[#646a73] hover:bg-[#f2f3f5] rounded md:hidden"
                >
                    <Menu size={20} />
                </button>
                <div className="flex items-center text-sm">
                    <span className="text-[#8f959e]">UniAssets</span>
                    <span className="mx-2 text-[#dee0e3]">/</span>
                    <span className="text-[#1f2329] font-medium flex items-center">
                        {getBreadcrumb()}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#e1eaff] rounded-full text-xs text-[#3370ff] font-medium">
                   当前身份: {getRoleLabel()}
                </div>
                <button className="relative p-2 text-[#646a73] hover:text-[#3370ff] transition-colors hover:bg-[#f2f3f5] rounded-full">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f54a45] rounded-full border-2 border-white"></span>
                </button>
                <div className="w-px h-6 bg-[#dee0e3]"></div>
                <div className="text-sm text-[#646a73]">福建理工大学</div>
            </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto bg-[#f5f6f7]">
            <div className="max-w-7xl mx-auto p-6 md:p-8 h-full">
                {renderContent()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;