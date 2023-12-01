import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Line } from 'react-chartjs-2';

function processSessionData(sessions) {
    const moodCountsPerSession = [];

    Object.values(sessions).forEach(session => {
        const moodCounts = {};
        Object.values(session.attendants || {}).forEach(attendant => {
            const mood = attendant.mood || 'unknown';
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
        moodCountsPerSession.push(moodCounts);
    });

    return moodCountsPerSession;
}

function getUniqueMoods(moodCountsPerSession) {
    const uniqueMoods = new Set();
    moodCountsPerSession.forEach(moodCounts => {
        Object.keys(moodCounts).forEach(mood => {
            uniqueMoods.add(mood);
        });
    });
    return Array.from(uniqueMoods);
}

function formatDataForLineChart(moodCountsPerSession, sessionNames) {
    const uniqueMoods = getUniqueMoods(moodCountsPerSession);

    const datasets = uniqueMoods.map(mood => ({
        label: mood,
        data: moodCountsPerSession.map(moodCounts => moodCounts[mood] || 0),
    }));

    const labels = sessionNames;

    return { labels, datasets };
}

function MoodLineChart() {
    const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
    const [sessions, setSessions] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const db = getDatabase();
                const sessionsRef = ref(db, 'sessions/');

                onValue(sessionsRef, (snapshot) => {
                    const sessionsData = snapshot.val();
                    setSessions(sessionsData);

                    const sessionNames = Object.keys(sessionsData || {});
                    const moodCountsPerSession = processSessionData(sessionsData);

                    const formattedData = formatDataForLineChart(moodCountsPerSession, sessionNames);

                    setLineChartData(formattedData);
                    console.log('moodCountsPerSession', moodCountsPerSession);
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []); // Fetch data whenever the component mounts

    return (
        <div>
            <h2>Mood Trends</h2>
            <Line data={lineChartData} />
        </div>
    );
}

export default MoodLineChart;
