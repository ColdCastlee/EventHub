const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const eventRoutes = require("./routes/eventRoutes");
const participantRoutes = require("./routes/participantRoutes");
const registrationRoutes = require("./routes/registrationRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    message: "EventHub Node.js backend is running"
  });
});

app.use("/api/events", eventRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/registrations", registrationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;