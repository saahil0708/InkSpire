"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

import RR from '../../Images/rr.png';
import WN from '../../Images/wn.png';
import BV from '../../Images/bv.png';
import GG from '../../Images/GG.png';
import Image, { StaticImageData } from 'next/image';
import axios from 'axios';


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#9f804a' },
        background: { default: '#050a0f', paper: '#0a141e' }, // Much darker default background
    },
    typography: { fontFamily: '"Azonix", "Poppins", sans-serif' },
});

// Hardcoded team colors and fallback logos
const TEAM_CONFIG: Record<string, { color: string, logo: StaticImageData | string }> = {
    "Red Romans": { color: "#e53935", logo: RR },
    "White Napoleans": { color: "#f5f5f5", logo: WN },
    "Blue Victorians": { color: "#1e88e5", logo: BV },
    "Green Gladiators": { color: "#43a047", logo: GG }
};

export default function LeaderboardDisplay() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

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
        <ThemeProvider theme={darkTheme}>
            <Box sx={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #020810 0%, #061826 60%, #0a263b 100%)', // Much darker deep ocean gradient
                color: 'text.primary',
                p: { xs: 2, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Typography
                    variant="h2"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                        color: '#00e5ff',
                        textShadow: '0 0 20px rgba(0, 229, 255, 0.4), 0 0 40px rgba(0, 229, 255, 0.1)',
                        mb: 8,
                        mt: 2,
                        zIndex: 10
                    }}
                >
                    CLASH OF MINDS LEADERBOARD
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
                        height: '70vh', // Increased height to take up the space the line graph left
                        width: '100%',
                        borderBottom: '4px solid rgba(0, 229, 255, 0.4)',
                        pb: 2
                    }}>
                        {leaderboard.map((team) => {
                            const config = TEAM_CONFIG[team.name] || { color: '#00e5ff', logo: '⭐' };
                            const heightPercentage = Math.max(5, (team.totalScore / maxScore) * 100);

                            return (
                                <Box key={team._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>

                                    {/* Logo ABOVE the bar */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}
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
                                            boxShadow: `0 0 30px ${config.color}80, inset 0 0 15px rgba(255,255,255,0.2)`,
                                            backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(255,255,255,0.4))'
                                        }}
                                    />

                                    {/* Score BELOW the bar */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}
                                    >
                                        <Typography variant="h2" sx={{ fontWeight: 'bold', color: config.color, mb: 1, textShadow: '0 0 15px rgba(0,0,0,0.9)' }}>
                                            {team.totalScore}
                                        </Typography>
                                        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', color: 'rgba(255,255,255,0.8)', letterSpacing: '2px', textTransform: 'uppercase' }}>
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
