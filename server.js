const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// Middleware
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// If you deploy behind a proxy/load balancer (Render/Heroku/Nginap), this helps secure cookies work correctly.
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

app.use(
    cors({
        origin: CLIENT_URL, // React app url
        credentials: true, // allow cookies to be sent
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Test Route
app.get("/", (req, res) => {
    res.send("Hello World");
});


app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/note"));


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

const HOST = process.env.HOST || "0.0.0.0"; // listen on all interfaces
const PORT = process.env.PORT || 5000;


app.listen(PORT, HOST, () =>
    console.log(`Server running at http://${HOST}:${PORT}`)
);
