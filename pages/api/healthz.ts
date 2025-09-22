import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // 若沒有別名，改成 ../../lib/...（看上面 A）

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const hasUrl = !!process.env.SUPABASE_URL;
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    let count = null;

    if (hasUrl && hasKey) {
      const { count: c, error } = await supabaseAdmin
        .from('submissions')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      count = c ?? 0;
    }

    res.status(200).json({ ok: true, env: { url: hasUrl, serviceKey: hasKey }, submissionsCount: count });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? 'Internal Error' });
  }
}
