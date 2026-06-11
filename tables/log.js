const express = require("express");
const router = express.Router();
const pool = require("../db");

const { parseerror } = require("../funcs");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM log ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    parseerror(err, res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const itemid = req.params.id;
    const result = await pool.query(
      "DELETE FROM log WHERE id=$1 RETURNING *",
      [itemid],
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    parseerror(err, res);
  }
});

module.exports = router;
