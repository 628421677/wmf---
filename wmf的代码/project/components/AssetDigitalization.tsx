import React, { useState } from 'react';
import { 
  Map, 
  Building, 
  LayoutGrid, 
  Search,
  Maximize2,
  MousePointer2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { MOCK_LANDS, MOCK_BUILDINGS, MOCK_ROOMS } from '../constants';
import { UserRole } from '../types';

export type DigitalSubView = 'land' | 'building' | 'room';

interface AssetDigitalizationProps {
  userRole: UserRole;
  subView?: DigitalSubView;
}

const AssetDigitalization: React.FC<AssetDigitalizationProps> = ({ userRole, subView = 'land' }) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // Filter rooms based on selected building if any
  const displayedRooms = selectedBuildingId 
    ? MOCK_ROOMS.filter(r => r.buildingName === MOCK_BUILDINGS.find(b => b.id === selectedBuildingId)?.name)
    : MOCK_ROOMS;

  const getTitle = () => {
      switch(subView) {
          case 'land': return '土地资源管理';
          case 'building': return '房屋建筑管理';
          case 'room': return '房间原子单元管理';
          default: return '资产数字化管理';
      }
  };

  const getDescription = () => {
      switch(subView) {
          case 'land': return '全周期记录土地征迁进度与权属档案。';
          case 'building': return '楼宇全生命周期台账与图纸数字化挂接。';
          case 'room': return '建立“一房一档”，精细化管理物理空间。';
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
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white p-6 rounded-lg shadow-sm border border-[#dee0e3]">
        
        {/* LAND TAB */}
        {subView === 'land' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                        {MOCK_LANDS.length}
                    </div>
                    <div>
                        <div className="text-sm text-blue-800 font-medium">宗地总数</div>
                        <div className="text-xs text-blue-600">全校土地资产</div>
                    </div>
                </div>
                <div className="bg-green-50 border border-green-100 p-4 rounded-lg flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                         {(MOCK_LANDS.reduce((acc, cur) => acc + cur.area, 0) / 10000).toFixed(1)}
                    </div>
                    <div>
                        <div className="text-sm text-green-800 font-medium">总面积 (万m²)</div>
                        <div className="text-xs text-green-600">确权面积</div>
                    </div>
                </div>
             </div>

             <div className="overflow-hidden border border-[#dee0e3] rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f5f6f7] text-[#646a73] font-medium border-b border-[#dee0e3]">
                    <tr>
                      <th className="px-6 py-3">宗地名称</th>
                      <th className="px-6 py-3">土地证号</th>
                      <th className="px-6 py-3">面积 (m²)</th>
                      <th className="px-6 py-3">用地性质</th>
                      <th className="px-6 py-3">取得方式</th>
                      <th className="px-6 py-3">征迁状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dee0e3]">
                    {MOCK_LANDS.map(land => (
                      <tr key={land.id} className="hover:bg-[#f9f9f9]">
                        <td className="px-6 py-4 font-medium text-[#1f2329]">{land.name}</td>
                        <td className="px-6 py-4 font-mono text-xs">{land.certNo}</td>
                        <td className="px-6 py-4">{land.area.toLocaleString()}</td>
                        <td className="px-6 py-4">
                           {land.type === 'Campus' ? '校区用地' : '生活区用地'}
                        </td>
                        <td className="px-6 py-4">
                           {land.acquisitionMethod === 'Allocation' ? '划拨' : '出让'}
                        </td>
                        <td className="px-6 py-4">
                           <StatusTag status={land.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {/* BUILDING TAB */}
        {subView === 'building' && (
          <div className="flex flex-col lg:flex-row gap-6 h-full">
             {/* Left List */}
             <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-[#1f2329]">楼宇台账</h3>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]"/>
                        <input type="text" placeholder="搜索楼宇..." className="pl-9 pr-3 py-1.5 border border-[#dee0e3] rounded text-sm focus:border-[#3370ff] outline-none" />
                    </div>
                </div>
                <div className="grid gap-4">
                    {MOCK_BUILDINGS.map(b => (
                        <div 
                            key={b.id} 
                            onClick={() => setSelectedBuildingId(b.id)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedBuildingId === b.id ? 'border-[#3370ff] bg-[#f0f5ff]' : 'border-[#dee0e3] hover:border-[#3370ff] hover:bg-[#fcfcfd]'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-[#1f2329]">{b.name}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded ${b.status === 'TitleDeed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {b.status === 'TitleDeed' ? '已办证' : '在建/未办证'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-y-1 text-xs text-[#646a73]">
                                <p>编号: {b.code}</p>
                                <p>结构: {b.structure === 'Frame' ? '框架' : b.structure === 'BrickConcrete' ? '砖混' : '钢构'}</p>
                                <p>层数: {b.floorCount}层</p>
                                <p>原值: ¥{(b.value / 10000).toFixed(0)}万</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* Right Visualization (CAD Mock) */}
             <div className="flex-[2] bg-[#1f2329] rounded-lg border border-[#1f2329] overflow-hidden flex flex-col relative min-h-[400px]">
                <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded backdrop-blur-md text-sm">
                    {selectedBuildingId ? MOCK_BUILDINGS.find(b => b.id === selectedBuildingId)?.name : '请选择楼宇'} - 图纸数字化视图
                </div>
                
                <div className="flex-1 flex items-center justify-center relative bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Floor_plan.jpg/800px-Floor_plan.jpg')] bg-cover bg-center opacity-80">
                    <div className="absolute inset-0 bg-blue-900/20 pointer-events-none"></div>
                    
                    {/* Simulated Interactive Zones */}
                    {selectedBuildingId && (
                        <>
                           <div className="absolute top-1/3 left-1/4 w-24 h-24 border-2 border-[#3370ff] bg-[#3370ff]/20 hover:bg-[#3370ff]/40 cursor-pointer flex items-center justify-center text-white font-bold text-xs group relative">
                              <span>RM-101</span>
                              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded whitespace-nowrap">
                                  行政办公 | 120m²
                              </div>
                           </div>
                           <div className="absolute bottom-1/3 right-1/4 w-32 h-20 border-2 border-[#059669] bg-[#059669]/20 hover:bg-[#059669]/40 cursor-pointer flex items-center justify-center text-white font-bold text-xs group relative">
                              <span>RM-102</span>
                              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded whitespace-nowrap">
                                  财务处 | 80m²
                              </div>
                           </div>
                        </>
                    )}
                    
                    {!selectedBuildingId && (
                        <div className="bg-black/60 p-6 rounded text-white text-center">
                            <MousePointer2 className="mx-auto mb-2" />
                            请从左侧列表选择楼宇以加载图纸
                        </div>
                    )}
                </div>

                <div className="h-12 bg-[#2d3138] border-t border-white/10 flex items-center px-4 justify-between flex-shrink-0">
                     <div className="flex gap-4 text-xs text-white/70">
                         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#3370ff]/50 border border-[#3370ff]"></div> 办公用房</div>
                         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#059669]/50 border border-[#059669]"></div> 教学用房</div>
                         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#d97706]/50 border border-[#d97706]"></div> 后勤设施</div>
                     </div>
                     <button className="text-white hover:text-[#3370ff] transition-colors">
                         <Maximize2 size={16} />
                     </button>
                </div>
             </div>
          </div>
        )}

        {/* ROOM TAB */}
        {subView === 'room' && (
           <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                  {['全部', '教学科研', '行政办公', '后勤保障', '学生用房', '经营周转'].map(type => (
                      <button key={type} className="px-3 py-1.5 rounded-full border border-[#dee0e3] text-sm text-[#646a73] hover:border-[#3370ff] hover:text-[#3370ff] bg-white transition-colors">
                          {type}
                      </button>
                  ))}
              </div>

              <div className="overflow-hidden border border-[#dee0e3] rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f5f6f7] text-[#646a73] font-medium border-b border-[#dee0e3]">
                    <tr>
                      <th className="px-6 py-3">房间号</th>
                      <th className="px-6 py-3">所属楼宇</th>
                      <th className="px-6 py-3">归口单位</th>
                      <th className="px-6 py-3">面积 (m²)</th>
                      <th className="px-6 py-3">功能分类</th>
                      <th className="px-6 py-3">使用状态</th>
                      <th className="px-6 py-3">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dee0e3]">
                    {displayedRooms.map(room => (
                      <tr key={room.id} className="hover:bg-[#f9f9f9]">
                        <td className="px-6 py-4 font-bold text-[#1f2329]">{room.roomNo}</td>
                        <td className="px-6 py-4 text-[#646a73]">{room.buildingName}</td>
                        <td className="px-6 py-4">{room.department}</td>
                        <td className="px-6 py-4">{room.area}</td>
                        <td className="px-6 py-4">
                           <TypeTag type={room.type} />
                        </td>
                        <td className="px-6 py-4">
                           <RoomStatusTag status={room.status} />
                        </td>
                        <td className="px-6 py-4 text-[#3370ff] cursor-pointer hover:underline text-xs">
                            详情/变更
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
        )}

      </div>
    </div>
  );
};

// UI Helpers

const StatusTag = ({ status }: { status: string }) => {
    switch(status) {
        case 'Stored': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">已入库</span>;
        case 'InProgress': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">征迁中</span>;
        case 'Unstarted': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">未征迁</span>;
        default: return null;
    }
};

const TypeTag = ({ type }: { type: string }) => {
    const map: Record<string, string> = {
        Teaching: '教学科研',
        Admin: '行政办公',
        Logistics: '后勤保障',
        Student: '学生用房',
        Commercial: '经营周转'
    };
    const colors: Record<string, string> = {
        Teaching: 'bg-blue-50 text-blue-600 border-blue-100',
        Admin: 'bg-purple-50 text-purple-600 border-purple-100',
        Logistics: 'bg-gray-50 text-gray-600 border-gray-100',
        Student: 'bg-green-50 text-green-600 border-green-100',
        Commercial: 'bg-amber-50 text-amber-600 border-amber-100'
    };
    return (
        <span className={`px-2 py-0.5 rounded border text-xs ${colors[type] || ''}`}>
            {map[type] || type}
        </span>
    );
};

const RoomStatusTag = ({ status }: { status: string }) => {
    switch(status) {
        case 'SelfUse': return <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle size={12}/> 自用</span>;
        case 'Maintenance': return <span className="flex items-center gap-1 text-xs text-orange-600"><AlertCircle size={12}/> 维修中</span>;
        case 'Empty': return <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={12}/> 空置</span>;
        default: return <span className="text-xs">{status}</span>;
    }
};

export default AssetDigitalization;