import React, { useState, useEffect, useRef, useContext } from 'react';
import { SkipNext, SkipPrevious } from '@mui/icons-material';
import { Shuffle, Repeat } from '@mui/icons-material';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, IconButton,
  Slider, Stack, Divider, AppBar, Toolbar, Button
} from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MusicPlayer = () => {
  const { user, logout } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const audioRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await axios.get('/songs');
        setSongs(res.data);
      } catch (err) {
        setSongs([
          { title: 'Sample Song 1', file: 'sample1.mp3' },
          { title: 'Sample Song 2', file: 'sample2.mp3' }
        ]);
      }
    };
    fetchSongs();
  }, []);
  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSong]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setProgress((current / dur) * 100);
    setDuration(dur);
  };

  const handleSeek = (_, value) => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    audioRef.current.currentTime = (value / 100) * dur;
    setProgress(value);
  };

  const selectSong = (song) => {
    setCurrentSong(song);
  };

const handleEnded = () => {
  if (isRepeat) {
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  } else if (isShuffle) {
    playRandomSong();
  } else {
    playNext();
  }
};
const playRandomSong = () => {
  if (!songs.length) return;

  let randomIndex;
  let currentIndex = songs.findIndex(s => s.file === currentSong?.file);

  
  do {
    randomIndex = Math.floor(Math.random() * songs.length);
  } while (randomIndex === currentIndex && songs.length > 1);

  setCurrentSong(songs[randomIndex]);
};


  const playNext = () => {
  if (!songs.length) return;
  if (isShuffle) {
    playRandomSong();
    return;
  }

  const currentIndex = songs.findIndex((s) => s.file === currentSong?.file);
  const nextIndex = (currentIndex + 1) % songs.length;
  setCurrentSong(songs[nextIndex]);
};

  const playPrevious = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex((s) => s.file === currentSong?.file);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
  };


  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">
            🎵 BeatBliss
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button color="inherit" onClick={() => navigate('/karaoke')}>
              Go to Karaoke
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Stack direction="row" spacing={3} sx={{ mt: 4, px: 4 }}>
        <Paper
          elevation={3}
          sx={{
            width: '30%',
            maxHeight: '70vh',
            overflowY: 'auto',
            p: 2,
            borderRadius: 2,
            backgroundColor: '#fafafa',
          }}
        >

          <Typography variant="h6" gutterBottom>
            🎶 Songs List
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {songs.map((song, index) => (
              <ListItem button key={index} onClick={() => selectSong(song)}>
                <ListItemText
                  primary={song.title}
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                    }
                  }}
                />

              </ListItem>
            ))}
          </List>
        </Paper>

        <Box sx={{ flexGrow: 1 }}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3, mb: 4, background: '#f5f5f5' }}>
            <Typography variant="h5" color="text.primary" gutterBottom>
              Welcome, <strong>{user.username || 'Guest'}</strong> 👋
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
              Choose a track and sing your heart out!
            </Typography>
          </Paper>

          {currentSong ? (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Now Playing: {currentSong.title}
              </Typography>
              <audio
                ref={audioRef}
                src={`http://localhost:5000/uploads/songs/${currentSong.file}`}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                preload="metadata"
              />
              <Stack direction="row" alignItems="center" spacing={2} mt={2}>
                <IconButton onClick={playPrevious} color="default">
                  <SkipPrevious />
                </IconButton>

                <IconButton onClick={handlePlayPause} color="primary" size="large">
                  {isPlaying ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
                </IconButton>

                <IconButton onClick={playNext} color="default">
                  <SkipNext />
                </IconButton>

                <IconButton onClick={() => setIsShuffle(!isShuffle)} color={isShuffle ? 'secondary' : 'default'}>
                  <Shuffle />
                </IconButton>

                <IconButton onClick={() => setIsRepeat(!isRepeat)} color={isRepeat ? 'secondary' : 'default'}>
                  <Repeat />
                </IconButton>

                <Typography variant="body2" sx={{ width: 40, textAlign: 'center' }}>
                  {formatTime((progress / 100) * duration)}
                </Typography>

                <Slider
                  value={progress}
                  onChange={handleSeek}
                  sx={{ flexGrow: 1 }}
                  disabled={!currentSong}
                />

                <Typography variant="body2" sx={{ width: 40, textAlign: 'center' }}>
                  {formatTime(duration)}
                </Typography>
              </Stack>

            </Paper>
          ) : (<Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="h6" gutterBottom>
              No song selected
            </Typography>
            <Typography variant="body2">
              Select a song from the list to start playing.
            </Typography>
          </Paper>
          )}
        </Box>
      </Stack>
    </>
  );
};

export default MusicPlayer;
