// utils/rotation.ts

import type { Student } from '../types';
import { getWeeksDiff } from './dateHelpers';

export const getDutyIndex = (weeksElapsed: number, count: number): number =>
  ((weeksElapsed % count) + count) % count;

// 有 email 就以 email 比對（同名時才分得出來），否則退回比對姓名
const isSameStudent = (a: Student, b: Student): boolean =>
  a.email && b.email ? a.email === b.email : a.name === b.name;

/**
 * 名單人數一變動，(週數 % 人數) 的除數就跟著變，本週和已排定的未來週次會整批位移。
 * 這裡把錨點日往後推整數週，讓已排定的週次維持原本的人；
 * 其他人的相對順序不變，新加入的人自然排在循環的最後。
 *
 * 只移動整數週，錨點仍落在星期一，週次區間顯示與 Apps Script 端的計算都不受影響。
 * 回傳 undefined 代表不需要（或無法）調整錨點。
 */
export const getRealignedStartDate = (
  oldList: Student[],
  newList: Student[],
  startDate: Date,
  now: Date
): Date | undefined => {
  // 人數沒變代表管理員是刻意調整順序（例如連假換班），那正是他要的結果，不能對齊回去
  if (oldList.length === newList.length) return undefined;
  if (oldList.length === 0 || newList.length === 0) return undefined;

  const weeksElapsed = getWeeksDiff(now, startDate);

  // 從本週往後找第一個還留在名單裡的人，以那一週為基準對齊。
  // 本週值日生剛好被移出名單時，至少讓後面已經公告出去的週次維持不變。
  for (let offset = 0; offset < oldList.length; offset++) {
    const week = weeksElapsed + offset;
    const student = oldList[getDutyIndex(week, oldList.length)];

    const index = newList.findIndex((s) => isSameStudent(s, student));
    if (index === -1) continue;

    const weeksToShift = getDutyIndex(week - index, newList.length);
    if (weeksToShift === 0) return undefined; // 人選沒變，錨點不用動

    const realigned = new Date(startDate);
    realigned.setDate(realigned.getDate() + weeksToShift * 7);
    return realigned;
  }

  return undefined; // 整份名單都換掉了，無從對齊
};
