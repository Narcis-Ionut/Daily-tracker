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
  Notes as NotesIcon,
  DirectionsCar as CarIcon,
  CheckCircle as ToDoIcon,
  Chat as ChatIcon,
  Psychology as ModelIcon,
} from "@mui/icons-material";

// Lazy-loaded components
const Home = lazy(() => import("./components/Home"));
const Notes = lazy(() => import("./components/Notes"));
const ModelService = lazy(() => import("./components/ModelService"));
const ToDoList = lazy(() => import("./components/ToDoList"));
const LocalChat = lazy(() => import("./components/LocalChat/LocalChat"));
const ModelTraining = lazy(() => import("./components/ModelTraining"));

function App() {
  const [isOpen, setIsOpen] = useState(false);

  // Dark, stealthy theme
  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#0096c7", // Accent color, a cool, intelligence-cyber blue
      },
      background: {
        default: "#0a0f1f", // Deep navy background
        paper: "#131b2f", // Slightly lighter card background
      },
      text: {
        primary: "#ffffff",
        secondary: "#b0b8c3",
      },
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', sans-serif",
      h6: {
        fontWeight: 600,
        letterSpacing: "0.5px",
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
        <AppBar
          position="fixed"
          sx={{
            background: "linear-gradient(to right, #0a0f1f, #131b2f)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
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
              Classified Ops Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Sidebar Drawer */}
        <Drawer
          anchor="left"
          open={isOpen}
          onClose={toggleDrawer}
          PaperProps={{
            sx: {
              backgroundColor: "#131b2f",
              borderRight: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        >
          <List sx={{ width: 250 }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={toggleDrawer}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0,150,199,0.15)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "#00b4d8" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      color: "text.primary",
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <main
          style={{
            marginTop: "80px",
            padding: "20px",
            backgroundColor: "#0a0f1f",
            minHeight: "100vh",
          }}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/model-service" element={<ModelService />} />
              <Route path="/to-do-list" element={<ToDoList />} />
              <Route path="/local-chat" element={<LocalChat />} />
              <Route path="/model-training" element={<ModelTraining />} />
            </Routes>
          </Suspense>
        </main>
      </Router>
    </ThemeProvider>
  );
}

export default App;
