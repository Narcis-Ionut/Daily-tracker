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
  Box,
  styled,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

// Styled components with warmer, family-friendly colors
const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: "#ffffff",
  padding: "40px 50px",
  borderRadius: "16px",
  maxWidth: "800px",
  margin: "0 auto",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
  [theme.breakpoints.down("sm")]: {
    padding: "30px 25px",
  },
}));

const StyledButton = styled(Button)({
  backgroundColor: "#4CAF50", // Warm green color
  padding: "12px 24px",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "#388E3C",
  },
});

const StyledListItem = styled(ListItem)({
  backgroundColor: "#f8f8f8",
  borderRadius: "8px",
  marginBottom: "10px",
  border: "1px solid #e0e0e0",
  "&:hover": {
    backgroundColor: "#f0f0f0",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  },
});

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
    if (noteText.trim()) {
      setNotes([...notes, noteText]);
      setNoteText("");
    }
  };

  const deleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#2E7D32", // Warm green
          textAlign: "center",
          fontWeight: 600,
          marginBottom: 3,
        }}
      >
        Notes
      </Typography>

      <Box component="form" onSubmit={addNote} sx={{ mb: 4 }}>
        <TextField
          label="Write your note here..."
          multiline
          rows={4}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          required
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "#4CAF50",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#4CAF50",
              },
            },
          }}
        />
        <Box sx={{ mt: 2, textAlign: "right" }}>
          <StyledButton type="submit" variant="contained">
            Add Note
          </StyledButton>
        </Box>
      </Box>

      <Typography
        variant="h5"
        gutterBottom
        sx={{
          color: "#2E7D32",
          marginBottom: 2,
        }}
      >
        Notes
      </Typography>

      <List>
        {notes.map((note, index) => (
          <StyledListItem
            key={index}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => deleteNote(index)}
                sx={{ color: "#666" }}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={note} />
          </StyledListItem>
        ))}
      </List>
    </StyledPaper>
  );
}

export default FamilyNotes;
