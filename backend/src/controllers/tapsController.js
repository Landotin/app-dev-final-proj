import sql from '../config/db.js';

/**
 * Resets a user's incomplete journey by applying a penalty.
 * MODIFIED: This function NO LONGER deletes the entry record. It only applies the penalty.
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

    const [lastTap] = await sql`SELECT * FROM taps WHERE rfid = ${rfid} ORDER BY tap_time DESC LIMIT 1`;
    if (!lastTap || lastTap.tap_type !== 'entry') {
      return res.status(400).json({ error: 'No incomplete journey found to reset.' });
    }

    // Only apply a penalty if one is set. If the penalty is 0, do nothing except send a success message.
    if (penalty > 0) {
        await sql.begin(async sql => {
            let newBalance = parseFloat(user.balance);

            if (newBalance < penalty) {
              // This will cancel the transaction
              throw new Error(`Insufficient balance to pay penalty of ₱${penalty.toFixed(2)}.`);
            }
            newBalance -= penalty;

            // Update the user's balance
            await sql`UPDATE users SET balance = ${newBalance}, updated_at = NOW() WHERE rfid = ${rfid}`;

            // Log the penalty as a separate transaction
            await sql`
              INSERT INTO taps (
                rfid, tap_type, user_name, user_type, user_balance,
                fare_amount, notes
              ) VALUES (
                ${rfid}, 'admin_penalty', ${user.name}, ${user.type}, ${newBalance},
                ${penalty}, ${notes || 'Mismatch penalty applied by admin.'}
              )
            `;
        });
    }

    // IMPORTANT: We no longer delete the entry record.
    // The user is now free to tap out at the exit gate, and the entry record will be found correctly.
    res.status(200).json({ message: 'Journey has been reset. The user can now tap out at the exit gate.' });

  } catch (err) {
    console.error('Error resetting journey:', err);
    res.status(500).json({ error: err.message || 'An error occurred while resetting the journey.' });
  }
}

