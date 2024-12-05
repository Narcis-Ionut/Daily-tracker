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
  Chat as ChatIcon,
  Psychology as ModelIcon, // New icon for Model Training
} from "@mui/icons-material";

// Lazy-loaded components
const Home = lazy(() => import("./components/Home"));
const Notes = lazy(() => import("./components/Notes"));
const ModelService = lazy(() => import("./components/ModelService"));
const ToDoList = lazy(() => import("./components/ToDoList"));
const LocalChat = lazy(() => import("./components/LocalChat"));
const ModelTraining = lazy(() => import("./components/ModelTraining"));

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
    { text: "Notes", icon: <NotesIcon />, path: "/notes" },
    { text: "Model Service", icon: <CarIcon />, path: "/model-service" },
    { text: "To-Do List", icon: <ToDoIcon />, path: "/to-do-list" },
    { text: "Local Chat", icon: <ChatIcon />, path: "/local-chat" },
    { text: "Model Training", icon: <ModelIcon />, path: "/model-training" },
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
              <Route path="/notes" element={<Notes />} />
              <Route path="/model-service" element={<ModelService />} />
              <Route path="/to-do-list" element={<ToDoList />} />
              <Route path="/local-chat" element={<LocalChat />} />
              <Route path="/model-training" element={<ModelTraining />} />{" "}
              {/* New route */}
            </Routes>
          </Suspense>
        </main>
      </Router>
    </ThemeProvider>
  );
}

export default App;
