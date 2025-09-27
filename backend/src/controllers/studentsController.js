import sql from '../config/db.js';

export async function getAllStudents(req, res) {
  try {
    const students = await sql`
      SELECT 
        users.*,
        CASE
          WHEN status = 'pending' THEN 'Pending'
          WHEN card_expiry_date < CURRENT_DATE THEN 'Card Expired'
          WHEN annual_renewal_date < CURRENT_DATE THEN 'Annual Discount Expired'
          WHEN status = 'validated' THEN 'Validated'
          ELSE 'Deactivated'
        END AS effective_status
      FROM users 
      ORDER BY created_at DESC
    `;
    res.status(200).json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'An error occurred while fetching students.' });
  }
}

// RENAMED and FIXED the findStudent function
export async function getStudentByIdentifier(req, res) {
  try {
    const { identifier } = req.params;

    const studentResult = await sql`
      SELECT 
        users.*, -- 👈 THE FIX IS HERE
        CASE
          WHEN status = 'pending' THEN 'Pending'
          WHEN card_expiry_date < CURRENT_DATE THEN 'Card Expired'
          WHEN annual_renewal_date < CURRENT_DATE THEN 'Annual Discount Expired'
          WHEN status = 'validated' THEN 'Validated'
          ELSE 'Deactivated'
        END AS effective_status
      FROM users 
      WHERE rfid = ${identifier} OR student_id = ${identifier}
    `;

    if (studentResult.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const studentProfile = studentResult[0];
    const tapsHistory = await sql`
      SELECT tap_type, tap_time, user_balance 
      FROM taps 
      WHERE rfid = ${studentProfile.rfid}
      ORDER BY tap_time DESC
    `;

    res.status(200).json({
      ...studentProfile,
      taps: tapsHistory,
    });
  } catch (err) {
    console.error('Error fetching student data by identifier:', err);
    res.status(500).json({ error: 'An error occurred while fetching the student data.' });
  }
}

// ... registerStudent, updateStudent, and validateStudent functions remain the same ...
export async function registerStudent(req, res) {
  try {
    const { rfid, name, balance = 0, type = 'student', student_id, email, program, school, address, contact_number } = req.body;

    const existingStudent = await sql`
      SELECT rfid FROM users 
      WHERE rfid = ${rfid} OR student_id = ${student_id} OR email = ${email}
    `;

    if (existingStudent.length > 0) {
      return res.status(409).json({ error: 'A student with this RFID, Student ID, or Email already exists.' });
    }

    const [newStudent] = await sql`
      INSERT INTO users (
        rfid, name, balance, type, student_id, email, program, school,
        address, contact_number,
        card_expiry_date
      )
      VALUES (
        ${rfid}, ${name}, ${balance}, ${type}, ${student_id}, ${email}, ${program}, ${school},
        ${address}, ${contact_number},
        NOW() + INTERVAL '5 years'
      )
      RETURNING *
    `;
    res.status(201).json(newStudent);

  } catch (err) {
    console.error('Error registering student:', err);
    if (err.code === '23505') { 
      return res.status(409).json({ error: `The provided ${err.constraint.split('_')[1]} is already in use.` });
    }
    res.status(500).json({ error: 'An error occurred during student registration.' });
  }
}

export async function updateStudent(req, res) {
  try {
    const { rfid } = req.params;
    const { name, email, student_id, school, program, address, contact_number } = req.body;

    const [updatedStudent] = await sql`
      UPDATE users
      SET
        name = ${name},
        email = ${email},
        student_id = ${student_id},
        school = ${school},
        program = ${program},
        address = ${address},
        contact_number = ${contact_number},
        updated_at = NOW()
      WHERE rfid = ${rfid}
      RETURNING *
    `;

    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    res.status(200).json(updatedStudent);
  } catch (err) {
    console.error('Error updating student:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: `The provided ${err.constraint.split('_')[1]} is already in use.` });
    }
    res.status(500).json({ error: 'An error occurred while updating the student.' });
  }
}

export async function validateStudent(req, res) {
  try {
    const { rfid } = req.params;
    const [validatedStudent] = await sql`
      UPDATE users
      SET
        status = 'validated',
        validated_at = NOW(),
        annual_renewal_date = NOW() + INTERVAL '1 year'
      WHERE rfid = ${rfid}
      RETURNING *
    `;

    if (!validatedStudent) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    res.status(200).json(validatedStudent);
  } catch (err)
 {
    console.error('Error validating student:', err);
    res.status(500).json({ error: 'An error occurred during validation.' });
  }
}