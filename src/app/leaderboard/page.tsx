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
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, CartesianGrid, Tooltip } from 'recharts';


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

// Removed TeamStockChart as we now plot all lines on a single chart.

export default function LeaderboardDisplay() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const [leaderboardRes, historyRes] = await Promise.all([
                axios.get('https://inkspire-server.onrender.com/api/leaderboard'),
                axios.get('https://inkspire-server.onrender.com/api/leaderboard/history')
            ]);
            setLeaderboard(leaderboardRes.data);

            // Always add a starting zero-point so lines come from the bottom
            const zeroPoint: any = { time: 'Start' };
            leaderboardRes.data.forEach((t: any) => zeroPoint[t.name] = 0);

            const fetchedHistory = historyRes.data;
            setHistory([zeroPoint, ...fetchedHistory]);

        } catch (error) {
            console.error("Failed to fetch leaderboard or history", error);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        const intervalId = setInterval(fetchLeaderboard, 3000);
        return () => clearInterval(intervalId);
    }, []);

    // Determine the max score to scale the bars properly.
    const maxScore = Math.max(10, ...leaderboard.map(t => t.totalScore));

    // Custom Dot component to render logos at the very end and scores at every peak
    const CustomizedDot = (props: any) => {
        const { cx, cy, index, dataKey, payload, value } = props;

        // Skip "Start" point
        if (payload.time === 'Start') return null;

        const teamName = dataKey; // The dataKey is the team's name
        const config = TEAM_CONFIG[teamName as string] || { color: '#38bdf8', logo: '⭐' };

        const isLastPoint = index === history.length - 1;

        return (
            <svg x={cx - 20} y={cy - 20} width={40} height={40} style={{ overflow: 'visible' }}>
                <defs>
                    <filter id={`shadow-${teamName.replace(/\s+/g, '')}`}>
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5" />
                    </filter>
                </defs>

                {/* Score value peak marker */}
                <circle cx="20" cy="20" r="4" fill={config.color} stroke="#e3dccf" strokeWidth={2} />
                <text
                    x="20"
                    y={isLastPoint ? "-15" : "-5"} // Push higher if logo is there
                    textAnchor="middle"
                    fill={config.color}
                    fontSize="18px"
                    fontWeight="bold"
                    stroke="#e3dccf"
                    strokeWidth="3"
                    paintOrder="stroke"
                    style={{ filter: `url(#shadow-${teamName.replace(/\s+/g, '')})` }}
                >
                    {value}
                </text>

                {isLastPoint && (
                    <g transform="translate(0, 0)">
                        {typeof config.logo === 'string' ? (
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="28px" filter={`url(#shadow-${teamName.replace(/\s+/g, '')})`}>
                                {config.logo}
                            </text>
                        ) : (
                            <image href={(config.logo as any).src} width="40" height="40" filter={`url(#shadow-${teamName.replace(/\s+/g, '')})`} />
                        )}
                    </g>
                )}
            </svg>
        );
    };

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
                        mb: 2, // reduced margin to fit on one screen

                        zIndex: 10
                    }}
                >
                    SCOREBOARD
                </Typography>

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    maxWidth: 1600,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: 1,
                    position: 'relative',
                    zIndex: 5,
                    gap: 2 // Reduced gap to keep tightly packed on 1 screen
                }}>
                    {/* The Single Stock Market Line Chart */}
                    <Box sx={{ width: '100%', height: '50vh', position: 'relative', mt: 2 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history} margin={{ top: 20, right: 60, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.15)" />
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: '#4e342e', fontWeight: 'bold' }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#4e342e', strokeWidth: 2 }}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fill: '#4e342e', fontWeight: 'bold' }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickCount={6} // Helps ensure regular intervals like 0, 10, 20
                                    allowDecimals={false}
                                />
                                { /* Add a defs block for the glow filter */}
                                <defs>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="5" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                {leaderboard.map((team, index) => {
                                    const config = TEAM_CONFIG[team.name] || { color: '#38bdf8' };
                                    const isLeader = index === 0; // The leaderboard array is already sorted by score

                                    return (
                                        <Line
                                            key={team._id}
                                            type="linear" // Straight lines instead of curved
                                            dataKey={team.name}
                                            stroke={config.color}
                                            strokeWidth={isLeader ? 6 : 4} // Make leader's line thicker
                                            dot={<CustomizedDot />}
                                            isAnimationActive={false}
                                            style={isLeader ? { filter: 'url(#glow)' } : {}} // Add glow to leader
                                        />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>

                    {/* Team Logos and Scores (Legend) */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-end', // Align bottom baseline
                        gap: { xs: 2, md: 8 },
                        width: '100%',
                        borderTop: '4px solid rgba(0, 0, 0, 0.2)', // Darker border for light mode
                        pt: 2 // Decreased top padding
                    }}>
                        {leaderboard.map((team) => {
                            const config = TEAM_CONFIG[team.name] || { color: '#38bdf8', logo: '⭐' };

                            return (
                                <Box key={team._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                                    {/* Logo */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100px', marginBottom: '16px', zIndex: 10 }}
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

                                    {/* Score BELOW the logo */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
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
