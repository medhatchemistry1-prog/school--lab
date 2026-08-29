import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM operational_plans ORDER BY id DESC');
    const plans = result.rows.map((row: any) => ({
      id: row.id,
      academicYear: row.academic_year,
      semester: row.semester,
      weekNumber: Number(row.week_number),
      day: row.day,
      period: row.period,
      subject: row.subject,
      grade: row.grade,
      track: row.track,
      section: row.section,
      teacherName: row.teacher_name,
      labTechnician: row.lab_technician,
      experimentTitle: row.experiment_title,
      labRoom: row.lab_room,
      status: row.status,
    }));
    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, academicYear, semester, weekNumber, day, period, subject, grade, track, section, teacherName, labTechnician, experimentTitle, labRoom, status } = body;

    await query(
      `INSERT INTO operational_plans (id, academic_year, semester, week_number, day, period, subject, grade, track, section, teacher_name, lab_technician, experiment_title, lab_room, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO UPDATE SET 
       academic_year = EXCLUDED.academic_year, semester = EXCLUDED.semester, week_number = EXCLUDED.week_number,
       day = EXCLUDED.day, period = EXCLUDED.period, subject = EXCLUDED.subject, grade = EXCLUDED.grade,
       track = EXCLUDED.track, section = EXCLUDED.section, teacher_name = EXCLUDED.teacher_name,
       lab_technician = EXCLUDED.lab_technician, experiment_title = EXCLUDED.experiment_title, lab_room = EXCLUDED.lab_room, status = EXCLUDED.status;`,
      [id, academicYear, semester, weekNumber, day, period, subject, grade, track, section, teacherName, labTechnician, experimentTitle, labRoom, status]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}