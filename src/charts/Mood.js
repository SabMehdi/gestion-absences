import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import HeatMap from 'react-heatmap-grid';

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

function formatDataForHeatmap(moodCountsPerSession,sessionNames) {
    const xLabels = sessionNames; // Use actual session names
    const yLabels = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'unknown'];

    const data = yLabels.map(yLabel => {
        return moodCountsPerSession.map(moodCounts => {
            return moodCounts[yLabel] || 0;
        });
    });

    return { xLabels, yLabels, data };
}

function MoodHeatmap() {
    const [heatmapData, setHeatmapData] = useState({ xLabels: [], yLabels: [], data: [] });

    useEffect(() => {
        const db = getDatabase();
        const sessionsRef = ref(db, 'sessions/');

        onValue(sessionsRef, (snapshot) => {
            const sessionsData = snapshot.val();
            const sessionNames = Object.keys(sessionsData);
        
            const moodCountsPerSession = processSessionData(sessionsData);
            const formattedData = formatDataForHeatmap(moodCountsPerSession, sessionNames);
        
            setHeatmapData(formattedData);
        });
    }, []);


    return (
        <div>
            <h2>Humeur</h2>
            <HeatMap
                xLabels={heatmapData.xLabels}
                yLabels={heatmapData.yLabels}
                data={heatmapData.data}
            />
        </div>
    );
}

export default MoodHeatmap;
