import React, { useState, useEffect } from "react";
import "./ToDoList.css";

function ToDoList() {
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
    <div className="todo-list-container">
      <h2 className="todo-list-heading">To-Do List</h2>
      <form className="todo-list-form" onSubmit={addTask}>
        <input
          className="todo-list-input"
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Enter a new task..."
          required
        />
        <button className="todo-list-button" type="submit">
          Add Task
        </button>
      </form>
      <h3 className="todo-list-subheading">Your Tasks</h3>
      <ul className="todo-list">
        {tasks.map((task, index) => (
          <li
            key={index}
            className={`todo-list-item ${
              task.completed ? "todo-list-item-completed" : ""
            }`}
          >
            <label>
              <input
                className="todo-list-checkbox"
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(index)}
              />
              <span className="todo-list-task-text">{task.text}</span>
            </label>
            <button
              className="todo-list-delete-button"
              onClick={() => deleteTask(index)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ToDoList;
