import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProgressContext = createContext();

const STORAGE_KEY = '@user_progress';

// Initial state structure
const initialProgress = {
    user: {
        level: 1,
        totalXP: 0,
        creationStreak: 0,
        lastActiveDate: null,
        joinedDate: new Date().toISOString(),
    },
    instruments: {
        piano: { level: 1, xp: 0, songsCreated: 0, practiceMinutes: 0, achievements: [] },
        drums: { level: 1, xp: 0, patternsMade: 0, practiceMinutes: 0, achievements: [] },
        guitar: { level: 1, xp: 0, songsCreated: 0, practiceMinutes: 0, achievements: [] },
        bass: { level: 1, xp: 0, songsCreated: 0, practiceMinutes: 0, achievements: [] },
        synth: { level: 1, xp: 0, songsCreated: 0, practiceMinutes: 0, achievements: [] },
        violin: { level: 1, xp: 0, songsCreated: 0, practiceMinutes: 0, achievements: [] },
        flute: { level: 1, xp: 0, songsCreated: 0, practiceMinutes: 0, achievements: [] },
        trumpet: { level: 1, xp: 0, songsCreated: 0, practiceMinutes: 0, achievements: [] },
        saxophone: { level: 1, xp: 0, songsCreated: 0, practiceMinutes: 0, achievements: [] },
        world: { level: 1, xp: 0, songsCreated: 0, practiceMinutes: 0, achievements: [] },
        tabla: { level: 1, xp: 0, songsCreated: 0, practiceMinutes: 0, achievements: [] },
    },
    dailyChallenges: {
        current: null,
        completed: [],
        lastGenerated: null,
    },
    achievements: [],
    stats: {
        totalSongsCreated: 0,
        totalRecordingTime: 0,
        totalPracticeTime: 0,
        favoriteInstrument: null,
    },
};

// XP required for each level (exponential growth)
const getXPForLevel = (level) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Calculate level from XP
const calculateLevel = (xp) => {
    let level = 1;
    let totalXPNeeded = 0;

    while (totalXPNeeded <= xp) {
        totalXPNeeded += getXPForLevel(level);
        if (totalXPNeeded <= xp) level++;
    }

    return level;
};

export function UserProgressProvider({ children }) {
    const [progress, setProgress] = useState(initialProgress);
    const [loading, setLoading] = useState(true);

    // Load progress from storage
    useEffect(() => {
        loadProgress();
    }, []);

    // Save progress to storage whenever it changes
    useEffect(() => {
        if (!loading) {
            saveProgress();
        }
    }, [progress]);

    const loadProgress = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setProgress(parsed);
            }
        } catch (error) {
            console.error('Failed to load user progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveProgress = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (error) {
            console.error('Failed to save user progress:', error);
        }
    };

    // Add XP to an instrument
    const addInstrumentXP = (instrument, amount) => {
        setProgress(prev => {
            const currentInstrument = prev.instruments[instrument];
            const newXP = currentInstrument.xp + amount;
            const newLevel = calculateLevel(newXP);

            // Check if leveled up
            const leveledUp = newLevel > currentInstrument.level;

            return {
                ...prev,
                user: {
                    ...prev.user,
                    totalXP: prev.user.totalXP + amount,
                },
                instruments: {
                    ...prev.instruments,
                    [instrument]: {
                        ...currentInstrument,
                        xp: newXP,
                        level: newLevel,
                    },
                },
            };
        });
    };

    // Update creation streak
    const updateStreak = () => {
        const today = new Date().toDateString();
        const lastActive = progress.user.lastActiveDate
            ? new Date(progress.user.lastActiveDate).toDateString()
            : null;

        if (today === lastActive) {
            // Already updated today
            return progress.user.creationStreak;
        }

        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const isConsecutive = lastActive === yesterday;

        const newStreak = isConsecutive ? progress.user.creationStreak + 1 : 1;

        setProgress(prev => ({
            ...prev,
            user: {
                ...prev.user,
                creationStreak: newStreak,
                lastActiveDate: new Date().toISOString(),
            },
        }));

        return newStreak;
    };

    // Record a song creation
    const recordSongCreation = (instrument) => {
        const streak = updateStreak();

        setProgress(prev => ({
            ...prev,
            instruments: {
                ...prev.instruments,
                [instrument]: {
                    ...prev.instruments[instrument],
                    songsCreated: prev.instruments[instrument].songsCreated + 1,
                },
            },
            stats: {
                ...prev.stats,
                totalSongsCreated: prev.stats.totalSongsCreated + 1,
            },
        }));

        // Award XP for creation
        addInstrumentXP(instrument, 50);

        // Check for achievements
        checkAchievements();

        return streak;
    };

    // Record practice time
    const recordPracticeTime = (instrument, minutes) => {
        setProgress(prev => ({
            ...prev,
            instruments: {
                ...prev.instruments,
                [instrument]: {
                    ...prev.instruments[instrument],
                    practiceMinutes: prev.instruments[instrument].practiceMinutes + minutes,
                },
            },
            stats: {
                ...prev.stats,
                totalPracticeTime: prev.stats.totalPracticeTime + minutes,
            },
        }));

        // Award XP for practice (10 XP per minute)
        addInstrumentXP(instrument, minutes * 10);
    };

    // Unlock achievement
    const unlockAchievement = (achievementId) => {
        if (progress.achievements.some(a => a.id === achievementId)) {
            return false; // Already unlocked
        }

        setProgress(prev => ({
            ...prev,
            achievements: [
                ...prev.achievements,
                {
                    id: achievementId,
                    unlockedAt: new Date().toISOString(),
                },
            ],
        }));

        return true;
    };

    // Check for achievement unlocks
    const checkAchievements = () => {
        const { stats, user, instruments } = progress;

        // First song
        if (stats.totalSongsCreated === 1) {
            unlockAchievement('first-song');
        }

        // 10 songs
        if (stats.totalSongsCreated === 10) {
            unlockAchievement('10-songs');
        }

        // 50 songs
        if (stats.totalSongsCreated === 50) {
            unlockAchievement('50-songs');
        }

        // Streak achievements
        if (user.creationStreak === 3) {
            unlockAchievement('3-day-streak');
        }

        if (user.creationStreak === 7) {
            unlockAchievement('week-streak');
        }

        if (user.creationStreak === 30) {
            unlockAchievement('month-streak');
        }

        // Instrument mastery
        Object.entries(instruments).forEach(([name, data]) => {
            if (data.level === 10) {
                unlockAchievement(`${name}-master`);
            }
        });
    };

    // Get XP progress for current level
    const getXPProgress = (instrument) => {
        const instrumentData = progress.instruments[instrument];
        const currentLevel = instrumentData.level;
        const currentXP = instrumentData.xp;

        // Calculate XP needed for current level
        let xpForCurrentLevel = 0;
        for (let i = 1; i < currentLevel; i++) {
            xpForCurrentLevel += getXPForLevel(i);
        }

        const xpIntoCurrentLevel = currentXP - xpForCurrentLevel;
        const xpNeededForNextLevel = getXPForLevel(currentLevel);

        return {
            current: xpIntoCurrentLevel,
            needed: xpNeededForNextLevel,
            percentage: (xpIntoCurrentLevel / xpNeededForNextLevel) * 100,
        };
    };

    const value = {
        progress,
        loading,
        addInstrumentXP,
        updateStreak,
        recordSongCreation,
        recordPracticeTime,
        unlockAchievement,
        getXPProgress,
        checkAchievements,
    };

    return (
        <UserProgressContext.Provider value={value}>
            {children}
        </UserProgressContext.Provider>
    );
}

export function useUserProgress() {
    const context = useContext(UserProgressContext);
    if (!context) {
        throw new Error('useUserProgress must be used within UserProgressProvider');
    }
    return context;
}
