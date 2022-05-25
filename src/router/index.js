module.exports = function (app) {
  app.post("/", require("../controller/mqtt").post);
  app.get("/", require("../controller/mqtt").get);
};
