import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
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
  maxWidth: "900px",
  margin: "0 auto",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
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

function ModelService() {
  const [records, setRecords] = useState(() => {
    const savedRecords = localStorage.getItem("carRecords");
    return savedRecords ? JSON.parse(savedRecords) : [];
  });

  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");
  const [cost, setCost] = useState("");

  useEffect(() => {
    localStorage.setItem("carRecords", JSON.stringify(records));
  }, [records]);

  const addRecord = (e) => {
    e.preventDefault();
    const newRecord = { date, details, cost: parseFloat(cost || "0") };
    setRecords([...records, newRecord]);
    setDate("");
    setDetails("");
    setCost("");
  };

  const deleteRecord = (index) => {
    const updatedRecords = records.filter((_, i) => i !== index);
    setRecords(updatedRecords);
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
        Model Change Records
      </Typography>

      <Box component="form" onSubmit={addRecord} sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Service Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
                style: { color: "#ffffff" },
              }}
              required
              fullWidth
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
                "& .MuiFormLabel-root": {
                  color: "#b0b8c3",
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
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
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, textAlign: "right" }}>
          <StyledButton type="submit" variant="contained">
            Add Record
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
        History
      </Typography>

      <List>
        {records.map((record, index) => (
          <StyledListItem
            key={index}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => deleteRecord(index)}
                sx={{ color: "#b0b8c3" }}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${record.date} - ${record.details}`}
              secondary={`Cost: £${record.cost.toFixed(2)}`}
              sx={{
                "& .MuiListItemText-primary": {
                  fontWeight: 500,
                  color: "#ffffff",
                },
                "& .MuiListItemText-secondary": {
                  color: "#00b4d8",
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

export default ModelService;
