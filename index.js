const express = require("express");
const pool = require("./db.js");
const { parse } = require("dotenv");

const app = express();
const PORT = 4000;

app.use(express.json());

function parseerror(err, res) {
  if (err.code === "23514") {
    return res
      .status(400)
      .json({ error: "rack, shelf and quantity must be >0!" });
  } else if (err.code === "23502") {
    return res
      .status(400)
      .json({ error: "name and quantity are required fields!" });
  } else {
    return res.status(500).json({ error: err.message });
  }
}

app.get("/", (req, res) => {
  res.json({ message: `Running straight from your house` });
});

app.get("/armarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM armario");
    res.json(result.rows);
  } catch (err) {
    parseerror(err, res);
  }
});

app.get("/cajas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM caja");
    res.json(result.rows);
  } catch (err) {
    parseerror(err, res);
  }
});

app.post("/cajas", async (req, res) => {
  try {
    const { name, description, rack, shelf, quantity, priority } = req.body;
    const result = await pool.query(
      "INSERT INTO caja (name, description, rack, shelf, quantity, priority) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, description, rack, shelf, quantity, priority],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    parseerror(err, res);
  }
});

app.patch("/cajas/:id", async (req, res) => {
  try {
    const newlines = Object.entries(req.body); // the entire shit but in matrices ig?
    const itemid = req.params.id; // id of the row we're changing
    const values = []; // each value so we can use "$x" to assign in the final thing later
    const formatlines = []; // formatted strings for each entry

    for (let i = 0; i < newlines.length; i++) {
      const head = `${newlines[i][0]}`;
      const value = `${newlines[i][1]}`;
      values.push(value);
      formatlines.push(`${head}=$${i + 1}`); // add an index instead of the crude value
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

app.delete("/cajas/:id", async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on http://10.216.39.102:${PORT}`);
});
