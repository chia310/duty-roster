import React, { useState } from 'react';

interface RulesBoardProps {
  rules: string[];
  isAdmin: boolean;
  onSave: (rules: string[]) => Promise<void>;
}

export const RulesBoard: React.FC<RulesBoardProps> = ({ rules, isAdmin, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editRules, setEditRules] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setEditRules([...rules]);
    setIsEditing(true);
  };

  const handleRuleChange = (index: number, value: string) => {
    const updated = [...editRules];
    updated[index] = value;
    setEditRules(updated);
  };

  const handleAddRule = () => {
    setEditRules([...editRules, '']);
  };

  const handleRemoveRule = (index: number) => {
    setEditRules(editRules.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const filtered = editRules.map(r => r.trim()).filter(r => r !== '');
    if (filtered.length === 0) return;
    setSaving(true);
    await onSave(filtered);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // 編輯模式
  if (isEditing) {
    return (
      <div className="chalkboard rounded-2xl p-8 text-white relative">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 border-b border-white/20 pb-4">
          <span className="w-4 h-4 bg-yellow-300 rounded-full"></span>
          編輯守則
        </h3>
        <div className="space-y-3">
          {editRules.map((rule, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <span className="text-yellow-300 font-bold text-lg mt-2">{String(idx + 1).padStart(2, '0')}</span>
              <input
                type="text"
                value={rule}
                onChange={(e) => handleRuleChange(idx, e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 outline-none focus:border-yellow-300"
                placeholder="輸入守則內容..."
              />
              <button
                onClick={() => handleRemoveRule(idx)}
                className="text-red-300 hover:text-red-200 mt-2"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleAddRule}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
          >
            <i className="fa-solid fa-plus mr-1"></i> 新增守則
          </button>
          <div className="flex-1"></div>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            {saving ? '儲存中...' : '儲存'}
          </button>
        </div>
      </div>
    );
  }

  // 顯示模式
  const half = Math.ceil(rules.length / 2);
  const leftRules = rules.slice(0, half);
  const rightRules = rules.slice(half);

  return (
    <div className="chalkboard rounded-2xl p-8 text-white relative">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 border-b border-white/20 pb-4">
        <span className="w-4 h-4 bg-yellow-300 rounded-full"></span>
        值日生守則 (每週任務)
        {isAdmin && (
          <button
            onClick={handleEdit}
            className="ml-auto text-sm font-medium bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-pen mr-1"></i> 編輯
          </button>
        )}
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {leftRules.map((rule, idx) => (
            <div key={idx} className="flex gap-4">
              <span className="text-yellow-300 font-bold text-xl">{String(idx + 1).padStart(2, '0')}</span>
              <p className="text-slate-100 leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {rightRules.map((rule, idx) => (
            <div key={idx} className="flex gap-4">
              <span className="text-yellow-300 font-bold text-xl">{String(half + idx + 1).padStart(2, '0')}</span>
              <p className="text-slate-100 leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
