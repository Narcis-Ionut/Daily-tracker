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

// Styled components with automotive-themed colors
const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: "#ffffff",
  padding: "40px 50px",
  borderRadius: "16px",
  maxWidth: "900px",
  margin: "0 auto",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
  [theme.breakpoints.down("sm")]: {
    padding: "30px 25px",
  },
}));

const StyledButton = styled(Button)({
  backgroundColor: "#1E88E5", // Professional blue
  padding: "12px 24px",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "#1565C0",
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

function CarMaintenance() {
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
    const newRecord = { date, details, cost: parseFloat(cost) };
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
          color: "#1565C0", // Professional blue
          textAlign: "center",
          fontWeight: 600,
          marginBottom: 3,
        }}
      >
        Car Maintenance Records
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
              }}
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#1E88E5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1E88E5",
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Maintenance Details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#1E88E5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1E88E5",
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Cost (£)"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              InputProps={{
                inputProps: { min: 0, step: "0.01" },
              }}
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#1E88E5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1E88E5",
                  },
                },
              }}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, textAlign: "right" }}>
          <StyledButton type="submit" variant="contained">
            Add Maintenance Record
          </StyledButton>
        </Box>
      </Box>

      <Typography
        variant="h5"
        gutterBottom
        sx={{
          color: "#1565C0",
          marginBottom: 2,
          fontWeight: 500,
        }}
      >
        Service History
      </Typography>

      <List>
        {records.map((record, index) => (
          <StyledListItem
            key={index}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => deleteRecord(index)}
                sx={{ color: "#666" }}
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
                  color: "#333",
                },
                "& .MuiListItemText-secondary": {
                  color: "#1E88E5",
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

export default CarMaintenance;
