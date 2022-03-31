module.exports = function (app) {
  const express = require("express");
  const morgan = require("morgan");
  app.use(express.json()); // for parsing application/json
  app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  app.use(morgan("combined"));
};
