import React, { useState } from 'react';
import api from '../lib/api';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
    IconButton,
    Paper,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';

const GradeSubmissions = () => {
    const [studentSubmissions, setStudentSubmissions] = useState([]);
    const [gradingCriteria, setGradingCriteria] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (studentSubmissions.length === 0 || !gradingCriteria.trim()) return;

        const formData = new FormData();
        studentSubmissions.forEach((file) => formData.append('studentSubmissions', file));
        formData.append('gradingCriteria', gradingCriteria);

        setLoading(true);
        setError('');
        setFeedbacks([]);

        try {
            const response = await api.post('/grade', formData);
            setFeedbacks(response.data);
        } catch {
            setError('Could not grade the submissions. Check the PDFs and backend configuration, then try again.');
        } finally {
            setLoading(false);
        }
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
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <input
                                accept=".pdf,application/pdf"
                                style={{ display: 'none' }}
                                id="student-submissions"
                                type="file"
                                multiple
                                onChange={(event) => setStudentSubmissions(Array.from(event.target.files || []))}
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
                            {studentSubmissions.length > 0 && (
                                <Typography variant="body2" mt={1} color="text.secondary">
                                    Files: {studentSubmissions.map((file) => file.name).join(', ')}
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
                                onChange={(event) => setGradingCriteria(event.target.value)}
                                fullWidth
                                required
                                variant="outlined"
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Enter the grading criteria for the submissions
                                </Typography>
                                <Tooltip title="Provide clear instructions on how to grade the submissions">
                                    <IconButton size="small" sx={{ ml: 1 }} aria-label="Grading criteria help">
                                        <HelpOutlineIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                disabled={loading || studentSubmissions.length === 0 || !gradingCriteria.trim()}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Grade Submissions'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
                {feedbacks.map(({ fileName, feedback }) => (
                    <Paper key={fileName} variant="outlined" sx={{ mt: 3, p: 2 }}>
                        <Typography variant="h6" gutterBottom>{fileName}</Typography>
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{feedback}</Typography>
                    </Paper>
                ))}
            </Paper>
        </Container>
    );
};

export default GradeSubmissions;
