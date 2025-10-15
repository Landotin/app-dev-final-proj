import sql from '../config/db.js';

/**
 * Handles the administrative action of resolving an incomplete journey.
 * This function exists only on the Admin Dashboard's backend.
 */
export async function resolveMismatch(req, res) {
  try {
    const { rfid, notes } = req.body;
    const PENALTY_FARE = 30.00; // A fixed penalty fare for mismatches

    if (!rfid) {
      return res.status(400).json({ error: 'RFID is required to resolve a mismatch.' });
    }

    // 1. Find the user in the database
    const [user] = await sql`SELECT * FROM users WHERE rfid = ${rfid}`;
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // 2. Find the last action of the user to confirm it's an incomplete journey
    const [lastTap] = await sql`
      SELECT * FROM taps WHERE rfid = ${rfid} ORDER BY tap_time DESC LIMIT 1
    `;

    // 3. Check if the last action was indeed an 'entry' tap
    if (!lastTap || lastTap.tap_type !== 'entry') {
      return res.status(400).json({ error: 'No incomplete journey found to resolve for this user.' });
    }

    // 4. Check if the user has enough balance for the penalty
    const currentBalance = parseFloat(user.balance);
    if (currentBalance < PENALTY_FARE) {
      return res.status(400).json({ error: `Insufficient balance to pay penalty fare of ₱${PENALTY_FARE.toFixed(2)}.` });
    }
    
    const newBalance = currentBalance - PENALTY_FARE;

    // 5. Use a transaction to safely update the database
    await sql.begin(async sql => {
      // First, update the user's balance
      await sql`UPDATE users SET balance = ${newBalance}, updated_at = NOW() WHERE rfid = ${rfid}`;
      
      // Second, insert a new record to log this administrative action
      await sql`
        INSERT INTO taps (
          rfid, tap_type, user_name, user_type, user_balance,
          origin_station, destination_station, fare_amount, notes
        ) VALUES (
          ${rfid}, 'admin_correction', ${user.name}, ${user.type}, ${newBalance},
          ${lastTap.origin_station}, 'Admin Resolved', ${PENALTY_FARE}, ${notes || 'Journey manually closed by admin.'}
        )
      `;
    });

    // 6. Send a success response
    res.status(200).json({ 
        message: 'Incomplete journey resolved successfully.',
        newBalance,
        penaltyApplied: PENALTY_FARE
    });

  } catch (err) {
    console.error('Error resolving mismatch:', err);
    res.status(500).json({ error: 'An error occurred while resolving the mismatch.' });
  }
}

