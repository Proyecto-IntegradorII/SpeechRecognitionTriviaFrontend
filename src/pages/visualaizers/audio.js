import React, { useState, useEffect } from 'react';
import { LiveAudioVisualizer } from 'react-audio-visualize';

const MyAudioVisualaizer = () => {
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [recording, setRecording] = useState(false);

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

            // Listen for dataavailable event
            recorder.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0) {
                    setAudioBlob(event.data);
                }
            });

            setRecording(true);
        } catch (error) {
            // Handle errors
            console.error('Error accessing microphone:', error);
        }
    };

    // Function to stop recording and initiate download
    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
        setRecording(false);
    };

    // Function to download audio
    const downloadAudio = () => {
        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'recorded_audio.wav'; // Change the filename as needed
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);
            setAudioBlob(null); // Reset audioBlob state after downloading
        }
    };

    // Function to upload audio
const uploadAudio = async () => {
    try {
        if (audioBlob) {
            // Create form data
            const formData = new FormData();
            formData.append('file', audioBlob);

            // Make POST request to your backend
            const response = await fetch('https://speech-recognition-trivia-backend.vercel.app/upload', {
                method: 'POST',
                body: formData,
            });

            // Parse response as JSON
            const data = await response.json();

            // Log downloadLink to the console
            console.log('Download Link:', data);

            // Make POST request to your backend
            const transcriptResponse = await fetch('https://pybackoci-latest.onrender.com/transcribe_file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "file_url": data
                })
            });
            
            // Parse response as JSON
            const transcriptResponseEnded = await transcriptResponse.json();

            console.log("transcript respond to audio: ",transcriptResponseEnded)
            var element = document.getElementById("input");
            element.value = transcriptResponseEnded[1];
        }
    } catch (error) {
        console.error('Error uploading audio:', error);
    }
};


    useEffect(() => {
        if (audioBlob) {
            uploadAudio();
        }
    }, [audioBlob]);

    return (
        <>
            <button id="microphone" className="btn btn-square" type="submit" style={{ border: 'none' }} onClick={recording ? stopRecording : startRecording}>
                {recording ? (
                    <svg width="30px" height="30px" viewBox="0 0 24 24">
                        <rect width="24" height="24" fill="none" />
                        <path d="M11 2h2v12h-2z" />
                        <path d="M7 12V6h10v6l4-4v10l-4-4v6H7v-6z" />
                    </svg>
                ) : (
                    <svg width="30px" height="30px" viewBox="-7.2 0 30 30" id="_19_-_Microphone" data-name="19 - Microphone" xmlns="http://www.w3.org/2000/svg">
                        <path id="Path_254" data-name="Path 254" d="M21.182,4a3,3,0,0,0-3-3H13.818a3,3,0,0,0-3,3V22.038a3,3,0,0,0,3,3h4.364a3,3,0,0,0,3-3Zm-2,0V22.038a1,1,0,0,1-1,1H13.818a1,1,0,0,1-1-1V4a1,1,0,0,1,1-1h4.364a1,1,0,0,1,1,1Z" transform="translate(-8.2 -1)" fillRule="evenodd" />
                        <path id="Path_255" data-name="Path 255" d="M8.2,17.186V21.7a5.779,5.779,0,0,0,5.533,5.992h4.534A5.779,5.779,0,0,0,23.8,21.7V17.186a1,1,0,0,0-2,0V21.7a3.781,3.781,0,0,1-3.533,3.992H13.733A3.781,3.781,0,0,1,10.2,21.7V17.186a1,1,0,0,0-2,0Z" transform="translate(-8.2 -1)" fillRule="evenodd" />
                        <path id="Path_256" data-name="Path 256" d="M20.182,29H11.818a1,1,0,1,0,0,2h8.364a1,1,0,0,0,0-2Z" transform="translate(-8.2 -1)" fillRule="evenodd" />
                        <path id="Path_257" data-name="Path 257" d="M15,26.691V30a1,1,0,0,0,2,0V26.691a1,1,0,0,0-2,0Z" transform="translate(-8.2 -1)" fillRule="evenodd" />
                    </svg>
                )}
            </button>
        </>
    );
};

export default MyAudioVisualaizer;