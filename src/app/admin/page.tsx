"use client";

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#9f804a', // Custom Gold Theme
        },
        background: {
            default: '#353335', // Custom Dark Theme
            paper: '#2a282a',
        },
    },
    typography: {
        fontFamily: '"Azonix", "Poppins", sans-serif',
    },
});

const API_BASE_URL = 'https://inkspire-server.onrender.com/api/admin';

export default function AdminDashboard() {
    const [tabIndex, setTabIndex] = useState(0);
    const [rounds, setRounds] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [scores, setScores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Auth states
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [authError, setAuthError] = useState('');

    // Dialog states
    const [openRoundDialog, setOpenRoundDialog] = useState(false);
    const [newRoundName, setNewRoundName] = useState('');

    useEffect(() => {
        const auth = localStorage.getItem('inkspire_admin_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === 'InkSpire@SVIET') {
            setIsAuthenticated(true);
            localStorage.setItem('inkspire_admin_auth', 'true');
            setAuthError('');
        } else {
            setAuthError('Incorrect password');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('inkspire_admin_auth');
        setPasswordInput('');
        setTabIndex(0);
    };

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [roundsRes, teamsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/rounds`),
                axios.get(`${API_BASE_URL}/teams`)
            ]);
            setRounds(roundsRes.data);
            setTeams(teamsRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchScoresForRound = async (roundId: string) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/scores/${roundId}`);
            setScores(res.data);
        } catch (error) {
            console.error("Error fetching scores:", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchInitialData();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (tabIndex > 0 && rounds[tabIndex - 1]) {
            fetchScoresForRound(rounds[tabIndex - 1]._id);
        }
    }, [tabIndex, rounds]);

    const handleCreateRound = async () => {
        try {
            await axios.post(`${API_BASE_URL}/rounds`, { name: newRoundName });
            setNewRoundName('');
            setOpenRoundDialog(false);
            fetchInitialData();
        } catch (error) {
            console.error("Error creating round:", error);
        }
    };

    // Temporary local state for score edits before saving
    const [tempScores, setTempScores] = useState<Record<string, number>>({});

    const handleScoreChange = (teamId: string, value: string) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) return;
        setTempScores(prev => ({ ...prev, [teamId]: numValue }));
    };

    const handleSaveScores = async (roundId: string) => {
        try {
            const promises = Object.entries(tempScores).map(([teamId, scoreValue]) =>
                axios.post(`${API_BASE_URL}/scores`, { teamId, roundId, scoreValue })
            );
            await Promise.all(promises);
            setTempScores({}); // Clear temp scores after save
            fetchScoresForRound(roundId); // Refresh from server
            fetchInitialData(); // Refresh global totals
        } catch (error) {
            console.error("Error saving scores:", error);
        }
    };

    const handleDeleteRound = async (roundId: string) => {
        if (!window.confirm("Are you sure you want to delete this round? All associated scores will be lost and total rankings will be recalculated.")) return;

        try {
            await axios.delete(`${API_BASE_URL}/rounds/${roundId}`);
            setTabIndex(0); // Reset to global view
            fetchInitialData();
        } catch (error) {
            console.error("Error deleting round:", error);
        }
    };

    const getScoreForTeam = (teamId: string) => {
        if (tempScores[teamId] !== undefined) return tempScores[teamId];
        const scoreDoc = scores.find(s => s.teamId?._id === teamId || s.teamId === teamId);
        return scoreDoc ? scoreDoc.scoreValue : 0;
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Team Name', flex: 1 },
        { field: 'totalScore', headerName: 'Total Score (Global)', flex: 1, align: 'center', headerAlign: 'center' },
    ];

    const roundColumns: GridColDef[] = [
        { field: 'name', headerName: 'Team Name', flex: 1 },
        {
            field: 'score',
            headerName: 'Round Score',
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <TextField
                    type="number"
                    variant="outlined"
                    size="small"
                    value={getScoreForTeam(params.row.id as string)}
                    onChange={(e) => handleScoreChange(params.row.id as string, e.target.value)}
                />
            )
        },
    ];

    if (loading) {
        return (
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default' }}>
                    <CircularProgress color="primary" size={60} />
                </Box>
            </ThemeProvider>
        );
    }

    if (!isAuthenticated) {
        return (
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                    <Paper sx={{ p: 5, width: 400, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
                        <Typography variant="h5" color="primary" gutterBottom fontWeight="bold" fontFamily="Azonix, sans-serif">
                            Admin Login
                        </Typography>
                        <form onSubmit={handleLogin}>
                            <TextField
                                fullWidth
                                type="password"
                                label="Password"
                                variant="outlined"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                sx={{ my: 3 }}
                                error={!!authError}
                                helperText={authError}
                            />
                            <Button fullWidth variant="contained" color="primary" type="submit" size="large" sx={{ fontWeight: 'bold' }}>
                                Unlock Dashboard
                            </Button>
                        </form>
                    </Paper>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '100%', margin: 'auto', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', position: 'relative' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
                    <Typography variant="h4" fontWeight="bold" fontFamily="Azonix, sans-serif" color="primary">
                        Tournament Admin Dashboard
                    </Typography>
                </Box>

                {/* Floating Logout Button for guaranteed visibility */}
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleLogout}
                    sx={{
                        fontWeight: 'bold',
                        position: 'absolute',
                        top: { xs: 16, md: 32 },
                        right: { xs: 16, md: 32 },
                        zIndex: 100
                    }}
                >
                    Logout
                </Button>

                <Paper sx={{ mb: 4 }}>
                    <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} variant="scrollable" scrollButtons="auto">
                        <Tab label="Global Settings" />
                        {rounds.map((round) => (
                            <Tab key={round._id} label={round.name} />
                        ))}
                    </Tabs>
                </Paper>

                {tabIndex === 0 && (
                    <Box>
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Button variant="contained" color="secondary" onClick={() => setOpenRoundDialog(true)}>
                                + New Round
                            </Button>
                        </Box>
                        <Paper sx={{ height: 600, width: '100%' }}>
                            <DataGrid
                                rows={teams.map(t => ({ id: t._id, name: t.name, totalScore: t.totalScore }))}
                                columns={columns}
                                disableRowSelectionOnClick
                                sx={{ '& .MuiDataGrid-root': { bgcolor: 'background.paper', color: 'text.primary' } }}
                            />
                        </Paper>
                    </Box>
                )}

                {tabIndex > 0 && rounds[tabIndex - 1] && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                                    Editing Scores for: {rounds[tabIndex - 1].name}
                                </Typography>
                                <IconButton color="error" onClick={() => handleDeleteRound(rounds[tabIndex - 1]._id)} aria-label="delete round">
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleSaveScores(rounds[tabIndex - 1]._id)}
                                disabled={Object.keys(tempScores).length === 0}
                            >
                                Save Scores
                            </Button>
                        </Box>
                        <Paper sx={{ height: 600, width: '100%', mt: 2 }}>
                            <DataGrid
                                rows={teams.map(t => ({ id: t._id, name: t.name }))}
                                columns={roundColumns}
                                disableRowSelectionOnClick
                                sx={{ '& .MuiDataGrid-root': { bgcolor: 'background.paper', color: 'text.primary' } }}
                            />
                        </Paper>
                    </Box>
                )}

                {/* Dialogs */}
                <Dialog open={openRoundDialog} onClose={() => setOpenRoundDialog(false)}>
                    <DialogTitle>Add New Round</DialogTitle>
                    <DialogContent>
                        <TextField autoFocus margin="dense" label="Round Name (e.g., Round 1)" type="text" fullWidth variant="standard"
                            value={newRoundName} onChange={(e) => setNewRoundName(e.target.value)} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenRoundDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateRound} variant="contained">Create</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
}
