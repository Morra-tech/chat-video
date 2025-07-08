import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, MessageSquare } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #312e81, #6b21a8, #db2777);
  padding: 1.5rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 400px;
  color: white;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const GradientCircle = styled.div`
  width: 4rem;
  height: 4rem;
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  text-align: center;
`;

const Subtitle = styled.p`
  text-align: center;
  opacity: 0.7;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;
  outline: none;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: linear-gradient(to right, #2563eb, #7c3aed);
  color: white;
  font-weight: 600;
  transition: 0.2s;
  &:hover {
    filter: brightness(1.1);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function VideoCallApp() {
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [hasCamera, setHasCamera] = useState(false);
  const [hasError, setHasError] = useState('');
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const hasVideoInput = devices.some(device => device.kind === 'videoinput');
        setHasCamera(hasVideoInput);
      })
      .catch(err => {
        setHasError('Помилка доступу до пристроїв');
        console.error(err);
      });
  }, []);

  const getMediaStream = async (video = false, audio = false) => {
    try {
      const constraints = { video: video && hasCamera, audio };
      if (!constraints.video && !constraints.audio) throw new Error('Немає доступних пристроїв');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (err) {
      setHasError('Не вдалося отримати доступ до пристроїв');
      console.error(err);
      return null;
    }
  };

  const toggleVideo = async () => {
    if (!hasCamera) return setHasError('Камера недоступна');

    if (!isVideoOn) {
      const stream = await getMediaStream(true, false);
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0];
        if (localStreamRef.current) {
          localStreamRef.current.addTrack(videoTrack);
        } else {
          localStreamRef.current = new MediaStream([videoTrack]);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        setIsVideoOn(true);
      }
    } else {
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) videoTrack.stop();
        setIsVideoOn(false);
      }
    }
  };

  const toggleAudio = async () => {
    if (!isAudioOn) {
      const stream = await getMediaStream(false, true);
      if (stream) {
        const audioTrack = stream.getAudioTracks()[0];
        if (localStreamRef.current) {
          localStreamRef.current.addTrack(audioTrack);
        } else {
          localStreamRef.current = new MediaStream([audioTrack]);
        }
        setIsAudioOn(true);
      }
    } else {
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) audioTrack.stop();
        setIsAudioOn(false);
      }
    }
  };

  const joinRoom = () => {
    if (!userName.trim()) return;
    const id = roomId.trim() || Math.random().toString(36).substr(2, 9).toUpperCase();
    setRoomId(id);
    setIsInCall(true);
  };

  if (!isInCall) {
    return (
      <Container>
        <Card>
          <GradientCircle>
            <Video className="w-8 h-8 text-white" />
          </GradientCircle>
          <Title>VideoMeet</Title>
          <Subtitle>Безпечні відеозустрічі онлайн</Subtitle>
          {hasError && <p style={{ color: '#fca5a5', fontSize: '0.875rem', textAlign: 'center' }}>{hasError}</p>}
          <Input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="Введіть ваше ім'я"
          />
          <Input
            type="text"
            value={roomId}
            onChange={e => setRoomId(e.target.value.toUpperCase())}
            placeholder="ID кімнати (опціонально)"
          />
          <Button
            onClick={joinRoom}
            disabled={!userName.trim()}
          >
            {roomId ? 'Приєднатися до кімнати' : 'Створити нову кімнату'}
          </Button>
          {!hasCamera && (
            <Subtitle><VideoOff className="w-4 h-4" /> Камера недоступна</Subtitle>
          )}
        </Card>
      </Container>
    );
  }
  return (
    <Container>
      <Card style={{ textAlign: 'center' }}>
        <GradientCircle>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {userName.charAt(0).toUpperCase()}
          </span>
        </GradientCircle>
  
        <Title>{userName} (Ви)</Title>
        <Subtitle>Кімната: <b>{roomId}</b></Subtitle>
  
        {hasError && <p style={{ color: '#f87171', fontSize: '0.875rem' }}>{hasError}</p>}
  
        {isVideoOn && (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: '100%',
              borderRadius: '1rem',
              marginBottom: '1rem',
              border: '2px solid white'
            }}
          />
        )}
  
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          <Button onClick={toggleVideo}>
            {isVideoOn ? 'Вимкнути відео' : 'Увімкнути відео'}
          </Button>
          <Button onClick={toggleAudio}>
            {isAudioOn ? 'Вимкнути мікрофон' : 'Увімкнути мікрофон'}
          </Button>
        </div>
      </Card>
    </Container>
  );
}

export default VideoCallApp;
