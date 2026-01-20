import React from 'react';
import { ListTodo, Calendar, ChevronsRight } from 'lucide-react';
import { MOCK_TODOS } from '../constants';
import { TodoItem } from '../types';
import { View } from '../App'; // Assuming View is exported from App.tsx

interface MyTodosProps {
  onNavigate: (view: View) => void;
}

const MyTodos: React.FC<MyTodosProps> = ({ onNavigate }) => {

  const getPriorityClass = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High': return 'border-l-red-500';
      case 'Medium': return 'border-l-yellow-500';
      case 'Low': return 'border-l-blue-500';
    }
  };

  const handleNavigate = (module: string) => {
    const viewMap: { [key: string]: View } = {
      '维修与物业': 'maintenance',
      '公用房归口调配': 'allocation',
      '公用房使用收费': 'fees',
      '资产建设与转固': 'assets',
    };
    const view = viewMap[module];
    if (view) {
      onNavigate(view);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2329]">我的待办</h2>
          <p className="text-[#646a73]">集中处理各业务模块的关键待办事项。</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#dee0e3] shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <ListTodo size={20} className="text-[#3370ff]" />
            待办列表
          </h3>
        </div>
        <div className="divide-y divide-[#dee0e3]">
          {MOCK_TODOS.map(todo => (
            <div key={todo.id} className={`flex items-center p-4 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityClass(todo.priority)}`}>
              <div className="flex-1">
                <p className="font-semibold text-base text-[#1f2329]">{todo.title}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  <span className="font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{todo.module}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    截止日期: {todo.dueDate}
                  </span>
                </div>
              </div>
              <button onClick={() => handleNavigate(todo.module)} className="flex items-center gap-1 text-sm font-medium text-[#3370ff] hover:underline">
                去处理 <ChevronsRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyTodos;