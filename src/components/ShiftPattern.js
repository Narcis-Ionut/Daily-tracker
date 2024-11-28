import React, { useState, useEffect, useCallback } from "react";
import {
  Paper,
  Typography,
  TextField,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField as MuiTextField,
} from "@mui/material";
import { LocalizationProvider, CalendarPicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

function ShiftPattern() {
  const [shifts, setShifts] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("calendar");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState({ date: null, note: "" });

  const generateShifts = useCallback(
    (start) => {
      const monthShifts = [];
      const date = new Date(start);
      date.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

      const daysInMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      ).getDate();

      let working = true;
      let workCount = 0;

      for (let i = 1; i <= daysInMonth; i++) {
        const shiftDate = new Date(date.getFullYear(), date.getMonth(), i);

        if (working && workCount === 4) {
          working = false;
          workCount = 0;
        } else if (!working && workCount === 4) {
          working = true;
          workCount = 0;
        }

        monthShifts.push({
          date: shiftDate,
          isWorking: working,
          label: working ? "Work Day" : "Off Day",
          note: "", // Add a note field for editing
        });

        workCount++;
      }

      setShifts(monthShifts);
    },
    [selectedDate]
  );

  useEffect(() => {
    if (startDate) {
      generateShifts(startDate);
    }
  }, [startDate, selectedDate, generateShifts]);

  const handleViewChange = (event, nextView) => {
    if (nextView !== null) {
      setView(nextView);
    }
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const handleDayClick = (shift) => {
    setEditEntry(shift);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSaveEntry = () => {
    setShifts((prevShifts) =>
      prevShifts.map((shift) =>
        shift.date.getTime() === editEntry.date.getTime()
          ? { ...shift, note: editEntry.note }
          : shift
      )
    );
    setDialogOpen(false);
  };

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Shift Pattern 4 on 4 off
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <TextField
            label="First Work Day"
            type="date"
            value={startDate ? startDate.toISOString().split("T")[0] : ""}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CalendarPicker
              date={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>

      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ marginTop: 2 }}
      >
        <IconButton onClick={() => handleMonthChange(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6">
          {selectedDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </Typography>
        <IconButton onClick={() => handleMonthChange(1)}>
          <ArrowForward />
        </IconButton>
      </Grid>

      <ToggleButtonGroup
        color="primary"
        value={view}
        exclusive
        onChange={handleViewChange}
        sx={{ marginTop: 2 }}
      >
        <ToggleButton value="calendar">Calendar View</ToggleButton>
        <ToggleButton value="list">List View</ToggleButton>
      </ToggleButtonGroup>

      {view === "calendar" ? (
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          {shifts.map((shift, index) => (
            <Grid item xs={6} sm={3} md={2} key={index}>
              <Paper
                sx={{
                  padding: 1,
                  backgroundColor: shift.isWorking ? "#e8f5e9" : "#ffebee",
                  cursor: "pointer",
                }}
                onClick={() => handleDayClick(shift)}
              >
                <Typography variant="subtitle2">
                  {shift.date.toDateString()}
                </Typography>
                <Typography variant="body2">{shift.label}</Typography>
                {shift.note && (
                  <Typography variant="body2" color="textSecondary">
                    {shift.note}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ marginTop: 2, padding: 2 }}>
          {shifts.map((shift, index) => (
            <Typography
              key={index}
              onClick={() => handleDayClick(shift)}
              sx={{ cursor: "pointer" }}
            >
              {shift.date.toDateString()} - {shift.label}
              {shift.note && ` (${shift.note})`}
            </Typography>
          ))}
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Edit Entry</DialogTitle>
        <DialogContent>
          <Typography>{editEntry.date?.toDateString()}</Typography>
          <MuiTextField
            label="Note"
            value={editEntry.note}
            onChange={(e) =>
              setEditEntry({ ...editEntry, note: e.target.value })
            }
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveEntry} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default ShiftPattern;
