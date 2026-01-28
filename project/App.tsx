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
import AssetsHomePage from './components/AssetsHomePage';
import AssetsApplyPage from './components/AssetsApplyPage';
import AssetsReviewPage from './components/AssetsReviewPage';
import HousingAllocation from './components/HousingAllocation';
import HousingAllocationApproval from './components/HousingAllocationApproval';
import HousingAllocationResource from './components/HousingAllocationResource';
import HousingAllocationAdjust from './components/HousingAllocationAdjust';
import HousingAllocationRecords from './components/HousingAllocationRecords';
import HousingAllocationAnalytics from './components/HousingAllocationAnalytics';
import HousingAllocationHome from './components/HousingAllocationHome';
import FeeManagement from './components/FeeManagement';
import FeeManagementHome from './components/FeeManagementHome';
import FeeManagementOverview from './components/FeeManagementOverview';
import FeeManagementPersons from './components/FeeManagementPersons';
import FeeManagementBills from './components/FeeManagementBills';
import FeeManagementPayments from './components/FeeManagementPayments';
import FeeManagementReminders from './components/FeeManagementReminders';
import MaintenanceEnhanced from './components/MaintenanceEnhanced';
import MaintenanceHome from './components/MaintenanceHome';
import MaintenanceRepair from './components/MaintenanceRepair';
import MaintenanceProperty from './components/MaintenanceProperty';
import MaintenanceStats from './components/MaintenanceStats';
import BusinessHall from './components/BusinessHall';
import AssetDigitalization from './components/AssetDigitalization';
import RuleEngine from './components/RuleEngine';
import ReportCenterEnhanced from './components/ReportCenterEnhanced';
import ReportsHomePage from './components/ReportsHomePage';
import ReportsStandardPage from './components/ReportsStandardPage';
import ReportsCustomPage from './components/ReportsCustomPage';
import ReportsLogsPage from './components/ReportsLogsPage';
import CommercialHousing from './components/CommercialHousing';
import CommercialManagementHome from './components/CommercialManagementHome';
import CommercialManagementOverview from './components/CommercialManagementOverview';
import CommercialManagementSpaces from './components/CommercialManagementSpaces';
import CommercialManagementContracts from './components/CommercialManagementContracts';
import CommercialManagementRent from './components/CommercialManagementRent';
import CommercialManagementAnalytics from './components/CommercialManagementAnalytics';
import ApartmentManagementHome from './components/ApartmentManagementHome';
import ApartmentManagementOverview from './components/ApartmentManagementOverview';
import ApartmentManagementApplications from './components/ApartmentManagementApplications';
import ApartmentManagementRooms from './components/ApartmentManagementRooms';
import ApartmentManagementUtilities from './components/ApartmentManagementUtilities';
import ApartmentManagementDeposits from './components/ApartmentManagementDeposits';
import InventoryCheckEnhanced from './components/InventoryCheckEnhanced';
import InventoryHomePage from './components/InventoryHomePage';
import InventoryTasksPage from './components/InventoryTasksPage';
import InventoryDiscrepanciesPage from './components/InventoryDiscrepanciesPage';
import InventoryAnalyticsPage from './components/InventoryAnalyticsPage';
import PublicHouseQueryHome from './components/PublicHouseQueryHome';
import PublicHouseOnePersonMultiRoomQuery from './components/PublicHouseOnePersonMultiRoomQuery';
import PublicHouseOneRoomMultiPersonQuery from './components/PublicHouseOneRoomMultiPersonQuery';
import PublicHouseDeptOverviewQuery from './components/PublicHouseDeptOverviewQuery';
import PublicHouseQuotaQuery from './components/PublicHouseQuotaQuery';
import PublicHouseRoomUsageQueryPage from './components/PublicHouseRoomUsageQueryPage';
import PublicHouseCommercialQueryPage from './components/PublicHouseCommercialQueryPage';
import BigScreen from './components/BigScreen';
import Login from './components/Login';
import MyTodos from './components/MyTodos'; // New Component
import { UserRole } from './types';

// Updated Router State
export type View = 
  | 'cockpit'      // Decision Cockpit (was dashboard)
  | 'todos'        // My Todos (New)
  
  
  // Rule Engine
  | 'rules'        // Root/Default
  | 'rules-quota'
  | 'rules-fee'
  | 'rules-alert'

  | 'hall'         // Business Hall (Hub)
  // Sub-modules of Hall
  | 'assets'
  | 'assets-home'
  | 'assets-project-new'
  | 'assets-stock-import'
  | 'assets-apply'
  | 'assets-review'
  | 'assets-gaojibiao'
  | 'assets-room-functions'
  | 'assets-audit-log'
  | 'allocation' 
  | 'allocation-home'
  | 'allocation-approval'
  | 'allocation-resource'
  | 'allocation-adjust'
  | 'allocation-records'
  | 'allocation-analytics'
  | 'fees' 
  | 'fees-home'
  | 'fees-overview'
  | 'fees-persons'
  | 'fees-bills'
  | 'fees-payments'
  | 'fees-reminders'

  // Commercial housing split
  | 'commercial'
  | 'commercial-mgmt'
  | 'commercial-home'
  | 'commercial-overview'
  | 'commercial-spaces'
  | 'commercial-contracts'
  | 'commercial-rent'
  | 'commercial-analytics'

  | 'residence-mgmt'
  | 'residence-home'
  | 'apartment-overview'
  | 'apartment-applications'
  | 'apartment-rooms'
  | 'apartment-utilities'
  | 'apartment-deposits'

  | 'maintenance'
  | 'maintenance-home'
  | 'maintenance-repair'
  | 'maintenance-property'
  | 'maintenance-stats'
  | 'inventory'
  | 'inventory-home'
  | 'inventory-tasks'
  | 'inventory-discrepancies'
  | 'inventory-analytics'
  | 'public-house-query'
  | 'public-house-home'
  | 'public-house-one-person-multi-room'
  | 'public-house-one-room-multi-person'
  | 'public-house-dept-overview'
  | 'public-house-quota'
  | 'public-house-room-usage'
  | 'public-house-commercial'
  | 'reports'
  | 'reports-home'
  | 'reports-standard'
  | 'reports-custom'
  | 'reports-logs';
  

const viewToPath: Record<View, string> = {
  cockpit: '/',
  todos: '/todos',
  hall: '/hall',
  assets: '/hall/assets',
  'assets-home': '/hall/assets/home',
  'assets-project-new': '/hall/assets/project-new',
  'assets-stock-import': '/hall/assets/stock-import',
  'assets-apply': '/hall/assets/apply',
  'assets-review': '/hall/assets/review',
  'assets-gaojibiao': '/hall/assets/gaojibiao',
  'assets-room-functions': '/hall/assets/room-functions',
  'assets-audit-log': '/hall/assets/audit-log',
  allocation: '/hall/allocation',
  'allocation-home': '/hall/allocation/home',
  'allocation-approval': '/hall/allocation/approval',
  'allocation-resource': '/hall/allocation/resource',
  'allocation-adjust': '/hall/allocation/adjust',
  'allocation-records': '/hall/allocation/records',
  'allocation-analytics': '/hall/allocation/analytics',
  fees: '/hall/fees',
  'fees-home': '/hall/fees/home',
  'fees-overview': '/hall/fees/overview',
  'fees-persons': '/hall/fees/persons',
  'fees-bills': '/hall/fees/bills',
  'fees-payments': '/hall/fees/payments',
  'fees-reminders': '/hall/fees/reminders',
  commercial: '/hall/commercial',
  'commercial-mgmt': '/hall/commercial-mgmt',
  'commercial-home': '/hall/commercial-mgmt/home',
  'commercial-overview': '/hall/commercial-mgmt/overview',
  'commercial-spaces': '/hall/commercial-mgmt/spaces',
  'commercial-contracts': '/hall/commercial-mgmt/contracts',
  'commercial-rent': '/hall/commercial-mgmt/rent',
  'commercial-analytics': '/hall/commercial-mgmt/analytics',

  'residence-mgmt': '/hall/residence-mgmt',
  'residence-home': '/hall/residence-mgmt/home',
  'apartment-overview': '/hall/residence-mgmt/overview',
  'apartment-applications': '/hall/residence-mgmt/applications',
  'apartment-rooms': '/hall/residence-mgmt/rooms',
  'apartment-utilities': '/hall/residence-mgmt/utilities',
  'apartment-deposits': '/hall/residence-mgmt/deposits',


  maintenance: '/hall/maintenance',
  'maintenance-home': '/hall/maintenance/home',
  'maintenance-repair': '/hall/maintenance/repair',
  'maintenance-property': '/hall/maintenance/property',
  'maintenance-stats': '/hall/maintenance/stats',
  inventory: '/hall/inventory',
  'inventory-home': '/hall/inventory/home',
  'inventory-tasks': '/hall/inventory/tasks',
  'inventory-discrepancies': '/hall/inventory/discrepancies',
  'inventory-analytics': '/hall/inventory/analytics',
  'public-house-query': '/hall/public-house-query',
  'public-house-home': '/hall/public-house-query/home',
  'public-house-one-person-multi-room': '/hall/public-house-query/one-person-multi-room',
  'public-house-one-room-multi-person': '/hall/public-house-query/one-room-multi-person',
  'public-house-dept-overview': '/hall/public-house-query/dept-overview',
  'public-house-quota': '/hall/public-house-query/quota',
  'public-house-room-usage': '/hall/public-house-query/room-usage',
  'public-house-commercial': '/hall/public-house-query/commercial',
  reports: '/hall/reports',
  'reports-home': '/hall/reports/home',
  'reports-standard': '/hall/reports/standard',
  'reports-custom': '/hall/reports/custom',
  'reports-logs': '/hall/reports/logs',
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

  // Group expansion state inside Business Hall
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Helper to determine active section
  const isHallModule = ['assets', 'assets-home', 'assets-project-new', 'assets-stock-import', 'assets-apply', 'assets-review', 'assets-gaojibiao', 'assets-room-functions', 'assets-audit-log', 'allocation', 'allocation-home', 'allocation-approval', 'allocation-resource', 'allocation-adjust', 'allocation-records', 'allocation-analytics', 'fees', 'fees-home', 'fees-overview', 'fees-persons', 'fees-bills', 'fees-payments', 'fees-reminders', 'commercial', 'commercial-mgmt', 'commercial-home', 'commercial-overview', 'commercial-spaces', 'commercial-contracts', 'commercial-rent', 'commercial-analytics', 'residence-mgmt', 'residence-home', 'apartment-overview', 'apartment-applications', 'apartment-rooms', 'apartment-utilities', 'apartment-deposits', 'maintenance', 'maintenance-home', 'maintenance-repair', 'maintenance-property', 'maintenance-stats', 'inventory', 'inventory-home', 'inventory-tasks', 'inventory-discrepancies', 'inventory-analytics', 'public-house-query', 'public-house-home', 'public-house-one-person-multi-room', 'public-house-one-room-multi-person', 'public-house-dept-overview', 'public-house-quota', 'public-house-room-usage', 'public-house-commercial', 'reports', 'reports-home', 'reports-standard', 'reports-custom', 'reports-logs'].includes(currentView);
  const isHallSection = currentView === 'hall' || isHallModule;
  const isDigitalModule = ['digital-building', 'digital-room'].includes(currentView);
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
      case 'assets': return <Navigate to="/hall/assets/home" replace />;
      case 'assets-home': return <AssetsHomePage onNavigate={setCurrentView} />;
      case 'assets-project-new': return <AssetTransfer userRole={userRole} initialDetailTab="form" />;
      case 'assets-stock-import': return <AssetTransfer userRole={userRole} initialDetailTab="form" />;
      case 'assets-apply': return <AssetsApplyPage userRole={userRole} />;
      case 'assets-review': return <AssetsReviewPage userRole={userRole} />;
      case 'assets-gaojibiao': return <AssetTransfer userRole={userRole} initialDetailTab="gaojibiao" />;
      case 'assets-room-functions': return <AssetTransfer userRole={userRole} initialDetailTab="rooms" />;
      case 'assets-audit-log': return <AssetTransfer userRole={userRole} initialDetailTab="audit" />;
      case 'allocation': return <Navigate to="/hall/allocation/home" replace />;
      case 'allocation-home': return <HousingAllocationHome userRole={userRole} onNavigate={setCurrentView} />;
      case 'allocation-approval': return <HousingAllocationApproval userRole={userRole} />;
      case 'allocation-resource': return <HousingAllocationResource userRole={userRole} />;
      case 'allocation-adjust': return <HousingAllocationAdjust userRole={userRole} />;
      case 'allocation-records': return <HousingAllocationRecords userRole={userRole} />;
      case 'allocation-analytics': return <HousingAllocationAnalytics userRole={userRole} />;
      case 'fees': return <Navigate to="/hall/fees/home" replace />;
      case 'fees-home': return <FeeManagementHome userRole={userRole} onNavigate={setCurrentView} />;
      case 'fees-overview': return <FeeManagementOverview userRole={userRole} />;
      case 'fees-persons': return <FeeManagementPersons userRole={userRole} />;
      case 'fees-bills': return <FeeManagementBills userRole={userRole} />;
      case 'fees-payments': return <FeeManagementPayments userRole={userRole} />;
      case 'fees-reminders': return <FeeManagementReminders userRole={userRole} />;
      case 'maintenance': return <Navigate to="/hall/maintenance/home" replace />;
      case 'maintenance-home': return <MaintenanceHome userRole={userRole} onNavigate={setCurrentView} />;
      case 'maintenance-repair': return <MaintenanceRepair userRole={userRole} />;
      case 'maintenance-property': return <MaintenanceProperty userRole={userRole} />;
      case 'maintenance-stats': return <MaintenanceStats userRole={userRole} />;
      case 'reports': return <Navigate to="/hall/reports/home" replace />;
      case 'reports-home': return <ReportsHomePage onNavigate={setCurrentView} />;
      case 'reports-standard': return <ReportsStandardPage userRole={userRole} />;
      case 'reports-custom': return <ReportsCustomPage userRole={userRole} />;
      case 'reports-logs': return <ReportsLogsPage userRole={userRole} />;
      
      // Asset Digitalization (Sub-views)
      case 'digital':
      
      case 'digital-building': return <AssetDigitalization userRole={userRole} subView="building" />;
      case 'digital-room': return <AssetDigitalization userRole={userRole} subView="room" />;

      // Rule Engine (Sub-views)
      case 'rules':
      case 'rules-quota': return <RuleEngine subView="quota" />;
      case 'rules-fee': return <RuleEngine subView="fee" />;
      case 'rules-alert': return <RuleEngine subView="alert" />;

      // Placeholders
      case 'commercial': return <Navigate to="/hall/commercial-mgmt/home" replace />;
      case 'commercial-mgmt': return <Navigate to="/hall/commercial-mgmt/home" replace />;
      case 'commercial-home': return <CommercialManagementHome userRole={userRole} onNavigate={setCurrentView} />;
      case 'commercial-overview': return <CommercialManagementOverview userRole={userRole} />;
      case 'commercial-spaces': return <CommercialManagementSpaces userRole={userRole} />;
      case 'commercial-contracts': return <CommercialManagementContracts userRole={userRole} />;
      case 'commercial-rent': return <CommercialManagementRent userRole={userRole} />;
      case 'commercial-analytics': return <CommercialManagementAnalytics userRole={userRole} />;

      case 'residence-mgmt': return <Navigate to="/hall/residence-mgmt/home" replace />;
      case 'residence-home': return <ApartmentManagementHome userRole={userRole} onNavigate={setCurrentView} />;
      case 'apartment-overview': return <ApartmentManagementOverview userRole={userRole} />;
      case 'apartment-applications': return <ApartmentManagementApplications userRole={userRole} />;
      case 'apartment-rooms': return <ApartmentManagementRooms userRole={userRole} />;
      case 'apartment-utilities': return <ApartmentManagementUtilities userRole={userRole} />;
      case 'apartment-deposits': return <ApartmentManagementDeposits userRole={userRole} />;
      case 'inventory':
        return <Navigate to="/hall/inventory/home" replace />;
      case 'inventory-home':
        return <InventoryHomePage onNavigate={setCurrentView} />;
      case 'inventory-tasks':
        return <InventoryTasksPage />;
      case 'inventory-discrepancies':
        return <InventoryDiscrepanciesPage />;
      case 'inventory-analytics':
        return <InventoryAnalyticsPage />;
      case 'public-house-query':
        return <Navigate to="/hall/public-house-query/home" replace />;
      case 'public-house-home':
        return <PublicHouseQueryHome onNavigate={setCurrentView} />;
      case 'public-house-one-person-multi-room':
        return <PublicHouseOnePersonMultiRoomQuery />;
      case 'public-house-one-room-multi-person':
        return <PublicHouseOneRoomMultiPersonQuery />;
      case 'public-house-dept-overview':
        return <PublicHouseDeptOverviewQuery />;
      case 'public-house-quota':
        return <PublicHouseQuotaQuery />;
      case 'public-house-room-usage':
        return <PublicHouseRoomUsageQueryPage />;
      case 'public-house-commercial':
        return <PublicHouseCommercialQueryPage />;
        
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
        
        case 'digital-building': return <>{digitalCrumb} <span className="text-[#1f2329]"> / 房屋建筑</span></>;
        case 'digital-room': return <>{digitalCrumb} <span className="text-[#1f2329]"> / 房间原子单元</span></>;

        // Rules Breadcrumbs
        case 'rules': return '规则引擎';
        case 'rules-quota': return <>{rulesCrumb} <span className="text-[#1f2329]"> / 定额核算</span></>;
        case 'rules-fee': return <>{rulesCrumb} <span className="text-[#1f2329]"> / 收费策略</span></>;
        case 'rules-alert': return <>{rulesCrumb} <span className="text-[#1f2329]"> / 预警规则</span></>;

        // Hall Breadcrumbs
        case 'assets':
        case 'assets-home':
          return <>{hallCrumb} <span className="text-[#1f2329]"> / 资产转固与管理</span></>;
        case 'assets-project-new':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('assets-home')}> / 资产转固与管理</span> <span className="text-[#1f2329]"> / 新建工程项目</span></>;
        case 'assets-stock-import':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('assets-home')}> / 资产转固与管理</span> <span className="text-[#1f2329]"> / 存量房产导入</span></>;
        case 'assets-apply':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('assets-home')}> / 资产转固与管理</span> <span className="text-[#1f2329]"> / 转固申请</span></>;
        case 'assets-review':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('assets-home')}> / 资产转固与管理</span> <span className="text-[#1f2329]"> / 转固审核</span></>;
        case 'assets-gaojibiao':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('assets-home')}> / 资产转固与管理</span> <span className="text-[#1f2329]"> / 高基表映射</span></>;
        case 'assets-room-functions':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('assets-home')}> / 资产转固与管理</span> <span className="text-[#1f2329]"> / 房间功能划分</span></>;
        case 'assets-audit-log':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('assets-home')}> / 资产转固与管理</span> <span className="text-[#1f2329]"> / 操作记录</span></>;
        case 'allocation': return <>{hallCrumb} <span className="text-[#1f2329]"> / 公用房归口调配管理</span></>;
        case 'allocation-home': return <>{hallCrumb} <span className="text-[#1f2329]"> / 公用房归口调配管理</span></>;
        case 'allocation-approval': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('allocation-home')}> / 公用房归口调配管理</span> <span className="text-[#1f2329]"> / 用房审批</span></>;
        case 'allocation-resource': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('allocation-home')}> / 公用房归口调配管理</span> <span className="text-[#1f2329]"> / 房源分配</span></>;
        case 'allocation-adjust': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('allocation-home')}> / 公用房归口调配管理</span> <span className="text-[#1f2329]"> / 用房调整</span></>;
        case 'allocation-records': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('allocation-home')}> / 公用房归口调配管理</span> <span className="text-[#1f2329]"> / 调整记录</span></>;
        case 'allocation-analytics': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('allocation-home')}> / 公用房归口调配管理</span> <span className="text-[#1f2329]"> / 数据分析</span></>;
        case 'fees': return <>{hallCrumb} <span className="text-[#1f2329]"> / 校内公用房使用收费管理</span></>;
        case 'fees-home': return <>{hallCrumb} <span className="text-[#1f2329]"> / 校内公用房使用收费管理</span></>;
        case 'fees-overview': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('fees-home')}> / 校内公用房使用收费管理</span> <span className="text-[#1f2329]"> / 费用总览</span></>;
        case 'fees-persons': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('fees-home')}> / 校内公用房使用收费管理</span> <span className="text-[#1f2329]"> / 个人缴费</span></>;
        case 'fees-bills': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('fees-home')}> / 校内公用房使用收费管理</span> <span className="text-[#1f2329]"> / 账单管理</span></>;
        case 'fees-payments': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('fees-home')}> / 校内公用房使用收费管理</span> <span className="text-[#1f2329]"> / 缴费记录</span></>;
        case 'fees-reminders': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('fees-home')}> / 校内公用房使用收费管理</span> <span className="text-[#1f2329]"> / 催缴管理</span></>;
        case 'commercial': return <>{hallCrumb} <span className="text-[#1f2329]"> / 经营性用房管理</span></>;
        case 'commercial-mgmt': return <>{hallCrumb} <span className="text-[#1f2329]"> / 经营性用房管理</span></>;
        case 'commercial-home': return <>{hallCrumb} <span className="text-[#1f2329]"> / 经营性用房管理</span></>;
        case 'commercial-overview': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('commercial-home')}> / 经营性用房管理</span> <span className="text-[#1f2329]"> / 经营概览</span></>;
        case 'commercial-spaces': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('commercial-home')}> / 经营性用房管理</span> <span className="text-[#1f2329]"> / 房源管理</span></>;
        case 'commercial-contracts': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('commercial-home')}> / 经营性用房管理</span> <span className="text-[#1f2329]"> / 合同管理</span></>;
        case 'commercial-rent': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('commercial-home')}> / 经营性用房管理</span> <span className="text-[#1f2329]"> / 租金管理</span></>;
        case 'commercial-analytics': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('commercial-home')}> / 经营性用房管理</span> <span className="text-[#1f2329]"> / 数据分析</span></>;

        case 'residence-mgmt': return <>{hallCrumb} <span className="text-[#1f2329]"> / 公寓与宿舍管理</span></>;
        case 'residence-home': return <>{hallCrumb} <span className="text-[#1f2329]"> / 公寓与宿舍管理</span></>;
        case 'apartment-overview': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('residence-home')}> / 公寓与宿舍管理</span> <span className="text-[#1f2329]"> / 居住概览</span></>;
        case 'apartment-applications': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('residence-home')}> / 公寓与宿舍管理</span> <span className="text-[#1f2329]"> / 入住申请</span></>;
        case 'apartment-rooms': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('residence-home')}> / 公寓与宿舍管理</span> <span className="text-[#1f2329]"> / 房间管理</span></>;
        case 'apartment-utilities': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('residence-home')}> / 公寓与宿舍管理</span> <span className="text-[#1f2329]"> / 水电管理</span></>;
        case 'apartment-deposits': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('residence-home')}> / 公寓与宿舍管理</span> <span className="text-[#1f2329]"> / 押金管理</span></>;
        case 'maintenance': return <>{hallCrumb} <span className="text-[#1f2329]"> / 维修与物业服务</span></>;
        case 'maintenance-home': return <>{hallCrumb} <span className="text-[#1f2329]"> / 维修与物业服务</span></>;
        case 'maintenance-repair': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('maintenance-home')}> / 维修与物业服务</span> <span className="text-[#1f2329]"> / 维修工单</span></>;
        case 'maintenance-property': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('maintenance-home')}> / 维修与物业服务</span> <span className="text-[#1f2329]"> / 物业服务</span></>;
        case 'maintenance-stats': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('maintenance-home')}> / 维修与物业服务</span> <span className="text-[#1f2329]"> / 数据统计</span></>;

        case 'inventory':
        case 'inventory-home':
          return <>{hallCrumb} <span className="text-[#1f2329]"> / 房产盘点核查</span></>;
        case 'inventory-tasks':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('inventory-home')}> / 房产盘点核查</span> <span className="text-[#1f2329]"> / 盘点任务</span></>;
        case 'inventory-discrepancies':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('inventory-home')}> / 房产盘点核查</span> <span className="text-[#1f2329]"> / 差异处理</span></>;
        case 'inventory-analytics':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('inventory-home')}> / 房产盘点核查</span> <span className="text-[#1f2329]"> / 统计分析</span></>;

        case 'public-house-query':
        case 'public-house-home':
          return <>{hallCrumb} <span className="text-[#1f2329]"> / 公房综合查询</span></>;
        case 'public-house-one-person-multi-room':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('public-house-home')}> / 公房综合查询</span> <span className="text-[#1f2329]"> / 一人多房</span></>;
        case 'public-house-one-room-multi-person':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('public-house-home')}> / 公房综合查询</span> <span className="text-[#1f2329]"> / 一房多人</span></>;
        case 'public-house-dept-overview':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('public-house-home')}> / 公房综合查询</span> <span className="text-[#1f2329]"> / 部门概况</span></>;
        case 'public-house-quota':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('public-house-home')}> / 公房综合查询</span> <span className="text-[#1f2329]"> / 定额查询</span></>;
        case 'public-house-room-usage':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('public-house-home')}> / 公房综合查询</span> <span className="text-[#1f2329]"> / 公用房查询</span></>;
        case 'public-house-commercial':
          return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('public-house-home')}> / 公房综合查询</span> <span className="text-[#1f2329]"> / 商用房查询</span></>;

        case 'reports': return <>{hallCrumb} <span className="text-[#1f2329]"> / 统计报表中心</span></>;
        case 'reports-home': return <>{hallCrumb} <span className="text-[#1f2329]"> / 统计报表中心</span></>;
        case 'reports-standard': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('reports-home')}> / 统计报表中心</span> <span className="text-[#1f2329]"> / 教育部高基表</span></>;
        case 'reports-custom': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('reports-home')}> / 统计报表中心</span> <span className="text-[#1f2329]"> / 自定义报表</span></>;
        case 'reports-logs': return <>{hallCrumb} <span className="text-[#8f959e] cursor-pointer hover:text-[#3370ff]" onClick={() => setCurrentView('reports-home')}> / 统计报表中心</span> <span className="text-[#1f2329]"> / 操作日志</span></>;
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

  type HallMenuItem = {
    id: View;
    label: string;
    roles: UserRole[];
    children?: { id: View; label: string; roles: UserRole[] }[];
  };

  const hallSubMenus: HallMenuItem[] = [
    {
      id: 'assets',
      label: '资产转固与管理',
      roles: [UserRole.AssetAdmin],
      children: [
        { id: 'assets-project-new', label: '新建工程项目', roles: [UserRole.AssetAdmin] },
        { id: 'assets-stock-import', label: '存量房产导入', roles: [UserRole.AssetAdmin] },
        { id: 'assets-apply', label: '转固申请', roles: [UserRole.AssetAdmin] },
        { id: 'assets-review', label: '转固审核', roles: [UserRole.AssetAdmin] },
        { id: 'assets-gaojibiao', label: '高基表映射', roles: [UserRole.AssetAdmin] },
        { id: 'assets-room-functions', label: '房间功能划分', roles: [UserRole.AssetAdmin] },
        { id: 'assets-audit-log', label: '操作记录', roles: [UserRole.AssetAdmin] },
      ],
    },

    {
      id: 'allocation',
      label: '公用房归口调配管理',
      roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin],
      children: [
        { id: 'allocation-approval', label: '用房审批', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'allocation-resource', label: '房源分配', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'allocation-adjust', label: '用房调整', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'allocation-records', label: '调整记录', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'allocation-analytics', label: '数据分析', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
      ],
    },

    {
      id: 'fees',
      label: '校内公用房使用收费管理',
      roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin],
      children: [
        { id: 'fees-overview', label: '费用总览', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'fees-persons', label: '个人缴费', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'fees-bills', label: '账单管理', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'fees-payments', label: '缴费记录', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'fees-reminders', label: '催缴管理', roles: [UserRole.AssetAdmin] },
      ],
    },

    {
      id: 'commercial-mgmt',
      label: '经营性用房管理',
      roles: [UserRole.AssetAdmin, UserRole.Teacher, UserRole.Guest],
      children: [
        { id: 'commercial-overview', label: '经营概览', roles: [UserRole.AssetAdmin, UserRole.Teacher, UserRole.Guest] },
        { id: 'commercial-spaces', label: '房源管理', roles: [UserRole.AssetAdmin, UserRole.Teacher, UserRole.Guest] },
        { id: 'commercial-contracts', label: '合同管理', roles: [UserRole.AssetAdmin, UserRole.Teacher, UserRole.Guest] },
        { id: 'commercial-rent', label: '租金管理', roles: [UserRole.AssetAdmin, UserRole.Teacher, UserRole.Guest] },
        { id: 'commercial-analytics', label: '数据分析', roles: [UserRole.AssetAdmin, UserRole.Teacher, UserRole.Guest] },
      ],
    },

    {
      id: 'residence-mgmt',
      label: '公寓与宿舍管理',
      roles: [UserRole.AssetAdmin, UserRole.Teacher],
      children: [
        { id: 'apartment-overview', label: '居住概览', roles: [UserRole.AssetAdmin, UserRole.Teacher] },
        { id: 'apartment-applications', label: '入住申请', roles: [UserRole.AssetAdmin, UserRole.Teacher] },
        { id: 'apartment-rooms', label: '房间管理', roles: [UserRole.AssetAdmin, UserRole.Teacher] },
        { id: 'apartment-utilities', label: '水电管理', roles: [UserRole.AssetAdmin, UserRole.Teacher] },
        { id: 'apartment-deposits', label: '押金管理', roles: [UserRole.AssetAdmin, UserRole.Teacher] },
      ],
    },

    {
      id: 'maintenance',
      label: '维修与物业服务',
      roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin, UserRole.Teacher],
      children: [
        { id: 'maintenance-repair', label: '维修工单', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin, UserRole.Teacher] },
        { id: 'maintenance-property', label: '物业服务', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin, UserRole.Teacher] },
        { id: 'maintenance-stats', label: '数据统计', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
      ],
    },
    {
      id: 'inventory',
      label: '房产盘点核查',
      roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin],
      children: [
        { id: 'inventory-tasks', label: '盘点任务', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'inventory-discrepancies', label: '差异处理', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'inventory-analytics', label: '统计分析', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
      ],
    },
    {
      id: 'public-house-query',
      label: '公房综合查询',
      roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin],
      children: [
        { id: 'public-house-one-person-multi-room', label: '一人多房', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'public-house-one-room-multi-person', label: '一房多人', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'public-house-dept-overview', label: '部门概况', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'public-house-quota', label: '定额查询', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'public-house-room-usage', label: '公用房查询', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'public-house-commercial', label: '商用房查询', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
      ],
    },
    {
      id: 'reports',
      label: '统计报表中心',
      roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin],
      children: [
        { id: 'reports-standard', label: '教育部高基表', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'reports-custom', label: '自定义报表', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
        { id: 'reports-logs', label: '操作日志', roles: [UserRole.AssetAdmin, UserRole.CollegeAdmin] },
      ],
    },
  ];

  const digitalSubMenus: { id: View; label: string; }[] = [
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
                <h1 className="text-lg font-bold text-[#1f2329] tracking-tight">智慧福工</h1>
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
            <div className={`overflow-y-auto transition-all duration-300 ease-in-out ${isHallExpanded ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0'}`}>
              {hallSubMenus.filter(item => item.roles.includes(userRole)).map(item => {
                if (item.children) {
                  const groupHomeView: View =
                    item.id === 'allocation' ? 'allocation-home' :
                    item.id === 'fees' ? 'fees-home' :
                    item.id === 'commercial-mgmt' ? 'commercial-home' :
                    item.id === 'residence-mgmt' ? 'residence-home' :
                    item.id === 'maintenance' ? 'maintenance-home' :
                    item.id === 'assets' ? 'assets-home' :
                    item.id === 'public-house-query' ? 'public-house-home' :
                    item.id === 'inventory' ? 'inventory-home' :
                    item.id === 'reports' ? 'reports-home' :
                    item.id;
                  const groupViews = [groupHomeView, ...item.children.map(c => c.id)];
                  const isGroupModule = groupViews.includes(currentView);
                  const isGroupExpanded = expandedGroups[item.id] ?? isGroupModule;

                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => {
                          setExpandedGroups(prev => ({ ...prev, [item.id]: !(prev[item.id] ?? isGroupModule) }));
                          setCurrentView(groupHomeView);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2 mx-2 rounded-md transition-all duration-200 font-medium text-xs mb-1 max-w-[calc(100%-16px)] pl-11 ${
                          isGroupModule ? 'text-[#3370ff] bg-[#f0f5ff]' : 'text-[#646a73] hover:bg-[#f2f3f5] hover:text-[#1f2329]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isGroupModule ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isGroupExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
                        {item.children
                          .filter(child => child.roles.includes(userRole))
                          .map(child => (
                            <button
                              key={child.id}
                              onClick={() => {
                                setCurrentView(child.id);
                                setSidebarOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2 mx-2 rounded-md transition-all duration-200 font-medium text-xs mb-1 max-w-[calc(100%-16px)] pl-16 ${
                                currentView === child.id
                                  ? 'text-[#3370ff] bg-[#f0f5ff]'
                                  : 'text-[#646a73] hover:bg-[#f2f3f5] hover:text-[#1f2329]'
                              }`}
                            >
                              <span className="truncate">{child.label}</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  );
                }
                return <SubNavItem key={item.id} view={item.id} label={item.label} />;
              })}
            </div>
            
            {userRole === UserRole.AssetAdmin && (
              <>
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
                    <span className="text-[#8f959e]">智慧福工</span>
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