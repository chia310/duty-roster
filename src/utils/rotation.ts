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
 * 這裡把錨點日往後推整數週，讓本週的值日生在新名單下仍是同一個人；
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
  if (oldList.length === 0 || newList.length === 0) return undefined;

  const weeksElapsed = getWeeksDiff(now, startDate);
  const currentStudent = oldList[getDutyIndex(weeksElapsed, oldList.length)];

  const nextIndex = newList.findIndex((s) => isSameStudent(s, currentStudent));
  if (nextIndex === -1) return undefined; // 本週值日生被移出名單，無從對齊

  const weeksToShift = getDutyIndex(weeksElapsed - nextIndex, newList.length);
  if (weeksToShift === 0) return undefined; // 本週人選沒變，錨點不用動

  const realigned = new Date(startDate);
  realigned.setDate(realigned.getDate() + weeksToShift * 7);
  return realigned;
};
