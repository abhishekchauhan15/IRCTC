const db = require("../config/dbConfig");
const redis = require("redis");

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

const publisher = redis.createClient(redisConfig);
const subscriber = redis.createClient(redisConfig);

publisher.on("error", (err) => {
  console.error("Publisher Redis client error:", err);
});

subscriber.on("error", (err) => {
  console.error("Subscriber Redis client error:", err);
});

console.log("Connecting to Redis on host:",redisConfig.host,"port:",redisConfig.port);

subscriber.subscribe("booking_requests");

// Handlling messages received on the booking_requests channel
subscriber.on("message", async (channel, message) => {
  try {
    console.log("Received message:", message);
    const booking = JSON.parse(message);

    // Processing the booking request
    const insertBookingQuery =
      "INSERT INTO bookings (user_id, train_id, booked_seats) VALUES (?, ?, ?)";
    db.query(
      insertBookingQuery,
      [booking.userId, booking.trainId, booking.bookedSeats],
      (err, result) => {
        if (err) {
          console.error("Error inserting booking into database:", err);
        } else {
          console.log("Booking inserted into database:", result);

          // Updating available seats for the train
          const updateTrainQuery =
            "UPDATE trains SET available_seats = available_seats - ? WHERE id = ?";
          db.query(
            updateTrainQuery,
            [booking.bookedSeats, booking.trainId],
            (err, result) => {
              if (err) {
                console.error("Error updating train availability:", err);
              } else {
                console.log("Train availability updated:", result);
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.error("Error processing booking request:", error);
  }
});

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

      // Enqueue booking request to Redis Pub/Sub channel
      const booking = { userId, trainId, bookedSeats };
      publisher.publish("booking_requests", JSON.stringify(booking), (err) => {
        if (err) {
          console.error("Error enqueuing booking request:", err);
          res.status(500).json({ error: "Internal server error" });
        } else {
          res.status(202).json({ message: "Booking request enqueued" });
        }
      });

      console.log("Booking request done");
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
