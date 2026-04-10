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
  SENDER_NAME: '值日生系統',

  // Google Chat Webhook URL
  CHAT_WEBHOOK_URL: 'https://chat.googleapis.com/v1/spaces/AAAAqHVBRTE/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=1eovnDTvqxfT5UG4w3rblTT9MzvvFx3mJTEgomMPuoQ'
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

  var student = getCurrentDutyStudent(data.students, data.startDate);
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
    '本週任務：',
    '1. 本週五下午五點前，將公共垃圾（辦公室＋廁所）拿到樓梯間，往五樓方向移動的垃圾集中處。',
    '2. 確認公共空間狀況，是否有紙箱需要回收或協助清理。',
    '',
    '查看值日生系統：' + CONFIG.ROSTER_URL,
    '',
    '— 此信件由值日生系統自動發送'
  ].join('\n');

  GmailApp.sendEmail(student.email, subject, body, {
    name: CONFIG.SENDER_NAME
  });

  Logger.log('週一提醒已寄出給 ' + student.name + '（' + student.email + '）');

  sendChatCard(student.name, student.email, weekRange, false);
}

/**
 * 週五提醒 — 只寄給當週值日生
 */
function sendFridayReminder() {
  var data = getFirestoreConfig();
  if (!data) return;

  var student = getCurrentDutyStudent(data.students, data.startDate);
  if (!student || !student.email) {
    Logger.log('當週值日生沒有設定 email，跳過寄信。值日生：' + (student ? student.name : '無'));
    return;
  }

  var subject = '【大掃除提醒】' + student.name + '，今天是週五大掃除日！';
  var body = [
    student.name + ' 你好！',
    '',
    '今天是週五，記得五點前，將公共垃圾（辦公室＋廁所）拿到樓梯間，往五樓方向移動的垃圾集中處。',
    '確認公共空間狀況，是否有紙箱需要回收或協助清理。',
    '',
    '辛苦了，祝週末愉快！',
    '',
    '查看值日生系統：' + CONFIG.ROSTER_URL,
    '',
    '— 此信件由值日生系統自動發送'
  ].join('\n');

  GmailApp.sendEmail(student.email, subject, body, {
    name: CONFIG.SENDER_NAME
  });

  Logger.log('週五提醒已寄出給 ' + student.name + '（' + student.email + '）');

  sendChatCard(student.name, student.email, getThisWeekRange(), true);
}

// ============ 輔助函數 ============

/**
 * 從 Firestore 讀取 config/main 文件
 * students 格式：[{ name: "姓名", email: "xxx@gmail.com" }, ...]
 * startDate 格式：'2026-03-30'（週一，第一位值日生的起始週）
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

    // 讀取 startDate（若沒設定，預設 2026-03-30）
    var startDate = fields.startDate && fields.startDate.stringValue
      ? new Date(fields.startDate.stringValue)
      : new Date('2026-03-30');
    startDate.setHours(0, 0, 0, 0);

    return { students: students, startDate: startDate };
  } catch (e) {
    Logger.log('讀取 Firestore 失敗：' + e.message);
    return null;
  }
}

/**
 * 計算本週值日生（與前端邏輯一致）
 * 回傳 { name, email } 物件
 */
function getCurrentDutyStudent(students, startDate) {
  if (!students || students.length === 0) return null;

  var now = new Date();
  var thisMonday = getMonday(now);
  var weeksDiff = Math.round((thisMonday.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  var index = ((weeksDiff % students.length) + students.length) % students.length;

  Logger.log('thisMonday=' + thisMonday + ', startDate=' + startDate + ', weeksDiff=' + weeksDiff + ', index=' + index);
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
 * 發送 Google Chat 卡片通知
 */
function sendChatCard(studentName, studentEmail, weekRange, isFriday) {
  var title = isFriday ? '週五大掃除提醒' : '本週值日生提醒';
  var subtitle = weekRange;
  var body = isFriday
    ? studentName + '，記得今天五點前處理垃圾與確認公共空間！'
    : studentName + '，本週（' + weekRange + '）輪到你擔任值日生！';
  var tasks = isFriday
    ? '1. 五點前將公共垃圾（辦公室＋廁所）拿到樓梯間，往五樓方向移動的垃圾集中處。\n2. 確認公共空間狀況，是否有紙箱需要回收或協助清理。'
    : '1. 本週五下午五點前，將公共垃圾（辦公室＋廁所）拿到樓梯間，往五樓方向移動的垃圾集中處。\n2. 確認公共空間狀況，是否有紙箱需要回收或協助清理。';

  var card = {
    text: '<users/' + studentEmail + '>',
    cardsV2: [{
      cardId: 'duty-reminder',
      card: {
        header: {
          title: title,
          subtitle: subtitle
        },
        sections: [
          {
            widgets: [{
              textParagraph: { text: '<b>' + body + '</b>' }
            }]
          },
          {
            header: '本週任務',
            widgets: [{
              textParagraph: { text: tasks }
            }]
          },
          {
            widgets: [{
              buttonList: {
                buttons: [{
                  text: '查看值日生系統',
                  onClick: { openLink: { url: CONFIG.ROSTER_URL } }
                }]
              }
            }]
          }
        ]
      }
    }]
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(card)
  };

  UrlFetchApp.fetch(CONFIG.CHAT_WEBHOOK_URL, options);
  Logger.log('Chat 卡片已發送：' + studentName + '（' + (isFriday ? '週五' : '週一') + '）');
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
