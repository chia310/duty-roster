import React from 'react';

interface CurrentDutyProps {
  weekRangeDisplay: string;
  currentStudentName: string;
  fridayDate: string;
}

export const CurrentDuty: React.FC<CurrentDutyProps> = ({ weekRangeDisplay, currentStudentName, fridayDate }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 relative">
      <div className="bg-indigo-600 py-3 px-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold opacity-80">
          <i className="fa-solid fa-calendar-days"></i> {weekRangeDisplay}
        </div>
        <div className="text-xs uppercase tracking-[0.15em] font-bold opacity-70">Current Week</div>
      </div>

      <div className="px-6 py-4 flex items-center gap-5">
        <div className="shrink-0 w-14 h-14 bg-indigo-50 rounded-xl flex flex-col items-center justify-center border-2 border-indigo-100">
          <span className="text-[10px] font-bold text-indigo-400 leading-none">週五</span>
          <span className="text-lg font-black text-indigo-600 leading-tight">{fridayDate}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-indigo-500 font-bold mb-0.5">本週負責人</p>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {currentStudentName}
          </div>
        </div>
      </div>
    </div>
  );
};
