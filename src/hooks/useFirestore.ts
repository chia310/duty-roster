import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Student } from '../types';

const DEFAULT_STUDENTS: Student[] = [
  { name: "陳小明", email: "" },
  { name: "林美玲", email: "" },
  { name: "張大華", email: "" },
  { name: "李小龍", email: "" },
  { name: "王大明", email: "" },
];
const DEFAULT_RULES = [
  "早上 07:30 前完成基本打掃與黑板清理。",
  "每節下課後確認講台整潔。",
  "放學前確認垃圾已清空，窗戶已鎖好。",
  "週五放學時進行額外的大掃除項目。"
];
const DEFAULT_REMINDER = "週次是以每週一作為起始。如果名單中的人數不足，系統會自動循環。若有特殊連假調整，請點擊編輯名單更換順序。";

interface FirestoreData {
  students: Student[];
  rules: string[];
  reminder: string;
  startDate: Date;
  loading: boolean;
  updateStudents: (students: Student[]) => Promise<void>;
  updateRules: (rules: string[]) => Promise<void>;
  updateReminder: (reminder: string) => Promise<void>;
  updateStartDate: (date: Date) => Promise<void>;
}

const CONFIG_DOC = doc(db, 'config', 'main');

export function useFirestore(): FirestoreData {
  const [students, setStudents] = useState<Student[]>(DEFAULT_STUDENTS);
  const [rules, setRules] = useState<string[]>(DEFAULT_RULES);
  const [reminder, setReminder] = useState<string>(DEFAULT_REMINDER);
  const [startDate, setStartDate] = useState<Date>(new Date('2026-03-30'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);

    const unsubscribe = onSnapshot(CONFIG_DOC, (snapshot) => {
      clearTimeout(timeout);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.students?.length) {
          // 相容舊格式：如果是 string[] 就轉換為 Student[]
          const raw = data.students;
          if (typeof raw[0] === 'string') {
            setStudents(raw.map((name: string) => ({ name, email: '', chatUserId: '' })));
          } else {
            setStudents(raw as Student[]);
          }
        }
        if (data.rules?.length) setRules(data.rules);
        if (data.reminder) setReminder(data.reminder);
        if (data.startDate) setStartDate(new Date(data.startDate));
      }
      setLoading(false);
    }, () => {
      clearTimeout(timeout);
      setLoading(false);
    });
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const updateStudents = async (newStudents: Student[]) => {
    await setDoc(CONFIG_DOC, { students: newStudents.map(s => ({ name: s.name, email: s.email, chatUserId: s.chatUserId || '' })) }, { merge: true });
  };

  const updateRules = async (newRules: string[]) => {
    await updateDoc(CONFIG_DOC, { rules: newRules });
  };

  const updateReminder = async (newReminder: string) => {
    await updateDoc(CONFIG_DOC, { reminder: newReminder });
  };

  const updateStartDate = async (date: Date) => {
    await updateDoc(CONFIG_DOC, { startDate: date.toISOString().split('T')[0] });
  };

  return { students, rules, reminder, startDate, loading, updateStudents, updateRules, updateReminder, updateStartDate };
}
