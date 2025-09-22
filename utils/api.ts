// utils/api.ts
export async function createStudent(form: any) {
  const res = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // 基本欄位（保留你原本命名也可）
      student_id: form.studentId || form.student_id || '',
      title: form.title || '',
      score: typeof form.score === 'number' ? form.score : null,

      // 問卷全部放 data
      data: {
        name: form.name,
        department: form.department,
        class: form.class || form.className,
        phone: form.phone,
        instructor: form.instructor,

        startSmokingPeriod: form.startSmokingPeriod,           // 大學以後/高中/國中/國小
        weeklyFrequency: form.weeklyFrequency,                 // 每天抽/1-2天抽1次/...
        dailyAmount: form.dailyAmount,                         // 10支以上/5-9支/...

        smokingReasons: form.smokingReasons,                   // 陣列：壓力/放鬆/習慣/交際/打發時間/其它
        productTypesUsed: form.productTypesUsed,               // 陣列：電子煙/紙菸/加熱煙

        familySmoker: form.familySmoker,                       // 有/沒有 → true/false
        knowSchoolBan: form.knowSchoolBan,                     // 知道/不知道 → true/false
        seenTobaccoAds: form.seenTobaccoAds,                   // 有/沒有
        everVaped: form.everVaped,                             // 有/沒有
        wantQuit: form.wantQuit,                               // 有/沒有（是否有戒菸想法）
        wantsCounseling: form.wantsCounseling,                 // 有/沒有（是否需要輔導）
        interestedInFreeSvc: form.interestedInFreeSvc          // 有/沒有（想了解免費戒菸輔導）
      }
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`提交失敗: ${res.status} ${text}`);
  }
  return res.json();
}

