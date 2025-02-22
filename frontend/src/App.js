import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import { CssBaseline, Box, Container } from '@mui/material';
import NavBar from './components/NavBar';
import Home from './components/Home';
import GenerateQuestions from './components/GenerateQuestions';
import GradeSubmissions from './components/GradeSubmissions';

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  let theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2278bd',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: darkMode ? '#121212' : '#ffffff',
      },
    },
    components: {
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingTop: '2rem',
            paddingBottom: '2rem',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            padding: '2rem',
            borderRadius: 16, // Match the theme's borderRadius
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#8403fc' : '#2278bd',
          },
        },
      },
    },
  });

  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />
        <Container component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate-questions" element={<GenerateQuestions />} />
            <Route path="/grade-submissions" element={<GradeSubmissions />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;