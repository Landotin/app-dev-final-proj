import sql from '../config/db.js';
import { fareMatrix } from '../config/fareMatrix.js';

/**
 * Handles the logic for a user tapping in at an entry gate.
 */
export async function handleEntryTap(req, res) {
    const { rfid, station } = req.body;

    if (!rfid || !station) {
        return res.status(400).json({ error: 'RFID and station are required.' });
    }

    try {
        const [user] = await sql`SELECT rfid, name, type, balance FROM users WHERE rfid = ${rfid}`;
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const lastTap = await sql`
            SELECT tap_type FROM taps WHERE rfid = ${rfid} ORDER BY tap_time DESC LIMIT 1
        `;

        if (lastTap.length > 0 && lastTap[0].tap_type === 'entry') {
            return res.status(409).json({ error: 'Entry/Exit Mismatch. User has already entered.' });
        }

        await sql`
            INSERT INTO taps (rfid, tap_type, user_name, user_type, user_balance, origin_station)
            VALUES (${rfid}, 'entry', ${user.name}, ${user.type}, ${user.balance}, ${station})
        `;

        res.status(200).json({
            message: 'Entry recorded successfully.',
            studentName: user.name,
        });

    } catch (err) {
        console.error('Error during entry tap:', err);
        res.status(500).json({ error: 'An server error occurred during entry.' });
    }
}

/**
 * Handles the logic for a user tapping out at an exit gate.
 */
export async function handleExitTap(req, res) {
    const { rfid, station: destinationStation } = req.body;

    if (!rfid || !destinationStation) {
        return res.status(400).json({ error: 'RFID and destination station are required.' });
    }

    try {
        const [user] = await sql`SELECT * FROM users WHERE rfid = ${rfid}`;
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const lastEntryTap = await sql`
            SELECT origin_station FROM taps
            WHERE rfid = ${rfid} AND tap_type = 'entry'
            ORDER BY tap_time DESC LIMIT 1
        `;

        if (lastEntryTap.length === 0) {
            return res.status(409).json({ error: 'Entry/Exit Mismatch. No valid entry record found.' });
        }

        const originStation = lastEntryTap[0].origin_station;
        
        if (originStation === destinationStation) {
            return res.status(400).json({ error: 'Origin and destination cannot be the same.' });
        }

        const standardFare = fareMatrix[originStation]?.[destinationStation];
        if (typeof standardFare === 'undefined') {
            return res.status(400).json({ error: 'Invalid origin or destination station in fare matrix.' });
        }

        let finalFare = standardFare;
        let discountApplied = false;

        if (user.type === 'student') {
            const isStudentValid = user.status === 'validated' &&
                                   new Date(user.card_expiry_date) >= new Date() &&
                                   new Date(user.annual_renewal_date) >= new Date();
            
            if (isStudentValid) {
                // Changed from 0.8 to 0.5 to apply a 50% discount
                finalFare = standardFare * 0.5; 
                discountApplied = true;
            }
        }

        const currentBalance = parseFloat(user.balance);
        if (currentBalance < finalFare) {
            return res.status(402).json({ error: 'Insufficient balance.' });
        }

        const newBalance = currentBalance - finalFare;

        await sql.begin(async sql => {
            await sql`UPDATE users SET balance = ${newBalance}, updated_at = NOW() WHERE rfid = ${user.rfid}`;
            await sql`
                INSERT INTO taps (
                    rfid, tap_type, user_name, user_type, user_balance,
                    origin_station, destination_station, fare_amount, discount_applied
                ) VALUES (
                    ${user.rfid}, 'exit', ${user.name}, ${user.type}, ${newBalance},
                    ${originStation}, ${destinationStation}, ${finalFare}, ${discountApplied}
                )
            `;
        });

        res.status(200).json({
            message: 'Exit successful. Fare deducted.',
            origin: originStation,
            destination: destinationStation,
            finalFare,
            discountApplied,
            newBalance,
        });

    } catch (err) {
        console.error('Error during exit tap:', err);
        res.status(500).json({ error: 'An server error occurred during exit.' });
    }
}

