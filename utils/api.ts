// utils/api.ts
// utils/api.ts
export async function createStudent(form: any) {
  const gasUrl = process.env.NEXT_PUBLIC_GAS_API_URL;
  if (!gasUrl) {
    throw new Error('Missing NEXT_PUBLIC_GAS_API_URL');
  }

  // GAS Web App: Use text/plain to avoid preflight CORS options request failures
  const res = await fetch(gasUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      student_id: form.studentId || form.student_id || '',
      title: form.title || '',
      score: typeof form.score === 'number' ? form.score : null,

      // Data payload
      data: {
        name: form.name,
        department: form.department,
        class: form.class || form.className,
        phone: form.phone,
        instructor: form.instructor,
        startSmokingPeriod: form.startSmokingPeriod,
        weeklyFrequency: form.weeklyFrequency,
        dailyAmount: form.dailyAmount,
        smokingReasons: form.smokingReasons,
        productTypesUsed: form.productTypesUsed,
        familySmoker: form.familySmoker,
        knowSchoolBan: form.knowSchoolBan,
        seenTobaccoAds: form.seenTobaccoAds,
        everVaped: form.everVaped,
        wantQuit: form.wantQuit,
        wantsCounseling: form.wantsCounseling,
        interestedInFreeSvc: form.interestedInFreeSvc
      }
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`提交失敗: ${res.status} ${text}`);
  }

  const result = await res.json();
  if (result.status === 'error') {
    throw new Error(result.message);
  }

  return result;
}

