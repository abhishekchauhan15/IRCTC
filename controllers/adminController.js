const db = require("../config/dbConfig");

const addNewTrain = async (req, res) => {
  try {
    const { source, destination, totalSeats } = req.body;
    const query =
      "INSERT INTO trains (source, destination, total_seats, available_seats) VALUES (?, ?, ?, ?)";
    db.query(
      query,
      [source, destination, totalSeats, totalSeats],
      (err, result) => {
        if (err) {
          console.error("Error adding new train:", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }
        res.status(201).json({ message: "Train added successfully" });
      }
    );
  } catch (error) {
    console.error("Error adding new train:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { addNewTrain };
