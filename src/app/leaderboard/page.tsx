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
import { BarChart, Bar, ResponsiveContainer, YAxis, XAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import Confetti from 'react-confetti';

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
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

            const fetchedHistory = historyRes.data;
            setHistory(fetchedHistory);

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
    const highestScore = Math.max(0, ...leaderboard.map(t => t.totalScore));
    const hasWinner = leaderboard.some(t => t.isWinner);

    return (
        <ThemeProvider theme={posterTheme}>
            {hasWinner && windowSize.width > 0 && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    numberOfPieces={500}
                    gravity={0.15}
                    style={{ zIndex: 9999, position: 'fixed' }}
                />
            )}
            <style>{`
                .leader-line {
                    animation: blinkLine 1s infinite alternate !important;
                }
                @keyframes blinkLine {
                    0% { opacity: 1; }
                    100% { opacity: 0.2; }
                }
                @keyframes zoomIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
            <Box sx={{
                minHeight: '100vh',
                backgroundColor: '#e3dccf', // Slightly darker beige
                backgroundImage: `
                    linear-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                color: 'text.primary',
                p: { xs: 2, md: 3 },
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

                {!hasWinner ? (
                    <>
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
                            {/* The Main Graph - Grouped Bar Chart */}
                            <Box sx={{ width: '100%', height: '60vh', position: 'relative', mt: 7 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={history} margin={{ top: 30, right: 20, left: 0, bottom: 5 }} barGap={4} barSize={20}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.15)" />
                                        <XAxis
                                            dataKey="time"
                                            tick={{ fill: '#4e342e', fontWeight: 'bold', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={{ stroke: '#4e342e', strokeWidth: 2 }}
                                            dy={10}
                                            interval={0}
                                        />
                                        <YAxis
                                            tick={{ fill: '#4e342e', fontWeight: 'bold' }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickCount={6} // Helps ensure regular intervals like 0, 10, 20
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                            contentStyle={{ backgroundColor: '#f4ecd8', borderRadius: '8px', border: '1px solid #4e342e' }}
                                            itemStyle={{ fontWeight: 'bold' }}
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
                                            const isLeader = team.totalScore === highestScore && highestScore > 0;

                                            return (
                                                <Bar
                                                    key={team._id}
                                                    className={isLeader ? "leader-line" : ""}
                                                    dataKey={team.name}
                                                    fill={config.color}
                                                    radius={[4, 4, 0, 0]}
                                                    isAnimationActive={true}
                                                    style={isLeader ? { filter: 'url(#glow)' } : {}} // Add glow to leader
                                                >
                                                    <LabelList
                                                        dataKey={team.name}
                                                        position="top"
                                                        fill={config.color}
                                                        fontWeight="bold"
                                                        fontSize={14}
                                                        style={{ textShadow: '0px 1px 2px white' }}
                                                        formatter={(val: any) => val > 0 ? val : ''}
                                                    />
                                                </Bar>
                                            );
                                        })}
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>

                            {/* Team Logos, Scores, and Dynamic Bars */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                gap: { xs: 2, md: 8 },
                                width: '100%',
                                height: '30vh', // Fixed height to allow dynamic bars to grow within
                                borderTop: '4px solid rgba(0, 0, 0, 0.2)', // Darker border for light mode
                                pt: 2,
                                pb: 2
                            }}>
                                {leaderboard.map((team, index) => {
                                    const config = TEAM_CONFIG[team.name] || { color: '#38bdf8', logo: '⭐' };
                                    const isLeader = team.totalScore === highestScore && highestScore > 0;
                                    // Calculate proportional height for the bar (max 100%)
                                    const normalizedHeight = maxScore > 0 ? (team.totalScore / maxScore) * 100 : 0;
                                    const barHeight = `${Math.max(5, normalizedHeight)}%`;

                                    return (
                                        <Box key={team._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%', height: '100%', justifyContent: 'flex-end' }}>

                                            {/* Score and Logo (sits immediately on top of the growing bar) */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, mb: 1 }}>

                                                {/* {typeof config.logo === 'string' ? (
                                                    <Typography variant="h1" className={isLeader ? "leader-line" : ""} sx={{ fontSize: '3rem', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.8))' }}>
                                                        {config.logo}
                                                    </Typography>
                                                ) : (
                                                    <Image
                                                        src={config.logo}
                                                        className={isLeader ? "leader-line" : ""}
                                                        alt={`${team.name} logo`}
                                                        width={60}
                                                        height={60}
                                                        style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.8))' }}
                                                    />
                                                )} */}
                                                {team.isWinner && (
                                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffea00', textShadow: '0 0 10px #ffb300, 0 0 20px #ffb300', mt: 1, letterSpacing: 2, animation: 'blinkLine 0.8s infinite alternate' }}>
                                                        WINNER
                                                    </Typography>
                                                )}
                                                {/* <Typography variant="h3" sx={{ fontWeight: 'bold', color: config.color, textShadow: '0 2px 5px rgba(0,0,0,0.1)', mt: team.isWinner ? 0 : 0 }}>
                                                    {team.totalScore}
                                                </Typography> */}
                                            </Box>

                                            {/* The Dynamic Background Bar */}
                                            {/* <motion.div
                                        initial={{ height: '0%' }}
                                        animate={{ height: barHeight }}
                                        transition={{ type: 'spring', stiffness: 40, damping: 12 }}
                                        style={{
                                            width: '60%',
                                            maxWidth: '90px',
                                            backgroundColor: config.color,
                                            borderRadius: '8px 8px 0 0',
                                            boxShadow: isLeader ? `0 0 15px ${config.color}, inset 0 0 10px rgba(255,255,255,0.4)` : 'inset 0 0 5px rgba(255,255,255,0.3)',
                                            minHeight: '10px'
                                        }}
                                    /> */}

                                            {/* Team Name properly positioned at the very bottom */}
                                            {/* <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', color: 'text.primary', letterSpacing: '1px', textTransform: 'uppercase', mt: 1, lineHeight: 1.2, whiteSpace: 'pre-line' }}>
                                                {team.name.replace(" ", "\n")}
                                            </Typography> */}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, width: '100%', zIndex: 50 }}>
                        {leaderboard.filter(t => t.isWinner).map(team => {
                            const config = TEAM_CONFIG[team.name] || { color: '#38bdf8', logo: '⭐' };
                            return (
                                <Box key={team._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'zoomIn 0.8s ease-out' }}>
                                    <Typography variant="h1" sx={{ fontWeight: 'bold', color: '#ffea00', textShadow: '0 0 20px #ffb300, 0 0 40px #ffb300', mb: 4, fontSize: { xs: '3rem', md: '6rem' }, letterSpacing: 4, animation: 'blinkLine 0.8s infinite alternate' }}>
                                        WINNER
                                    </Typography>
                                    {typeof config.logo === 'string' ? (
                                        <Typography variant="h1" sx={{ fontSize: '15rem', filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.8))' }}>
                                            {config.logo}
                                        </Typography>
                                    ) : (
                                        <Image
                                            src={config.logo}
                                            alt={`${team.name} logo`}
                                            width={300}
                                            height={300}
                                            style={{ filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.8))' }}
                                        />
                                    )}
                                    <Typography variant="h2" align="center" sx={{ fontWeight: 'bold', color: 'text.primary', letterSpacing: '4px', textTransform: 'uppercase', mt: 4, mb: 2, fontSize: { xs: '2rem', md: '5rem' } }}>
                                        {team.name}
                                    </Typography>
                                    <Typography variant="h1" sx={{ fontWeight: 'bold', color: config.color, textShadow: '0 5px 15px rgba(0,0,0,0.2)', fontSize: { xs: '4rem', md: '8rem' } }}>
                                        {team.totalScore}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>
        </ThemeProvider>
    );
}
