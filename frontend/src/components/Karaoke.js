import React, { useState, useRef } from 'react';
import {
  Box, Typography, Paper, Button, Stack, Divider, Slider, Grid, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const KaraokeUploader = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [songFile, setSongFile] = useState(null);
  const [volume, setVolume] = useState(50);
  const [lyrics, setLyrics] = useState('');
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const dest = audioContext.createMediaStreamDestination();

        const micSource = audioContext.createMediaStreamSource(micStream);
        micSource.connect(dest);

        const audioElement = audioRef.current;
        const songSource = audioContext.createMediaElementSource(audioElement);

        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume / 100;

        songSource.connect(gainNode).connect(dest);
        songSource.connect(audioContext.destination);

        audioElement.play();

        const combinedStream = dest.stream;
        const recorder = new MediaRecorder(combinedStream);
        const chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          setRecordedBlob(blob);
          setAudioChunks([]);
          micStream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setAudioChunks(chunks);
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone error:", err);
        alert("Microphone access is required for recording.");
      }
    }
  };

  const fetchLyricsFromGenius = async (title) => {
    setLoadingLyrics(true);
    try {
      const response = await fetch(`http://localhost:5000/lyrics/${title}`);
      const text = await response.text();
      console.log("Raw response text:", text);
      const data = JSON.parse(text);
      if (data?.lyrics) {
        setLyrics(data.lyrics);
      } else {
        setLyrics("Lyrics not found. Please check the file name.");
      }
    } catch (error) {
      console.error("Lyrics fetch error:", error);
      setLyrics("Failed to fetch lyrics. Please try again.");
    } finally {
      setLoadingLyrics(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      setSongFile(URL.createObjectURL(file));
      setRecordedBlob(null);
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      fetchLyricsFromGenius(fileNameWithoutExtension);
    } else {
      alert("Please upload a valid MP3/audio file.");
    }
  };

  const handleVolumeChange = (e, newValue) => {
    setVolume(newValue);
    if (audioRef.current) {
      audioRef.current.volume = newValue / 100;
    }
  };

  return (
    <Box sx={{ px: 4, py: 6, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Button
        variant="outlined"
        onClick={() => navigate('/player')}
        sx={{ mb: 4, fontWeight: 600 }}
        color="secondary"
      >
        ← Back to Music Player
      </Button>

      <Typography
        variant="h3"
        fontWeight="800"
        gutterBottom
        sx={{
          background: 'linear-gradient(to right, #6a11cb, #2575fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'Poppins, sans-serif'
        }}
      >
        🎤 Karaoke Recorder
      </Typography>

      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        Upload a karaoke track, adjust volume, and start singing! Make sure your file name matches the song title for better lyric matching.
      </Typography>

      <Box sx={{ mt: 3 }}>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="upload-audio"
        />
        <label htmlFor="upload-audio">
          <Button
            variant="contained"
            component="span"
            size="large"
            sx={{
              background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
              fontWeight: 'bold',
              color: '#fff',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              '&:hover': {
                background: 'linear-gradient(to right, #ff4b2b, #ff416c)'
              }
            }}
          >
            Upload MP3 🎶
          </Button>

        </label>
      </Box>

      {songFile && (
        <Paper
          elevation={6}
          sx={{
            mt: 5,
            p: 4,
            borderRadius: 4,
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
          }}
        >

          <Typography variant="h6" gutterBottom color="text.primary">
            🎼 Now Playing
          </Typography>
          <audio ref={audioRef} src={songFile} controls style={{ width: '100%' }} />

          <Box sx={{ mt: 4 }}>
            <Typography gutterBottom>🎚 Background Music Volume</Typography>
            <Slider
              value={volume}
              min={0}
              max={100}
              step={1}
              onChange={handleVolumeChange}
              aria-labelledby="volume-slider"
              sx={{ width: '100%', maxWidth: 400 }}
            />
          </Box>

          <Divider sx={{ my: 4 }} />

          <Grid container spacing={3} justifyContent="center">
            <Grid item>
              <Button
                variant="contained"
                color={isRecording ? 'error' : 'primary'}
                onClick={toggleRecording}
                sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 3, fontWeight: 600 }}
              >
                {isRecording ? '🛑 Stop Singing' : '🎙 Start Singing'}
              </Button>
            </Grid>

            {recordedBlob && (
              <Grid item>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => {
                    const url = URL.createObjectURL(recordedBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `karaoke_recording.webm`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  sx={{ px: 3, py: 1.5, fontWeight: 600 }}
                >
                  ⬇️ Download Recording
                </Button>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" color="text.primary" gutterBottom>
            📜 Lyrics
          </Typography>
          {loadingLyrics ? (
            <CircularProgress />
          ) : (
            <Box
              sx={{
                maxHeight: 200, // reduced from 300
                overflowY: 'auto',
                p: 2,
                backgroundColor: '#1e1e1e',
                color: '#f8f8f2',
                borderRadius: 2,
                fontFamily: 'Fira Code, monospace',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                border: '1px solid #444',
                mt: 2,
              }}
            >
              {lyrics}
            </Box>

          )}



        </Paper>
      )}
    </Box>
  );
};

export default KaraokeUploader;
