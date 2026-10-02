import React from 'react';
import { Typography, Container, Paper, Box, Grid } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';

const Home = () => {
    return (
        <Container maxWidth="md">
        <Paper elevation={3}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
            <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
                Welcome to SchoolBot
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: '600px', mx: 'auto', mt: 2, mb: 4 }}>
                This application helps teachers generate questions and grade submissions using AI.
                Streamline your workflow and enhance your teaching experience with our advanced tools.
            </Typography>
            <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} sm={6}>
                <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                    <AssignmentIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>Generate Questions</Typography>
                    <Typography variant="body2">
                    Easily create custom quizzes and assignments based on your course material.
                    </Typography>
                </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                    <GradeIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>Grade Submissions</Typography>
                    <Typography variant="body2">
                    Automate the grading process and provide consistent feedback to your students.
                    </Typography>
                </Paper>
                </Grid>
            </Grid>
            </Box>
        </Paper>
        </Container>
    );
};

export default Home;