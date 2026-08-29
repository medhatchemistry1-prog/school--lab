import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
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

    await query(`
      CREATE TABLE IF NOT EXISTS breakage_records (
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

    await query(`
      CREATE TABLE IF NOT EXISTS operational_plans (
        id VARCHAR(50) PRIMARY KEY,
        academic_year VARCHAR(20) NOT NULL,
        semester VARCHAR(50) NOT NULL,
        week_number INTEGER NOT NULL,
        day VARCHAR(20) NOT NULL,
        period VARCHAR(50) NOT NULL,
        subject VARCHAR(50) NOT NULL,
        grade VARCHAR(50) NOT NULL,
        track VARCHAR(50) NOT NULL,
        section VARCHAR(20) NOT NULL,
        teacher_name TEXT NOT NULL,
        lab_technician TEXT NOT NULL,
        experiment_title TEXT NOT NULL,
        lab_room TEXT NOT NULL,
        status VARCHAR(30) NOT NULL
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS prep_requests (
        id VARCHAR(50) PRIMARY KEY,
        teacher_name TEXT NOT NULL,
        lab_technician TEXT NOT NULL,
        subject VARCHAR(50) NOT NULL,
        grade VARCHAR(50) NOT NULL,
        track VARCHAR(50) NOT NULL,
        section VARCHAR(20) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        semester VARCHAR(50) NOT NULL,
        experiment_title TEXT NOT NULL,
        date VARCHAR(20) NOT NULL,
        period VARCHAR(50) NOT NULL,
        items JSONB NOT NULL,
        procurements JSONB NOT NULL
      );
    `);

    return NextResponse.json({ success: true, message: "تم إنشاء جميع الجداول في قاعدة بيانات Neon بنجاح!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}