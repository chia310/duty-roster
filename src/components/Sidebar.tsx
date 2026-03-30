import React, { useState } from 'react';

export interface UpcomingDuty {
  range: string;
  name: string;
}

interface SidebarProps {
  upcomingList: UpcomingDuty[];
  reminder: string;
  isAdmin: boolean;
  onSaveReminder: (reminder: string) => Promise<void>;
}

export const Sidebar: React.FC<SidebarProps> = ({ upcomingList, reminder, isAdmin, onSaveReminder }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setEditText(reminder);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setSaving(true);
    await onSaveReminder(trimmed);
    setSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-4">
          <i className="fa-solid fa-clock-rotate-left text-indigo-600"></i> 接續週次預告
        </h3>
        <div className="space-y-4">
          {upcomingList.map((item, idx) => (
            <div key={idx} className="group relative pl-4 border-l-2 border-slate-100 hover:border-indigo-400 transition-all">
                <div className="text-xs font-bold text-indigo-500 mb-1 flex items-center gap-1">
                    <i className="fa-solid fa-calendar text-[10px]"></i> {item.range}
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                    <span className="font-bold text-slate-700">{item.name}</span>
                    <i className="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-indigo-400"></i>
                </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-100 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-bold text-xl mb-3 flex items-center justify-between">
            小提醒
            {isAdmin && !isEditing && (
              <button
                onClick={handleEdit}
                className="text-sm font-medium bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-pen mr-1"></i> 編輯
              </button>
            )}
          </h3>
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-32 p-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/40 outline-none focus:border-white/60 resize-none text-sm leading-relaxed"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {saving ? '儲存中...' : '儲存'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-blue-50 text-sm leading-relaxed opacity-90">
              {reminder}
            </p>
          )}
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>
    </div>
  );
};
