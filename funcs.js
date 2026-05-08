const express = require("express");

function parseerror(err, res) {
  if (err.code === "23514") {
    return res.status(400).json({ error: "the values must be >0!" });
  } else if (err.code === "23502") {
    return res.status(400).json({
      error: "Required fields missing! (name, quantity, number, shelves)",
    });
  } else if (err.code === "23503") {
    return res.status(400).json({ error: "rack does not exist" });
  } else if (err.code === "23505") {
    return res
      .status(400)
      .json({ error: "a rack with that number already exists" });
  } else {
    return res.status(500).json({ error: err.message });
  }
}

function parserackshelf(res, reqshelf, reqshelves) {
  if (!reqshelves.rows[0])
    return res.status(400).json({ error: "the requested rack doesn't exist" });
  if (reqshelf > reqshelves.rows[0].shelves)
    return res
      .status(400)
      .json({ error: "ts doesn't fit twin (shelf doesn't exist)" });
}

module.exports = { parseerror, parserackshelf };
