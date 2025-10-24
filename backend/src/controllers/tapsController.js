import sql from '../config/db.js';

/**
 * Resolves a user's incomplete journey. This function now handles two distinct scenarios:
 * 1. User Fault (Penalty > 0): Closes the journey and applies a penalty.
 * 2. System Error (Penalty = 0): Resets the user's status, allowing them to try exiting again.
 */
export async function resetJourney(req, res) {
  try {
    const { rfid, penaltyAmount, notes } = req.body;
    const penalty = parseFloat(penaltyAmount) || 0;

    if (!rfid) {
      return res.status(400).json({ error: 'RFID is required.' });
    }
    if (penalty < 0 || penalty > 30) {
      return res.status(400).json({ error: 'Penalty must be between ₱0 and ₱30.' });
    }

    const [user] = await sql`SELECT * FROM users WHERE rfid = ${rfid}`;
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const [lastTap] = await sql`SELECT * FROM taps WHERE rfid = ${rfid} AND tap_type = 'entry' ORDER BY tap_time DESC LIMIT 1`;
    if (!lastTap) {
      return res.status(400).json({ error: 'No incomplete journey found to resolve.' });
    }

    // --- NEW LOGIC: Handle penalties and system errors differently ---

    // Case 1: User Fault (Penalty is applied)
    // The journey is forcibly closed, and the user can start a new journey.
    if (penalty > 0) {
      await sql.begin(async sql => {
        let newBalance = parseFloat(user.balance);

        if (newBalance < penalty) {
          throw new Error(`Insufficient balance to pay penalty of ₱${penalty.toFixed(2)}.`);
        }
        newBalance -= penalty;

        // Update the user's balance immediately
        await sql`UPDATE users SET balance = ${newBalance}, updated_at = NOW() WHERE rfid = ${rfid}`;
        
        // Update the 'entry' record to close the journey as an admin correction
        await sql`
          UPDATE taps
          SET
            tap_type = 'admin_correction',
            destination_station = 'Illegal Exit (Resolved)',
            fare_amount = ${penalty},
            user_balance = ${newBalance},
            notes = ${notes || 'Journey closed by admin due to illegal exit.'},
            tap_time = NOW()
          WHERE id = ${lastTap.id}
        `;
      });
      return res.status(200).json({ message: 'Journey has been resolved and closed. The user can now start a new journey.' });
    } 
    
    // Case 2: System Error (No penalty)
    // The journey is NOT closed. The admin action simply "unblocks" the user,
    // allowing them to go back to an exit gate and tap out normally.
    // The original 'entry' record remains untouched.
    else { 
      // We can optionally log this admin action for auditing, without affecting the journey.
      await sql`
          INSERT INTO taps (
            rfid, tap_type, user_name, user_type, user_balance,
            fare_amount, notes
          ) VALUES (
            ${rfid}, 'admin_penalty', ${user.name}, ${user.type}, ${user.balance},
            0, ${notes || 'System error reset by admin.'}
          )
        `;
      return res.status(200).json({ message: 'System error has been logged. The user should now be able to tap out at the exit gate normally.' });
    }

  } catch (err) {
    console.error('Error resolving journey:', err);
    res.status(500).json({ error: err.message || 'An error occurred while resolving the journey.' });
  }
}

