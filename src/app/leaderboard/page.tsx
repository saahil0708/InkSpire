"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

import RR from '../../Images/rr.png';
import WN from '../../Images/wn.png';
import BV from '../../Images/bv.png';
import GG from '../../Images/GG.png';
import SvietLogo from '../../Images/Sviet.png';
import InkSpire from '../../Images/InkSpire_logo.png';
import Image, { StaticImageData } from 'next/image';
import axios from 'axios';


const posterTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#4e342e' },
        background: { default: '#e3dccf', paper: '#f4ecd8' }, // Darker, less flashy beige
        text: { primary: '#3e2723', secondary: '#5d4037' }
    },
    typography: { fontFamily: '"Azonix", "Poppins", sans-serif' },
});

// Hardcoded team colors and fallback logos
const TEAM_CONFIG: Record<string, { color: string, logo: StaticImageData | string }> = {
    "Red Romans": { color: "#d32f2f", logo: RR },
    "White Napoleans": { color: "#9e9e9e", logo: WN }, // Grey instead of white for contrast
    "Blue Victorians": { color: "#1976d2", logo: BV },
    "Green Gladiators": { color: "#388e3c", logo: GG }
};

export default function LeaderboardDisplay() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get('https://inkspire-server.onrender.com/api/leaderboard');
            setLeaderboard(res.data);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        const intervalId = setInterval(fetchLeaderboard, 3000);
        return () => clearInterval(intervalId);
    }, []);

    // Determine the max score to scale the bars properly.
    const maxScore = Math.max(100, ...leaderboard.map(t => t.totalScore));

    return (
        <ThemeProvider theme={posterTheme}>
            <Box sx={{
                minHeight: '100vh',
                backgroundColor: '#e3dccf', // Slightly darker beige
                backgroundImage: `
                    linear-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                color: 'text.primary',
                p: { xs: 2, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Top-Left Logos Section */}
                <Box sx={{
                    position: 'absolute',
                    top: { xs: 16, md: 32 },
                    left: { xs: 16, md: 32 },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    zIndex: 20
                }}>
                    <Image
                        src={SvietLogo}
                        alt="SVIET Logo"
                        height={60}
                        style={{ objectFit: 'contain' }}
                    />
                    <Box sx={{ height: 40, width: '2px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 1 }} />
                    <Image
                        src={InkSpire}
                        alt="InkSpire Logo"
                        height={60}
                        style={{
                            objectFit: 'contain'
                        }}
                    />
                </Box>

                {/* Top-Right Date/Time Section */}
                <Box sx={{
                    position: 'absolute',
                    top: { xs: 16, md: 32 },
                    right: { xs: 16, md: 32 },
                    zIndex: 20,
                    textAlign: 'right'
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4e342e', mb: 0.5, textTransform: 'uppercase' }}>
                        {currentTime ? currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                        {currentTime ? currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                    </Typography>
                </Box>

                <Typography
                    variant="h2"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                        color: '#4e342e', // Match poster text
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        mb: 8,
                        mt: 2,
                        zIndex: 10
                    }}
                >
                    SCOREBOARD
                </Typography>

                <Box sx={{
                    display: 'flex',
                    width: '100%',
                    maxWidth: 1600,
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    flexGrow: 1,
                    position: 'relative',
                    zIndex: 5
                }}>
                    {/* Centered Bar Chart Container */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        gap: { xs: 4, md: 8 },
                        height: '70vh',
                        width: '100%',
                        borderBottom: '4px solid rgba(0, 0, 0, 0.2)', // Darker border for light mode
                        pb: 2
                    }}>
                        {leaderboard.map((team) => {
                            const config = TEAM_CONFIG[team.name] || { color: '#38bdf8', logo: '⭐' };
                            const heightPercentage = Math.max(5, (team.totalScore / maxScore) * 100);

                            return (
                                <Box key={team._id} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', width: '20%', height: '100%' }}>

                                    {/* Logo ABOVE the bar */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px', zIndex: 10 }}
                                    >
                                        {typeof config.logo === 'string' ? (
                                            <Typography variant="h1" sx={{ fontSize: '5rem', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.8))' }}>
                                                {config.logo}
                                            </Typography>
                                        ) : (
                                            <Image
                                                src={config.logo}
                                                alt={`${team.name} logo`}
                                                width={80}
                                                height={80}
                                                style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.8))' }}
                                            />
                                        )}
                                    </motion.div>

                                    {/* The Animated Bar */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercentage}%` }}
                                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                                        style={{
                                            width: '100%',
                                            backgroundColor: config.color,
                                            borderRadius: '8px 8px 0 0',
                                            boxShadow: `0 8px 30px ${config.color}40, inset 0 0 15px rgba(255,255,255,0.4)`,
                                            backgroundImage: 'linear-gradient(to top, rgba(255,255,255,0.1), rgba(255,255,255,0.6))', // Lighter gradient effect
                                            zIndex: 5
                                        }}
                                    />

                                    {/* Score BELOW the bar */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}
                                    >
                                        <Typography variant="h2" sx={{ fontWeight: 'bold', color: config.color, mb: 1, textShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                            {team.totalScore}
                                        </Typography>
                                        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', color: 'text.primary', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '20px' }}>
                                            {team.name.replace(" ", "\n")}
                                        </Typography>
                                    </motion.div>

                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
