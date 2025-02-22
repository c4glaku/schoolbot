import React, { useState } from 'react';
import axios from 'axios';
import {
    Box, Button,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Paper,
    Grid,
    Slider,
    IconButton,
    Tooltip,
    CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';

const GenerateQuestions = () => {
    const [file, setFile] = useState(null);
    const [questionType, setQuestionType] = useState('mcq');
    const [difficulty, setDifficulty] = useState('easy');
    const [numQuestions, setNumQuestions] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('questionType', questionType);
        formData.append('difficulty', difficulty);
        formData.append('numQuestions', numQuestions);

        try {
            const response = await axios.post('http://localhost:5000/generate/generate-questions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                responseType: 'blob', // To handle PDF response
            });
            // Create a URL for the PDF blob and open it in a new tab
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'generated_questions.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating questions:', error);
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
                <Box sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                    Generate Questions
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                        <input
                            accept=".pdf,.png,.txt"
                            style={{ display: 'none' }}
                            id="file-upload"
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <label htmlFor="file-upload">
                            <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                            >
                            Upload File (PDF, PNG, or TXT)
                            </Button>
                        </label>
                        {file && (
                            <Typography variant="body2" mt={1} color="text.secondary">
                            File: {file.name}
                            </Typography>
                        )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="question-type-label">Question Type</InputLabel>
                            <Select
                            labelId="question-type-label"
                            id="question-type"
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                            label="Question Type"
                            >
                            <MenuItem value="mcq">Multiple Choice</MenuItem>
                            <MenuItem value="short">Short Answer</MenuItem>
                            </Select>
                        </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="difficulty-label">Difficulty</InputLabel>
                            <Select
                            labelId="difficulty-label"
                            id="difficulty"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            label="Difficulty"
                            >
                            <MenuItem value="easy">Easy</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="hard">Hard</MenuItem>
                            </Select>
                        </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                        <Typography variant="body1" gutterBottom>Number of Questions</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Slider
                            value={numQuestions}
                            onChange={(_, newValue) => setNumQuestions(newValue)}
                            min={1}
                            max={20}
                            step={1}
                            marks
                            valueLabelDisplay="auto"
                            sx={{ flexGrow: 1, mr: 2 }}
                            />
                            <TextField
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Number(e.target.value))}
                            type="number"
                            InputProps={{ inputProps: { min: 1, max: 20 } }}
                            sx={{ width: 60 }}
                            />
                            <Tooltip title="Choose between 1 and 20 questions">
                            <IconButton size="small" sx={{ ml: 1 }}>
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
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Generate Questions'}
                        </Button>
                        </Grid>
                    </Grid>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default GenerateQuestions;