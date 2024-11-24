// ShiftPattern.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Paper,
  Typography,
  TextField,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { LocalizationProvider, CalendarPicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";

function ShiftPattern() {
  const [shifts, setShifts] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("calendar");

  const generateShifts = useCallback(
    (start) => {
      const monthShifts = [];
      const date = new Date(start);
      let working = true;
      let workCount = 0;

      // Adjust date to the first day of the selected month
      date.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

      const daysInMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      ).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const shiftDate = new Date(date.getFullYear(), date.getMonth(), i);

        // Shift pattern logic
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

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Shift Pattern 4 on 4 off
      </Typography>

      {/* Input Fields */}
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

      {/* View Toggle */}
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

      {/* Shift Display */}
      {view === "calendar" ? (
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          {shifts.map((shift, index) => (
            <Grid item xs={6} sm={3} md={2} key={index}>
              <Paper
                sx={{
                  padding: 1,
                  backgroundColor: shift.isWorking ? "#e8f5e9" : "#ffebee",
                }}
              >
                <Typography variant="subtitle2">
                  {shift.date.toDateString()}
                </Typography>
                <Typography variant="body2">{shift.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ marginTop: 2, padding: 2 }}>
          {shifts.map((shift, index) => (
            <Typography key={index}>
              {shift.date.toDateString()} - {shift.label}
            </Typography>
          ))}
        </Paper>
      )}
    </Paper>
  );
}

export default ShiftPattern;
