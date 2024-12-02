// App.js
import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Notes as NotesIcon,
  DirectionsCar as CarIcon,
  CheckCircle as ToDoIcon,
  Chat as ChatIcon, // Add an icon for LocalChat
} from "@mui/icons-material";

// Lazy-loaded components
const Home = lazy(() => import("./components/Home"));
const ShiftPattern = lazy(() => import("./components/ShiftPattern"));
const Notes = lazy(() => import("./components/Notes"));
const CarMaintenance = lazy(() => import("./components/CarMaintenance"));
const ToDoList = lazy(() => import("./components/ToDoList"));
const LocalChat = lazy(() => import("./components/LocalChat")); // Import LocalChat

function App() {
  const [isOpen, setIsOpen] = useState(false);

  // Theme customization
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#1976d2",
      },
    },
  });

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Shift Pattern", icon: <CalendarIcon />, path: "/shift-pattern" },
    { text: "Notes", icon: <NotesIcon />, path: "/notes" },
    { text: "Car Maintenance", icon: <CarIcon />, path: "/car-maintenance" },
    { text: "To-Do List", icon: <ToDoIcon />, path: "/to-do-list" },
    { text: "Local Chat", icon: <ChatIcon />, path: "/local-chat" }, // Add LocalChat menu item
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {/* AppBar */}
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div">
              My Planner
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Sidebar Drawer */}
        <Drawer anchor="left" open={isOpen} onClose={toggleDrawer}>
          <List sx={{ width: 250 }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={toggleDrawer}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <main style={{ marginTop: "80px", padding: "20px" }}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shift-pattern" element={<ShiftPattern />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/car-maintenance" element={<CarMaintenance />} />
              <Route path="/to-do-list" element={<ToDoList />} />
              <Route path="/local-chat" element={<LocalChat />} />{" "}
              {/* Add LocalChat route */}
            </Routes>
          </Suspense>
        </main>
      </Router>
    </ThemeProvider>
  );
}

export default App;
