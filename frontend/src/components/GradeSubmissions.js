import React, { useState } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Grid,
    IconButton,
    Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';

const GradeSubmissions = () => {
    const [studentSubmissions, setStudentSubmissions] = useState(null);
    const [gradingCriteria, setGradingCriteria] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('studentSubmissions', studentSubmissions);
        formData.append('gradingCriteria', gradingCriteria);

        axios.post('http://localhost:5000/grade', formData)
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.error('There was an error grading the submissions!', error);
        });
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <AutoStoriesIcon sx={{ fontSize: 60, color: 'primary.main', mr: 2 }} />
                <EmojiObjectsIcon sx={{ fontSize: 60, color: 'secondary.main' }} />
            </Box>
            <Paper elevation={3}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                Grade Submissions
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                    <input
                        accept=".pdf"
                        style={{ display: 'none' }}
                        id="student-submissions"
                        type="file"
                        onChange={(e) => setStudentSubmissions(e.target.files[0])}
                    />
                    <label htmlFor="student-submissions">
                        <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                        >
                        Upload Student Submissions (PDF)
                        </Button>
                    </label>
                    {studentSubmissions && (
                        <Typography variant="body2" mt={1} color="text.secondary">
                        File: {studentSubmissions.name}
                        </Typography>
                    )}
                    </Grid>
                    <Grid item xs={12}>
                    <TextField
                        id="grading-criteria"
                        label="Grading Criteria"
                        multiline
                        rows={4}
                        value={gradingCriteria}
                        onChange={(e) => setGradingCriteria(e.target.value)}
                        fullWidth
                        required
                        variant="outlined"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                        Enter the grading criteria for the submissions
                        </Typography>
                        <Tooltip title="Provide clear instructions on how to grade the submissions">
                        <IconButton size="small" sx={{ ml: 1 }}>
                            <HelpOutlineIcon />
                        </IconButton>
                        </Tooltip>
                    </Box>
                    </Grid>
                    <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="primary" fullWidth size="large">
                        Grade Submissions
                    </Button>
                    </Grid>
                </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default GradeSubmissions;