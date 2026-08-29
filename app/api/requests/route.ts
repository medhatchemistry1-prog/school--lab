import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM prep_requests ORDER BY id DESC');
    const requests = result.rows.map((row: any) => ({
      id: row.id,
      teacherName: row.teacher_name,
      labTechnician: row.lab_technician,
      subject: row.subject,
      grade: row.grade,
      track: row.track,
      section: row.section,
      academicYear: row.academic_year,
      semester: row.semester,
      experimentTitle: row.experiment_title,
      date: row.date,
      period: row.period,
      items: row.items,
      procurements: row.procurements,
    }));
    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, teacherName, labTechnician, subject, grade, track, section, academicYear, semester, experimentTitle, date, period, items, procurements } = body;

    await query(
      `INSERT INTO prep_requests (id, teacher_name, lab_technician, subject, grade, track, section, academic_year, semester, experiment_title, date, period, items, procurements)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING;`,
      [id, teacherName, labTechnician, subject, grade, track, section, academicYear, semester, experimentTitle, date, period, JSON.stringify(items), JSON.stringify(procurements)]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}