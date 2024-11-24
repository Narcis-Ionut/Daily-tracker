// ToDoList.js
import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  FormControlLabel,
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
  completedTask: {
    textDecoration: "line-through",
    color: "gray",
  },
});

function ToDoList() {
  const classes = useStyles();

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [taskText, setTaskText] = useState("");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    setTasks([...tasks, { text: taskText, completed: false }]);
    setTaskText("");
  };

  const toggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  return (
    <Paper className={classes.container} elevation={3}>
      <Typography variant="h4" gutterBottom>
        To-Do List
      </Typography>
      <form className={classes.form} onSubmit={addTask}>
        <TextField
          label="Enter a new task..."
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          required
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ marginTop: 2 }}
        >
          Add Task
        </Button>
      </form>
      <Typography variant="h5" gutterBottom>
        Your Tasks
      </Typography>
      <List>
        {tasks.map((task, index) => (
          <ListItem
            key={index}
            className={classes.listItem}
            secondaryAction={
              <IconButton edge="end" onClick={() => deleteTask(index)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={task.completed}
                  onChange={() => toggleTask(index)}
                  color="primary"
                />
              }
              label={
                <ListItemText
                  primary={task.text}
                  className={task.completed ? classes.completedTask : ""}
                />
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default ToDoList;
