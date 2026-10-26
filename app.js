const express = require("express");
const cors = require("cors");
const notFoundMiddleware = require("./middlewares/notFound.middleware");
const errorMiddleware = require("./middlewares/error.middleware");
const demoRoute = require("./routes/demo/demo.route");
const fileRoute = require("./routes/demo/file.route");
const { userRouter } = require("./routes/users.route");
const { employeeRouter } = require("./routes/employees.route");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("./public")); // TO SERVE ANY STATIC FILES like html, css, js, images

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/api/v1/demo", demoRoute);
app.use("/api/v1/files", fileRoute);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/employees", employeeRouter);

// 404 Not Found Route Handler
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

module.exports = app
