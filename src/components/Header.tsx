import React from 'react';
import type { User } from 'firebase/auth';

interface HeaderProps {
  currentDateDisplay: string;
  onEditClick: () => void;
  isAdmin: boolean;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentDateDisplay, onEditClick, isAdmin, user, onLogin, onLogout }) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <div className="bg-indigo-600 p-3 rounded-xl text-white shadow-lg shadow-indigo-100">
          <i className="fa-solid fa-calendar-check text-2xl"></i>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">每週值日生系統</h1>
          <p className="text-slate-500 font-medium">{currentDateDisplay}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <button
            onClick={onEditClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white transition-all rounded-xl font-medium shadow-md shadow-slate-200 active:scale-95"
          >
            <i className="fa-solid fa-pen-to-square"></i> 編輯名單
          </button>
        )}

        {user ? (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all rounded-xl font-medium"
          >
            <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full" />
            <span className="hidden sm:inline text-sm">{user.displayName}</span>
            <i className="fa-solid fa-right-from-bracket text-sm"></i>
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all rounded-xl font-medium shadow-sm"
          >
            <i className="fa-brands fa-google text-red-500"></i> 登入管理
          </button>
        )}
      </div>
    </header>
  );
};
