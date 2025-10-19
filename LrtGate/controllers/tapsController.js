import sql from '../config/db.js';
import { fareMatrix } from '../config/fareMatrix.js';

/**
 * Handles the logic when a user taps to ENTER a station.
 * This logic is now correct and checks for any open 'entry' journey.
 */
export async function handleEntryTap(req, res) {
  try {
    const { rfid, station } = req.body;
    if (!rfid || !station) {
      return res.status(400).json({ error: 'RFID and station are required.' });
    }
    const [user] = await sql`SELECT * FROM users WHERE rfid = ${rfid}`;
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const [openJourney] = await sql`
      SELECT id FROM taps 
      WHERE rfid = ${rfid} AND tap_type = 'entry' 
      LIMIT 1
    `;

    if (openJourney) {
      return res.status(400).json({ error: 'Entry/Exit mismatch. An unresolved journey already exists.' });
    }

    await sql`
      INSERT INTO taps (rfid, tap_type, user_name, user_type, user_balance, origin_station)
      VALUES (${rfid}, 'entry', ${user.name}, ${user.type}, ${user.balance}, ${station})
    `;
    res.status(200).json({ message: 'Entry successful.', studentName: user.name });
  } catch (err) {
    console.error('Error during entry tap:', err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
}

/**
 * Handles the logic when a user taps to EXIT a station.
 * FINAL CORRECTED LOGIC: This now explicitly DELETES the 'entry' record and INSERTS
 * a new 'journey' record, guaranteeing that the journey is closed.
 */
export async function handleExitTap(req, res) {
  try {
    const { rfid, station: destination } = req.body;
    if (!rfid || !destination) {
      return res.status(400).json({ error: 'RFID and station are required.' });
    }

    const [user] = await sql`SELECT * FROM users WHERE rfid = ${rfid}`;
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const [lastEntryTap] = await sql`
      SELECT * FROM taps 
      WHERE rfid = ${rfid} AND tap_type = 'entry' 
      ORDER BY tap_time DESC 
      LIMIT 1
    `;

    if (!lastEntryTap) {
      return res.status(400).json({ error: 'Entry/Exit mismatch. No active journey found to exit from.' });
    }

    const origin = lastEntryTap.origin_station;
    if (origin === destination) {
      return res.status(400).json({ error: 'Origin and destination cannot be the same.' });
    }

    const standardFare = fareMatrix[origin]?.[destination];
    if (typeof standardFare === 'undefined') {
      return res.status(400).json({ error: 'Invalid origin or destination for fare calculation.' });
    }

    let finalFare = standardFare;
    let discountApplied = false;

    const isStudentEligible = user.type === 'student' &&
                              user.status === 'validated' &&
                              new Date(user.card_expiry_date) >= new Date() &&
                              new Date(user.annual_renewal_date) >= new Date();

    if (isStudentEligible) {
      finalFare = standardFare * 0.5;
      discountApplied = true;
    }

    const currentBalance = parseFloat(user.balance);
    if (currentBalance < finalFare) {
      return res.status(400).json({ error: 'Insufficient balance.' });
    }

    const newBalance = currentBalance - finalFare;

    await sql.begin(async sql => {
      // First, update the user's balance
      await sql`UPDATE users SET balance = ${newBalance}, updated_at = NOW() WHERE rfid = ${rfid}`;
      
      // --- THIS IS THE FIX ---
      // 1. Delete the old, incomplete 'entry' record.
      await sql`DELETE FROM taps WHERE id = ${lastEntryTap.id}`;

      // 2. Insert a new, complete 'journey' record with all details.
      await sql`
        INSERT INTO taps (
          rfid, tap_type, user_name, user_type, user_balance,
          origin_station, destination_station, fare_amount, discount_applied
        ) VALUES (
          ${rfid}, 'journey', ${user.name}, ${user.type}, ${newBalance},
          ${origin}, ${destination}, ${finalFare}, ${discountApplied}
        )
      `;
    });

    res.status(200).json({
      message: 'Fare deducted successfully.',
      studentName: user.name,
      origin: origin,
      destination: destination,
      finalFare,
      discountApplied,
      newBalance
    });

  } catch (err) {
    console.error('Error during exit tap:', err);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
}

