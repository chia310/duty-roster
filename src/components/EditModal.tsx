import React, { useState, useEffect } from 'react';
import type { Student } from '../types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newList: Student[]) => void;
  currentStudents: Student[];
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, currentStudents }) => {
  const [editList, setEditList] = useState<Student[]>([]);

  useEffect(() => {
    if (isOpen) {
      setEditList(currentStudents.map(s => ({ ...s })));
    }
  }, [isOpen, currentStudents]);

  if (!isOpen) return null;

  const handleChange = (index: number, field: 'name' | 'email', value: string) => {
    const updated = [...editList];
    updated[index] = { ...updated[index], [field]: value };
    setEditList(updated);
  };

  const handleAdd = () => {
    setEditList([...editList, { name: '', email: '' }]);
  };

  const handleRemove = (index: number) => {
    setEditList(editList.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const filtered = editList.filter(s => s.name.trim() !== '');
    if (filtered.length > 0) {
      onSave(filtered.map(s => ({ name: s.name.trim(), email: s.email.trim() })));
      onClose();
    } else {
      alert("請至少輸入一個姓名！");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <i className="fa-solid fa-users-gear text-xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">編輯學生名單</h2>
            </div>
            <p className="text-slate-400 text-sm">輸入每位同學的姓名與 Email（用於寄送值日提醒）。</p>
        </div>
        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-3">
          {editList.map((student, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-400 text-sm font-bold w-6 text-center">{idx + 1}</span>
              <input
                type="text"
                value={student.name}
                onChange={(e) => handleChange(idx, 'name', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 text-sm"
                placeholder="姓名"
              />
              <input
                type="email"
                value={student.email}
                onChange={(e) => handleChange(idx, 'email', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 text-sm"
                placeholder="email（選填）"
              />
              <button
                onClick={() => handleRemove(idx)}
                className="text-slate-300 hover:text-red-400 transition-colors p-1"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          ))}
          <button
            onClick={handleAdd}
            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors text-sm font-medium"
          >
            <i className="fa-solid fa-plus mr-1"></i> 新增同學
          </button>
        </div>
        <div className="p-6 bg-slate-50 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
            >
                取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
            >
                <i className="fa-solid fa-check"></i> 更新名單
            </button>
        </div>
      </div>
    </div>
  );
};
