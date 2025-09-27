import sql from '../config/db.js';

// Helper for calculating effective status
const selectWithEffectiveStatus = sql`
  *,
  CASE
    WHEN status = 'pending' THEN 'Pending'
    WHEN card_expiry_date < CURRENT_DATE THEN 'Card Expired'
    WHEN annual_renewal_date < CURRENT_DATE THEN 'Annual Discount Expired'
    WHEN status = 'validated' THEN 'Validated'
    ELSE 'Deactivated'
  END AS effective_status
`;

export async function getAllStudents(req, res) {
  try {
    const students = await sql`SELECT ${selectWithEffectiveStatus} FROM users`;
    res.status(200).json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'An error occurred while fetching students.' });
  }
}

export async function getStudentByRfid(req, res) {
  try {
    const { rfid } = req.params;
    const studentResult = await sql`SELECT ${selectWithEffectiveStatus} FROM users WHERE rfid = ${rfid}`;

    if (studentResult.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const studentProfile = studentResult[0];
    const tapsHistory = await sql`
      SELECT tap_type, tap_time, user_balance 
      FROM taps 
      WHERE rfid = ${rfid}
      ORDER BY tap_time DESC
    `;

    res.status(200).json({
      ...studentProfile,
      taps: tapsHistory,
    });
  } catch (err) {
    console.error('Error fetching student data by RFID:', err);
    res.status(500).json({ error: 'An error occurred while fetching the student data.' });
  }
}

export async function registerStudent(req, res) {
  try {
    const { rfid, name, balance = 0, type = 'student', student_id, email, program, school } = req.body;
    // ... (validation checks remain the same)

    const [newStudent] = await sql`
      INSERT INTO users (
        rfid, name, balance, type, student_id, email, program, school,
        card_expiry_date -- 👈 ADDED: Set 5-year expiry on registration
      )
      VALUES (
        ${rfid}, ${name}, ${balance}, ${type}, ${student_id}, ${email}, ${program}, ${school},
        NOW() + INTERVAL '5 years'
      )
      RETURNING *
    `;
    res.status(201).json(newStudent);

  } catch (err) {
    console.error('Error registering student:', err);
    res.status(500).json({ error: 'An error occurred during student registration.' });
  }
}

// 👇 ADDED: New function to handle student validation
export async function validateStudent(req, res) {
  try {
    const { rfid } = req.params;
    const [validatedStudent] = await sql`
      UPDATE users
      SET
        status = 'validated',
        validated_at = NOW(),
        annual_renewal_date = NOW() + INTERVAL '1 year' -- 👈 Start 1-year timer on validation
      WHERE rfid = ${rfid}
      RETURNING *
    `;

    if (!validatedStudent) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    res.status(200).json(validatedStudent);
  } catch (err) {
    console.error('Error validating student:', err);
    res.status(500).json({ error: 'An error occurred during validation.' });
  }
}