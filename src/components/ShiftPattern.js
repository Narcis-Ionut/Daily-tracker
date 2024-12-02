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
  styled,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ArrowBack, ArrowForward, Edit as EditIcon } from "@mui/icons-material";

// Styled components
const StyledPaper = styled(Paper)({
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "12px",
  maxWidth: "1200px",
  margin: "0 auto",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
});

const ShiftCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isWorking",
})(({ isWorking }) => ({
  padding: "12px",
  backgroundColor: isWorking ? "#e3f2fd" : "#fff3e0",
  cursor: "pointer",
  transition: "all 0.3s ease",
  minHeight: "100px",
  display: "flex",
  flexDirection: "column",
  border: "1px solid",
  borderColor: isWorking ? "#bbdefb" : "#ffe0b2",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
}));

function ShiftPattern() {
  const [shifts, setShifts] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("calendar");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState({
    date: null,
    note: "",
    isWorking: false,
  });

  const generateShifts = useCallback(
    (start) => {
      if (!start) return;

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
          note: "",
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
    <StyledPaper elevation={3}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#1976d2",
          fontWeight: 600,
          textAlign: "center",
          mb: 3,
        }}
      >
        Shift Pattern 4 on 4 off
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="First Work Day"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  sx={{
                    backgroundColor: "#ffffff",
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>

      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ my: 3 }}
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

      <Grid container justifyContent="center" sx={{ mb: 3 }}>
        <ToggleButtonGroup
          color="primary"
          value={view}
          exclusive
          onChange={handleViewChange}
        >
          <ToggleButton value="calendar">Calendar View</ToggleButton>
          <ToggleButton value="list">List View</ToggleButton>
        </ToggleButtonGroup>
      </Grid>

      {view === "calendar" ? (
        <Grid container spacing={2}>
          {shifts.map((shift, index) => (
            <Grid item xs={6} sm={3} md={2} key={index}>
              <ShiftCard
                isWorking={shift.isWorking}
                onClick={() => handleDayClick(shift)}
                elevation={1}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {shift.date.getDate()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: shift.isWorking ? "#1976d2" : "#f57c00" }}
                >
                  {shift.label}
                </Typography>
                {shift.note && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: "#666",
                      fontSize: "0.8rem",
                      fontStyle: "italic",
                    }}
                  >
                    {shift.note}
                  </Typography>
                )}
              </ShiftCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, backgroundColor: "#fff" }}>
          {shifts.map((shift, index) => (
            <Typography
              key={index}
              onClick={() => handleDayClick(shift)}
              sx={{
                cursor: "pointer",
                p: 1,
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
            >
              {shift.date.toDateString()} - {shift.label}
              {shift.note && ` (${shift.note})`}
            </Typography>
          ))}
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Add Note to Shift</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {editEntry.date?.toDateString()} -{" "}
            {editEntry.isWorking ? "Work Day" : "Off Day"}
          </Typography>
          <TextField
            label="Add note (e.g., Overtime)"
            value={editEntry.note}
            onChange={(e) =>
              setEditEntry({ ...editEntry, note: e.target.value })
            }
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveEntry} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
}

export default ShiftPattern;
