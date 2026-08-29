import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// جلب جميع الأصناف
export async function GET() {
  try {
    const result = await query('SELECT * FROM lab_items ORDER BY id ASC');
    // تحويل أسماء الأعمدة لتتناسب مع الواجهة
    const items = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      subject: row.subject,
      category: row.category,
      nature: row.nature,
      currentStock: Number(row.current_stock),
      minLimit: Number(row.min_limit),
      unit: row.unit,
      location: row.location,
    }));
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// إضافة صنف جديد
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, subject, category, nature, currentStock, minLimit, unit, location } = body;

    await query(
      `INSERT INTO lab_items (id, name, subject, category, nature, current_stock, min_limit, unit, location) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET 
       name = EXCLUDED.name, subject = EXCLUDED.subject, category = EXCLUDED.category, 
       nature = EXCLUDED.nature, current_stock = EXCLUDED.current_stock, 
       min_limit = EXCLUDED.min_limit, unit = EXCLUDED.unit, location = EXCLUDED.location;`,
      [id, name, subject, category, nature, currentStock, minLimit, unit, location]
    );

    return NextResponse.json({ success: true, message: "تم حفظ الصنف في قاعدة البيانات بنجاح!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// حذف صنف
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: "معرف الصنف مطلوب" }, { status: 400 });

    await query('DELETE FROM lab_items WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: "تم حذف الصنف من قاعدة البيانات!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}