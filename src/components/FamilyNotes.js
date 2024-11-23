import React, { useState, useEffect } from "react";
import "./FamilyNotes.css";

function FamilyNotes() {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem("familyNotes");
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    localStorage.setItem("familyNotes", JSON.stringify(notes));
  }, [notes]);

  const addNote = (e) => {
    e.preventDefault();
    setNotes([...notes, noteText]);
    setNoteText("");
  };

  const deleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  return (
    <div className="family-notes-container">
      <h2 className="family-notes-heading">Family Notes</h2>
      <form className="family-notes-form" onSubmit={addNote}>
        <textarea
          className="family-notes-textarea"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write your note here..."
          required
        />
        <button className="family-notes-button" type="submit">
          Add Note
        </button>
      </form>
      <h3 className="family-notes-subheading">Notes</h3>
      <ul className="family-notes-list">
        {notes.map((note, index) => (
          <li className="family-notes-list-item" key={index}>
            {note}
            <button
              className="family-notes-delete-button"
              onClick={() => deleteNote(index)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FamilyNotes;
