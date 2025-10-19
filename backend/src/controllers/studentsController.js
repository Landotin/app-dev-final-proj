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
    const students = await sql`SELECT ${selectWithEffectiveStatus} FROM users ORDER BY created_at DESC`;
    res.status(200).json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'An error occurred while fetching students.' });
  }
}

export async function findStudent(req, res) {
  try {
    const { identifier } = req.params;

    const studentResult = await sql`
      SELECT 
        *,
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
      SELECT *
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

export async function registerStudent(req, res) {
  try {
    const { rfid, name, type = 'student', student_id, email, program, school, address, contact_number } = req.body;
    
    const balance = parseFloat(req.body.balance) || 0;

    const [newStudent] = await sql`
      INSERT INTO users (
        rfid, name, balance, type, student_id, email, program, school,
        address, contact_number, card_expiry_date, proof_of_enrollment_url, selfie_url
      )
      VALUES (
        ${rfid}, ${name}, ${balance}, ${type}, ${student_id}, ${email}, ${program}, ${school},
        ${address}, ${contact_number}, NOW() + INTERVAL '5 years', ${req.body.proof_of_enrollment_url || null}, ${req.body.selfie_url || null}
      )
      RETURNING *
    `;
    res.status(201).json(newStudent);

  } catch (err) {
    console.error('Error during student registration:', err); 
    
    if (err.code === '23505' && err.constraint) {
      const field = err.constraint.split('_')[1] || 'field';
      return res.status(409).json({ error: `The provided ${field} is already in use.` });
    }

    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
}

export async function updateStudent(req, res) {
  try {
    const { rfid } = req.params;
    const { name, email, student_id, school, program, address, contact_number } = req.body;

    const [updatedStudent] = await sql`
      UPDATE users
      SET
        name = ${name}, email = ${email}, student_id = ${student_id},
        school = ${school}, program = ${program}, address = ${address},
        contact_number = ${contact_number}, updated_at = NOW()
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
  } catch (err) {
    console.error('Error validating student:', err);
    res.status(500).json({ error: 'An error occurred during validation.' });
  }
}

// THIS FUNCTION IS NOW CORRECTED - All frontend React code has been removed.
export async function addBalance(req, res) {
  const { rfid } = req.params;
  const { amount } = req.body;

  const loadAmount = parseFloat(amount);

  if (!loadAmount || loadAmount <= 0) {
    return res.status(400).json({ error: 'Please enter a valid positive amount.' });
  }

  try {
    const [user] = await sql`SELECT * FROM users WHERE rfid = ${rfid}`;
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const currentBalance = parseFloat(user.balance);
    const newBalance = currentBalance + loadAmount;

    await sql.begin(async sql => {
      await sql`
        UPDATE users 
        SET balance = ${newBalance}, updated_at = NOW() 
        WHERE rfid = ${rfid}
      `;
      
      await sql`
        INSERT INTO taps (
          rfid, tap_type, user_name, user_type, user_balance, 
          origin_station, fare_amount
        ) VALUES (
          ${user.rfid}, 'top_up', ${user.name}, ${user.type}, ${newBalance},
          'Teller Load', ${loadAmount}
        )
      `;
    });

    res.status(200).json({ 
      message: 'Balance added successfully.',
      newBalance,
    });

  } catch (err) {
    console.error('Error adding balance:', err);
    res.status(500).json({ error: 'An error occurred while adding balance.' });
  }
}
