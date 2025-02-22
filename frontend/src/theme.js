import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
        main: '#2278bd', // Example primary color for dark mode
        },
        secondary: {
        main: '#f50057', // Example secondary color for dark mode
        },
        background: {
        default: '#121212', // Example dark background color
        },
    },
});

export default theme;
