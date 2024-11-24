// CarMaintenance.js
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
  listItem: {
    borderBottom: "1px solid #e0e0e0",
  },
});

function CarMaintenance() {
  const classes = useStyles();

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
    <Paper className={classes.container} elevation={3}>
      <Typography variant="h4" gutterBottom>
        Car Maintenance
      </Typography>
      <form className={classes.form} onSubmit={addRecord}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              InputProps={{
                inputProps: { min: 0, step: "0.01" },
              }}
              required
              fullWidth
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ marginTop: 2 }}
        >
          Add Record
        </Button>
      </form>
      <Typography variant="h5" gutterBottom>
        Maintenance Records
      </Typography>
      <List>
        {records.map((record, index) => (
          <ListItem
            key={index}
            className={classes.listItem}
            secondaryAction={
              <IconButton edge="end" onClick={() => deleteRecord(index)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${record.date} - ${record.details}`}
              secondary={`Cost: $${record.cost.toFixed(2)}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default CarMaintenance;
