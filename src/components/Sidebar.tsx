import React from 'react';

export interface UpcomingDuty {
  range: string;
  name: string;
}

interface SidebarProps {
  upcomingList: UpcomingDuty[];
}

export const Sidebar: React.FC<SidebarProps> = ({ upcomingList }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-3">
        <i className="fa-solid fa-clock-rotate-left text-indigo-600"></i> 接續週次預告
      </h3>
      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
        {upcomingList.map((item, idx) => (
          <div key={idx} className="group relative pl-3 border-l-2 border-slate-100 hover:border-indigo-400 transition-all">
              <div className="text-xs font-bold text-indigo-500 mb-0.5 flex items-center gap-1">
                  <i className="fa-solid fa-calendar text-[10px]"></i> {item.range}
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                  <span className="font-bold text-slate-700 text-sm">{item.name}</span>
                  <i className="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-indigo-400"></i>
              </div>
          </div>
        ))}
      </div>
    </div>
  );
};
