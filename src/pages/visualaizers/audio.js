import React, { useState } from 'react';
import { LiveAudioVisualizer } from 'react-audio-visualize';

const MyAudioVisualaizer = () => {
    const [mediaRecorder, setMediaRecorder] = useState(null);

    // Function to set media recorder
    const startRecording = async () => {
        try {
            // Get user's audio stream from the microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create a MediaRecorder object using the audio stream
            const recorder = new MediaRecorder(stream);

            // Set the mediaRecorder state
            setMediaRecorder(recorder);

            // Start recording
            recorder.start();
        } catch (error) {
            // Handle errors
            console.error('Error accessing microphone:', error);
        }
    };

    // Assuming you have a function to stop recording
    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
    };

    return (
        <div>

            <div
                style={{
                    borderRadius: '8px',
                    border: '2px solid black', // Example border style (change as needed)
                    width: '300px',
                    height: '50px'
                }}

            >
                {mediaRecorder && (
                    <LiveAudioVisualizer
                        mediaRecorder={mediaRecorder}
                        width={60}
                        height={75}
                    />
                )}
            </div>
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={stopRecording}>Stop Recording</button>
        </div>
    );
};

export default MyAudioVisualaizer;
