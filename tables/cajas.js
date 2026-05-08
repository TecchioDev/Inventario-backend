const express = require("express");
const router = express.Router();
const pool = require("../db");

const { parseerror, parserackshelf } = require("../funcs");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM caja");
    res.json(result.rows);
  } catch (err) {
    parseerror(err, res);
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, rack, shelf, quantity, priority } = req.body;

    const shelves = await pool.query(
      "SELECT shelves FROM armario WHERE number=$1",
      [rack],
    );

    if (parserackshelf(res, shelf, shelves)) return;

    const result = await pool.query(
      "INSERT INTO caja (name, description, rack, shelf, quantity, priority) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, description, rack, shelf, quantity, priority],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    parseerror(err, res);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const newlines = Object.entries(req.body); // the entire shit but in matrices ig?
    const itemid = req.params.id; // id of the row we're changing
    const values = []; // each value so we can use "$x" to assign in the final thing later
    const formatlines = []; // formatted strings for each entry
    let rack;
    let shelf;

    for (let i = 0; i < newlines.length; i++) {
      const head = `${newlines[i][0]}`;
      const value = `${newlines[i][1]}`;
      values.push(value);
      formatlines.push(`${head}=$${i + 1}`); // add an index instead of the crude value

      if (head === "rack") rack = value;
      else if (head === "shelf") shelf = value;
    }

    if (!rack && shelf) {
      const result = await pool.query("SELECT rack FROM caja WHERE id=$1", [
        itemid,
      ]);
      rack = result.rows[0].rack;
    } else if (!shelf && rack) {
      const result = await pool.query("SELECT shelf FROM caja WHERE id=$1", [
        itemid,
      ]);
      shelf = result.rows[0].shelf;
    }

    const shelves = await pool.query(
      "SELECT shelves FROM armario WHERE number=$1",
      [rack],
    );

    if (rack || shelf) {
      if (parserackshelf(res, shelf, shelves)) return;
    }

    const result = await pool.query(
      `UPDATE caja SET ${formatlines.join(", ")} WHERE id=$${formatlines.length + 1} RETURNING *`,
      [...values, itemid],
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    parseerror(err, res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const itemid = req.params.id;
    const result = await pool.query(
      "DELETE FROM caja WHERE id=$1 RETURNING *",
      [itemid],
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    parseerror(err, res);
  }
});

module.exports = router;
