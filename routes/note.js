const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const {
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote
} = require("../controller/noteController");

// All note routes require authentication
router.use(authenticate);

// Create Note
router.post("/create", createNote);

// Get All Notes
router.get("/getAllNotes", getAllNotes);

// Get Single Note
router.get("/:id", getNoteById);

// Update Note
router.put("/updateNote/:id", updateNote);

// Delete Note
router.delete("/deleteNote/:id", deleteNote);

module.exports = router;

