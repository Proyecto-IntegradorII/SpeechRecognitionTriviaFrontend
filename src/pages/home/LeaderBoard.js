import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('https://speech-recognition-trivia-backend.vercel.app/getscores');
        setLeaderboardData(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
      <div className="overflow-hidden rounded-lg shadow-md">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-400 px-4 py-2">Rank</th>
              <th className="border border-gray-400 px-4 py-2">Name</th>
              <th className="border border-gray-400 px-4 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((player, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="border border-gray-400 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-400 px-4 py-2">{player.name}</td>
                <td className="border border-gray-400 px-4 py-2">{player.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
