// FamilyNotes.js
import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  container: {
    padding: "16px",
  },
  form: {
    marginTop: "16px",
    marginBottom: "16px",
  },
  textarea: {
    width: "100%",
  },
  listItem: {
    borderBottom: "1px solid #e0e0e0",
  },
});

function FamilyNotes() {
  const classes = useStyles();

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
    <Paper className={classes.container} elevation={3}>
      <Typography variant="h4" gutterBottom>
        Family Notes
      </Typography>
      <form className={classes.form} onSubmit={addNote}>
        <TextField
          label="Write your note here..."
          multiline
          rows={4}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          required
          className={classes.textarea}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ marginTop: 2 }}
        >
          Add Note
        </Button>
      </form>
      <Typography variant="h5" gutterBottom>
        Notes
      </Typography>
      <List>
        {notes.map((note, index) => (
          <ListItem
            key={index}
            className={classes.listItem}
            secondaryAction={
              <IconButton edge="end" onClick={() => deleteNote(index)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={note} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default FamilyNotes;
