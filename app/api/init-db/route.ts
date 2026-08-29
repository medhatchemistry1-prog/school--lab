import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // إنشاء جدول الأصناف إن لم يكن موجوداً
    await query(`
      CREATE TABLE IF NOT EXISTS lab_items (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        subject VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        nature VARCHAR(50) NOT NULL,
        current_stock NUMERIC NOT NULL,
        min_limit NUMERIC NOT NULL,
        unit VARCHAR(20) NOT NULL,
        location TEXT NOT NULL
      );
    `);

    return NextResponse.json({ success: true, message: "تم إنشاء جدول الأصناف بنجاح في قاعدة بيانات Neon!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}