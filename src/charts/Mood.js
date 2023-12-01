import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import HeatMap from 'react-heatmap-grid';

// Function to process session data and count moods
function processSessionData(sessions) {
    return Object.values(sessions).map(session => {
        const moodCounts = Object.values(session.attendants || {}).reduce((counts, attendant) => {
            const mood = attendant.mood || 'unknown';
            counts[mood] = (counts[mood] || 0) + 1;
            return counts;
        }, {});

        return moodCounts;
    });
}

// Function to format data for the heatmap
function formatDataForHeatmap(moodCountsPerSession, sessionNames) {
    const xLabels = sessionNames;
    const yLabels = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'unknown'];

    const data = yLabels.map(yLabel =>
        moodCountsPerSession.map(moodCounts => moodCounts[yLabel] || 0)
    );

    return { xLabels, yLabels, data };
}

function MoodHeatmap() {
    const [heatmapData, setHeatmapData] = useState({ xLabels: [], yLabels: [], data: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const db = getDatabase();
                const sessionsRef = ref(db, 'sessions/');

                onValue(sessionsRef, (snapshot) => {
                    const sessionsData = snapshot.val();
                    const sessionNames = Object.keys(sessionsData);

                    const moodCountsPerSession = processSessionData(sessionsData);
                    const formattedData = formatDataForHeatmap(moodCountsPerSession, sessionNames);

                    setHeatmapData(formattedData);
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h2>Mood Heatmap</h2>
            <HeatMap
                xLabels={heatmapData.xLabels}
                yLabels={heatmapData.yLabels}
                data={heatmapData.data}
                squares
                height={25}
                cellStyle={(background, value, min, max, data, x, y) => ({
                    background: `rgba(255, 99, 132, ${1 - (max - value) / (max - min)})`,
                    fontSize: '11px',
                    color: '#333',
                })}
                cellRender={value => value && <div>{value}</div>}
            />
        </div>
    );
}

export default MoodHeatmap;
