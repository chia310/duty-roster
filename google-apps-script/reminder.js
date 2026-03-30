/**
 * 值日生信件提醒 — Google Apps Script
 *
 * 使用方式：
 * 1. 前往 https://script.google.com 建立新專案
 * 2. 將此檔案內容貼入 Code.gs
 * 3. 修改下方 CONFIG 區塊的設定值
 * 4. 執行 setupTriggers() 函數來建立定時觸發器
 * 5. 授權存取 Gmail 和外部服務
 *
 * 觸發時間：
 * - 每週一 07:00 寄出「本週值日生提醒」給當週值日生
 * - 每週五 07:00 寄出「週五大掃除提醒」給當週值日生
 *
 * 資料格式：
 * Firestore config/main.students 為物件陣列：
 * [{ name: "姓名", email: "xxx@gmail.com" }, ...]
 * 只有有填 email 的值日生才會收到提醒信
 */

// ============ 設定區 ============
var CONFIG = {
  FIREBASE_PROJECT_ID: 'duty-roster-oaedu',

  FIREBASE_API_KEY: 'AIzaSyCo8ljP5YTivG5jkudEl9DhqU3964qrtfA',

  // 值日生系統網址
  ROSTER_URL: 'https://chia310.github.io/duty-roster/',

  // 寄件人顯示名稱
  SENDER_NAME: '值日生系統'
};

// ============ 主要函數 ============

/**
 * 一次性執行：建立每週一和週五的定時觸發器
 */
function setupTriggers() {
  // 清除舊的觸發器
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // 每週一 07:00
  ScriptApp.newTrigger('sendMondayReminder')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(7)
    .create();

  // 每週五 07:00
  ScriptApp.newTrigger('sendFridayReminder')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(7)
    .create();

  Logger.log('觸發器已建立：每週一、週五 07:00');
}

/**
 * 週一提醒 — 只寄給當週值日生
 */
function sendMondayReminder() {
  var data = getFirestoreConfig();
  if (!data) return;

  var student = getCurrentDutyStudent(data.students);
  if (!student || !student.email) {
    Logger.log('當週值日生沒有設定 email，跳過寄信。值日生：' + (student ? student.name : '無'));
    return;
  }

  var weekRange = getThisWeekRange();
  var subject = '【值日生提醒】' + student.name + '，本週輪到你值日！';
  var body = [
    student.name + ' 你好！',
    '',
    '本週（' + weekRange + '）輪到你擔任值日生。',
    '',
    '📌 本週任務：',
    '1. 早上 07:30 前完成基本打掃與黑板清理',
    '2. 每節下課後確認講台整潔',
    '3. 放學前確認垃圾已清空，窗戶已鎖好',
    '4. 週五放學時進行額外的大掃除項目',
    '',
    '🔗 查看值日生系統：' + CONFIG.ROSTER_URL,
    '',
    '— 此信件由值日生系統自動發送'
  ].join('\n');

  GmailApp.sendEmail(student.email, subject, body, {
    name: CONFIG.SENDER_NAME
  });

  Logger.log('週一提醒已寄出給 ' + student.name + '（' + student.email + '）');
}

/**
 * 週五提醒 — 只寄給當週值日生
 */
function sendFridayReminder() {
  var data = getFirestoreConfig();
  if (!data) return;

  var student = getCurrentDutyStudent(data.students);
  if (!student || !student.email) {
    Logger.log('當週值日生沒有設定 email，跳過寄信。值日生：' + (student ? student.name : '無'));
    return;
  }

  var subject = '【大掃除提醒】' + student.name + '，今天是週五大掃除日！';
  var body = [
    student.name + ' 你好！',
    '',
    '今天是週五，除了日常清潔外，請記得進行額外的大掃除項目：',
    '• 擦拭窗台與窗戶',
    '• 整理書櫃和置物區',
    '• 掃拖教室地板',
    '• 清理垃圾桶周圍',
    '',
    '辛苦了，祝週末愉快！🎉',
    '',
    '🔗 查看值日生系統：' + CONFIG.ROSTER_URL,
    '',
    '— 此信件由值日生系統自動發送'
  ].join('\n');

  GmailApp.sendEmail(student.email, subject, body, {
    name: CONFIG.SENDER_NAME
  });

  Logger.log('週五提醒已寄出給 ' + student.name + '（' + student.email + '）');
}

// ============ 輔助函數 ============

/**
 * 從 Firestore 讀取 config/main 文件
 * students 格式：[{ name: "姓名", email: "xxx@gmail.com" }, ...]
 */
function getFirestoreConfig() {
  var url = 'https://firestore.googleapis.com/v1/projects/' +
    CONFIG.FIREBASE_PROJECT_ID +
    '/databases/(default)/documents/config/main?key=' +
    CONFIG.FIREBASE_API_KEY;

  try {
    var response = UrlFetchApp.fetch(url);
    var json = JSON.parse(response.getContentText());
    var fields = json.fields;

    var students = fields.students.arrayValue.values.map(function(v) {
      // 新格式：物件 { name, email }
      if (v.mapValue) {
        var f = v.mapValue.fields;
        return {
          name: f.name ? f.name.stringValue : '',
          email: f.email ? f.email.stringValue : ''
        };
      }
      // 舊格式：純字串（相容）
      return { name: v.stringValue || '', email: '' };
    });

    return { students: students };
  } catch (e) {
    Logger.log('讀取 Firestore 失敗：' + e.message);
    return null;
  }
}

/**
 * 計算本週值日生（與前端邏輯一致）
 * 回傳 { name, email } 物件
 */
function getCurrentDutyStudent(students) {
  if (!students || students.length === 0) return null;

  var now = new Date();
  var baseDate = getMonday(now);
  var epoch = new Date(2025, 0, 6); // 2025-01-06 週一作為基準點
  var weeksDiff = Math.round((baseDate.getTime() - epoch.getTime()) / (7 * 24 * 60 * 60 * 1000));
  var index = ((weeksDiff % students.length) + students.length) % students.length;

  return students[index];
}

/**
 * 取得本週一的日期
 */
function getMonday(date) {
  var d = new Date(date);
  var day = d.getDay();
  var diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 取得本週範圍字串，如 "3/31 ~ 4/6"
 */
function getThisWeekRange() {
  var monday = getMonday(new Date());
  var sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  return (monday.getMonth() + 1) + '/' + monday.getDate() +
    ' ~ ' +
    (sunday.getMonth() + 1) + '/' + sunday.getDate();
}

/**
 * 手動測試用：直接執行寄出週一提醒
 */
function testMondayReminder() {
  sendMondayReminder();
}

/**
 * 手動測試用：直接執行寄出週五提醒
 */
function testFridayReminder() {
  sendFridayReminder();
}
