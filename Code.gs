/**
 * @OnlyCurrentDoc
 */
// 上一行註解非常重要，它限制腳本只能存取當前試算表，可避免權限被封鎖。

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // 改用 getActiveSpreadsheet()，因為腳本是綁定在試算表上的
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    var id = Utilities.getUuid();
    var student_id = data.student_id || "";
    var title = data.title || "";
    var score = data.score !== undefined ? data.score : "";
    var jsonData = JSON.stringify(data.data || {}); 
    var created_at = new Date().toISOString();

    sheet.appendRow([id, student_id, title, score, jsonData, created_at]);

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      id: id,
      message: "Data appended successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var action = e && e.parameter ? e.parameter.action : "";
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var rows = sheet.getDataRange().getValues();
    
    var rawData = rows.slice(1);

    var items = rawData.map(function(r) {
      return {
        id: r[0],
        student_id: r[1],
        title: r[2],
        score: r[3] === "" ? null : r[3],
        data: r[4], 
        created_at: r[5]
      };
    });

    items.sort(function(a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    // 簡單測試用函數，可以在編輯器中直接執行 testDoGet 來觸發授權
    if (!e) return items; 

    if (action === "stats") {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        data: items 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var from = e.parameter.from;
    var to = e.parameter.to;

    if (from) {
      items = items.filter(function(i) { return i.created_at >= from + "T00:00:00"; });
    }
    if (to) {
      items = items.filter(function(i) { return i.created_at <= to + "T23:59:59"; });
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      data: items 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 請手動執行這個函式一次來進行授權
function testAuth() {
  console.log("Testing auth...");
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  console.log("Access successful: " + sheet.getName());
}
