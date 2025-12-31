import { useState } from 'react';
import { Container, Typography, Button, Paper, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import api from '../api/axios';

const AISuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const getSuggestions = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/ai/suggest');
            if (data && Array.isArray(data)) {
                setSuggestions(data);
            } else {
                alert(data.message || 'No suggestions available');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to get suggestions');
        } finally {
            setLoading(false);
        }
    };

    const applySuggestion = async (suggestion) => {
        try {
            await api.put(`/tasks/${suggestion.taskId}`, {
                assignedTo: suggestion.assignedTo,
                priority: suggestion.suggestedPriority,
                deadline: suggestion.suggestedDeadline
            });
            // Remove from list or mark as applied
            setSuggestions(suggestions.filter(s => s.taskId !== suggestion.taskId));
            alert('Suggestion applied!');
        } catch (error) {
            console.error(error);
            alert('Failed to apply suggestion');
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>AI Task Recommendations</Typography>
            <Paper sx={{ p: 2, mb: 4 }}>
                <Typography variant="body1" gutterBottom>
                    The AI analyzes unassigned tasks and team skills to recommend assignments, priorities, and deadlines.
                </Typography>
                <Button variant="contained" onClick={getSuggestions} disabled={loading}>
                    {loading ? 'Analyzing...' : 'Analyze & Suggest'}
                </Button>
            </Paper>

            <List>
                {suggestions.map((suggestion, index) => (
                    <Paper key={index} sx={{ mb: 2 }}>
                        <ListItem alignItems="flex-start" secondaryAction={
                            <Button variant="outlined" size="small" onClick={() => applySuggestion(suggestion)}>Apply</Button>
                        }>
                            <ListItemText
                                primary={`Task ID: ${suggestion.taskId}`}
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            Suggested Assignee ID: {suggestion.assignedTo}
                                        </Typography>
                                        <br />
                                        Reason: {suggestion.reason}
                                        <br />
                                        <Chip size="small" label={`Priority: ${suggestion.suggestedPriority}`} color={suggestion.suggestedPriority === 'High' ? 'error' : 'default'} />
                                        <Chip size="small" label={`Deadline: ${suggestion.suggestedDeadline}`} sx={{ ml: 1 }} />
                                    </>
                                }
                            />
                        </ListItem>
                    </Paper>
                ))}
                {suggestions.length === 0 && !loading && <Typography>No suggestions loaded.</Typography>}
            </List>
        </Container>
    );
};

export default AISuggestions;
