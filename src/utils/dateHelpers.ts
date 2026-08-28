// utils/dateHelpers.ts

export const getInitialMonday = (): Date => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const getWeeksDiff = (date1: Date, date2: Date): number => {
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor((date1.getTime() - date2.getTime()) / oneWeek);
};

// 以「當地時區」的年月日組出 YYYY-MM-DD。
// 不能用 toISOString()：它會先轉成 UTC，在 UTC+8 會退成前一天，
// 讓錨點日從星期一變成星期日，週次區間與 Apps Script 的計算都會跟著跑掉。
export const formatDateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const getWeekRangeString = (baseDate: Date, weeksFromBase: number): string => {
  const start = new Date(baseDate);
  start.setDate(start.getDate() + weeksFromBase * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const format = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${format(start)} ~ ${format(end)}`;
};
