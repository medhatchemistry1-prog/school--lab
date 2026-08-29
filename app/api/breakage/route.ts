import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS lab_breakage (
        id VARCHAR(50) PRIMARY KEY,
        date VARCHAR(20) NOT NULL,
        item_id VARCHAR(50) NOT NULL,
        item_name TEXT NOT NULL,
        subject VARCHAR(50) NOT NULL,
        quantity NUMERIC NOT NULL,
        broken_by TEXT NOT NULL,
        reason TEXT NOT NULL,
        teacher_name TEXT NOT NULL
      );
    `);

    const result = await query('SELECT * FROM lab_breakage ORDER BY date DESC, id DESC');
    const records = result.rows.map((row: any) => ({
      id: row.id,
      date: row.date,
      itemId: row.item_id,
      itemName: row.item_name,
      subject: row.subject,
      quantity: Number(row.quantity),
      brokenBy: row.broken_by,
      reason: row.reason,
      teacherName: row.teacher_name,
    }));

    return NextResponse.json({ success: true, records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, date, itemId, itemName, subject, quantity, brokenBy, reason, teacherName } = body;

    await query(
      `INSERT INTO lab_breakage (id, date, item_id, item_name, subject, quantity, broken_by, reason, teacher_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
       date = EXCLUDED.date,
       item_id = EXCLUDED.item_id,
       item_name = EXCLUDED.item_name,
       subject = EXCLUDED.subject,
       quantity = EXCLUDED.quantity,
       broken_by = EXCLUDED.broken_by,
       reason = EXCLUDED.reason,
       teacher_name = EXCLUDED.teacher_name;`,
      [id, date, itemId, itemName, subject, quantity, brokenBy, reason, teacherName]
    );

    return NextResponse.json({ success: true, message: 'تم حفظ محضر الكسر في قاعدة البيانات بنجاح!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'معرف المحضر مطلوب' }, { status: 400 });

    await query('DELETE FROM lab_breakage WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'تم حذف محضر الكسر من قاعدة البيانات!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
