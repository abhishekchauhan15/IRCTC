const db = require("../config/dbConfig");

const bookSeat = async (req, res) => {
  try {
    const { userId } = req.user;
    const { trainId, bookedSeats } = req.body;

    const getTrainQuery = "SELECT * FROM trains WHERE id = ?";
    db.query(getTrainQuery, [trainId], (err, results) => {
      if (err) {
        console.error("Error checking train availability:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      if (results.length === 0 || results[0].available_seats < bookedSeats) {
        res.status(400).json({ error: "Invalid train or insufficient seats" });
        return;
      }

      setTimeout(() => {
        // Book the seats
        const insertBookingQuery =
          "INSERT INTO bookings (user_id, train_id, booked_seats) VALUES (?, ?, ?)";
        db.query(
          insertBookingQuery,
          [userId, trainId, bookedSeats],
          (err, result) => {
            if (err) {
              console.error("Error booking seat:", err);
              res.status(500).json({ error: "Internal server error" });
              return;
            }

            // Update available seats for the train
            const updateTrainQuery =
              "UPDATE trains SET available_seats = available_seats - ? WHERE id = ?";
            db.query(
              updateTrainQuery,
              [bookedSeats, trainId],
              (err, result) => {
                if (err) {
                  console.error("Error updating train availability:", err);
                  res.status(500).json({ error: "Internal server error" });
                  return;
                }
                res.status(201).json({ message: "Seat booked successfully" });
              }
            );
          }
        );
      }, 2000);
    });
  } catch (error) {
    console.error("Error booking seat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getBookingDetails = async (req, res) => {
  try {
    const { userId } = req.user;
    const getBookingsQuery = "SELECT * FROM bookings WHERE user_id = ?";
    db.query(getBookingsQuery, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching booking details:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.json({ bookings: results });
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { bookSeat, getBookingDetails };
