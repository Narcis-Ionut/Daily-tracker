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

// Dark theme CIA/NSA style colors
// Background: deep navy, text: white, accent: cyan
const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: "#0a0f1f",
  padding: "40px 50px",
  borderRadius: "16px",
  maxWidth: "800px",
  margin: "0 auto",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
  color: "#ffffff",
  [theme.breakpoints.down("sm")]: {
    padding: "30px 25px",
  },
}));

const StyledButton = styled(Button)({
  backgroundColor: "#00b4d8",
  padding: "12px 24px",
  borderRadius: "8px",
  color: "#ffffff",
  fontWeight: 500,
  "&:hover": {
    backgroundColor: "#0096c7",
  },
});

const StyledListItem = styled(ListItem)({
  backgroundColor: "#131b2f",
  borderRadius: "8px",
  marginBottom: "10px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  "&:hover": {
    backgroundColor: "#192038",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
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
          color: "#00b4d8",
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
          InputLabelProps={{
            style: { color: "#b0b8c3" },
          }}
          sx={{
            "& .MuiInputBase-root": {
              color: "#ffffff",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
              "&:hover fieldset": {
                borderColor: "#00b4d8",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#00b4d8",
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
          color: "#00b4d8",
          marginBottom: 2,
          fontWeight: 500,
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
                sx={{ color: "#b0b8c3" }}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={note}
              sx={{
                "& .MuiListItemText-primary": {
                  color: "#ffffff",
                  fontWeight: 500,
                },
              }}
            />
          </StyledListItem>
        ))}
      </List>
    </StyledPaper>
  );
}

export default FamilyNotes;
