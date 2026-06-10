require("dotenv").config()
const express = require("express");
const cajas = require("./tables/cajas");
const armarios = require("./tables/armarios");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors())
app.use(express.json());
app.use("/cajas", cajas);
app.use("/armarios", armarios);

app.get("/", (req, res) => {
  res.json({ message: `Running straight from your house` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
