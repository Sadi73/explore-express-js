const app = require("./app");
const connectDB = require("./config/db");

const port = process.env.PORT || 5000;

// Connect DB
connectDB();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
