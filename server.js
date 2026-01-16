const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));    
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
