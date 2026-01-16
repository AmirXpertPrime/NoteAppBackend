const Note = require("../models/Note");

// Create Note
const createNote = async (req, res) => {
    console.log('createNote request', req);
    if (!req.body) {
        return res.status(400).json({ message: "Body required" });
    }
    const { title, description, isLiked, isArchived } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: "Title and description are required" });
    }

    try {
        const newNote = new Note({
            title,
            description,
            isLiked: isLiked || false,
            isArchived: isArchived || false,
            user: req.user.id
        });

        await newNote.save();
        res.status(201).json({ message: "Note created successfully", note: newNote });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get All Notes for a User
const getAllNotes = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('userId in getAllNotes', userId);
        const notes = await Note.find({ user: userId })
            .sort({ createdAt: -1 });
        res.json({ notes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Single Note
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.json({ note });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Update Note
const updateNote = async (req, res) => {
    // If client didn't send JSON body, req.body can be undefined.
    const { title, description, isLiked, isArchived } = req.body || {};
    console.log('req.body in updateNote======', req.body);

    if (!req.body) {
        return res.status(400).json({
            message: "Request body is required. Send JSON and set Content-Type: application/json."
        });
    }

    const hasAnyUpdate =
        typeof title !== "undefined" ||
        typeof description !== "undefined" ||
        typeof isLiked !== "undefined" ||
        typeof isArchived !== "undefined";

    if (!hasAnyUpdate) {
        return res.status(400).json({ message: "At least one field is required to update." });
    }
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
        console.log('note in updateNote', note);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        if (title) note.title = title;
        if (description) note.description = description;
        if (typeof isLiked === "boolean") note.isLiked = isLiked;
        if (typeof isArchived === "boolean") note.isArchived = isArchived;

        await note.save();
        res.json({ message: "Note updated successfully", note });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete Note
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: "Note deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote
};

