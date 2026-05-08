const express = require("express");
const router = express.Router();
const pool = require("../db");

const { parseerror } = require("../funcs");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM armario");
    res.json(result.rows);
  } catch (err) {
    parseerror(err, res);
  }
});

router.post("/", async (req, res) => {
  try {
    const { number, shelves } = req.body;
    const result = await pool.query(
      "INSERT INTO armario (number, shelves) VALUES ($1, $2) RETURNING *",
      [number, shelves],
    );
    res.json(result.rows);
  } catch (err) {
    parseerror(err, res);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const newlines = Object.entries(req.body);
    const rowid = req.params.id;
    const values = [];
    const formatlines = [];

    for (let i = 0; i < newlines.length; i++) {
      const header = newlines[i][0];
      const value = newlines[i][1];
      values.push(value);
      formatlines.push(`${header}=$${values.length}`);

      if (header === "shelves") {
        const getrack = await pool.query(
          `SELECT number FROM armario WHERE id=$1`,
          [rowid],
        );
        const result = await pool.query(
          `SELECT shelf FROM caja WHERE rack=$1 ORDER BY shelf DESC`,
          [getrack.rows[0].number],
        );
        if (result.rows[0] && value < result.rows[0].shelf) {
          return res.status(400).json({
            error: "can't take shelves off while there's boxes on them!",
          });
        }
      }
    }

    const result = await pool.query(
      `UPDATE armario SET ${formatlines.join(", ")} WHERE id=$${values.length + 1} RETURNING *`,
      [...values, rowid],
    );
    res.json(result.rows);
  } catch (err) {
    parseerror(err, res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const rowid = req.params.id;
    const racknum = await pool.query("SELECT number FROM armario WHERE id=$1", [
      rowid,
    ]);
    const boxplaces = await pool.query(
      "SELECT (name, shelf) FROM caja WHERE rack=$1",
      [racknum.rows[0].number],
    );

    if (boxplaces.rows.length > 0) {
      return res.status(400).json({
        error: `FAILSAFE! move the boxes out of the rack first!`,
        error: `Shelves with boxes: ${boxplaces.rows}`,
      });
    }

    const deleted = await pool.query(
      "DELETE FROM armario WHERE id=$1 RETURNING *",
      [rowid],
    );
    res.status(200).json(deleted.rows[0]);
  } catch (err) {
    parseerror(err, res);
  }
});

module.exports = router;
