import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CurrentDuty } from './components/CurrentDuty';
import { RulesBoard } from './components/RulesBoard';
import { Sidebar } from './components/Sidebar';
import type { UpcomingDuty } from './components/Sidebar';
import { EditModal } from './components/EditModal';
import { getInitialMonday, getWeeksDiff, getWeekRangeString } from './utils/dateHelpers';
import { useAuth } from './hooks/useAuth';
import { useFirestore } from './hooks/useFirestore';
import type { Student } from './types';

function App() {
  const { user, isAdmin, login, logout } = useAuth();
  const { students, rules, reminder, loading, updateStudents, updateRules, updateReminder } = useFirestore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  // 更新時間
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveStudents = async (newList: Student[]) => {
    await updateStudents(newList);
  };

  const baseDate = useMemo(() => getInitialMonday(), []);

  const stateData = useMemo(() => {
    if (students.length === 0) return null;

    const weeksElapsed = getWeeksDiff(now, baseDate);

    // Header data
    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const currentDateDisplay = `今日是：${now.toLocaleDateString('zh-TW', dateOptions)}`;

    // Current duty data
    const currentWeekRange = getWeekRangeString(baseDate, weeksElapsed);
    const currentIndex = ((weeksElapsed % students.length) + students.length) % students.length;
    const currentStudentName = students[currentIndex].name;

    // Upcoming list
    const upcomingList: UpcomingDuty[] = [];
    for (let i = 1; i <= 5; i++) {
        const targetWeek = weeksElapsed + i;
        const studentIndex = ((targetWeek % students.length) + students.length) % students.length;
        upcomingList.push({
            range: getWeekRangeString(baseDate, targetWeek),
            name: students[studentIndex].name
        });
    }

    return {
        currentDateDisplay,
        currentWeekRange,
        currentStudentName,
        upcomingList
    };
  }, [students, now, baseDate]);

  if (loading || !stateData) {
      return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-indigo-500 font-bold">載入中...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <Header
        currentDateDisplay={stateData.currentDateDisplay}
        onEditClick={() => setIsModalOpen(true)}
        isAdmin={isAdmin}
        user={user}
        onLogin={login}
        onLogout={logout}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <CurrentDuty
            weekRangeDisplay={stateData.currentWeekRange}
            currentStudentName={stateData.currentStudentName}
          />
          <RulesBoard
            rules={rules}
            isAdmin={isAdmin}
            onSave={updateRules}
          />
        </div>

        <Sidebar
          upcomingList={stateData.upcomingList}
          reminder={reminder}
          isAdmin={isAdmin}
          onSaveReminder={updateReminder}
        />
      </div>

      <footer className="mt-12 text-center text-slate-400 text-sm">
        班級自動化管理系統 • 智慧輪替 React 版
      </footer>

      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStudents}
        currentStudents={students}
      />
    </div>
  );
}

export default App;
