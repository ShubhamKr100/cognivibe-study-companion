
import React, { useEffect, useRef } from 'react';
import { SoundscapeType } from '../types';

interface SoundscapePlayerProps {
  type: SoundscapeType;
}

export const SoundscapePlayer: React.FC<SoundscapePlayerProps> = ({ type }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const brownNoiseNodeRef = useRef<ScriptProcessorNode | null>(null);
  const rainAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Rain Audio
  useEffect(() => {
    rainAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3');
    rainAudioRef.current.loop = true;
    rainAudioRef.current.volume = 0.4;
    return () => {
      rainAudioRef.current?.pause();
      rainAudioRef.current = null;
    };
  }, []);

  // Handle Type Switching
  useEffect(() => {
    const stopAll = () => {
      // Stop Rain
      if (rainAudioRef.current) {
        rainAudioRef.current.pause();
      }
      // Stop Brown Noise
      if (audioContextRef.current) {
        audioContextRef.current.suspend();
      }
    };

    stopAll();

    if (type === SoundscapeType.RAIN) {
      rainAudioRef.current?.play().catch(e => console.log("Rain play failed", e));
    } else if (type === SoundscapeType.BROWN_NOISE) {
      if (!audioContextRef.current) {
        initBrownNoise();
      }
      audioContextRef.current?.resume();
    }
  }, [type]);

  // Web Audio API logic for Brown Noise
  const initBrownNoise = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    const bufferSize = 4096;
    const brownNoise = ctx.createScriptProcessor(bufferSize, 1, 1);
    
    // Gain to control volume
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.15; // Soft volume

    let lastOut = 0;
    brownNoise.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate for gain loss
      }
    };

    brownNoise.connect(gainNode);
    gainNode.connect(ctx.destination);
    brownNoiseNodeRef.current = brownNoise;
  };

  return null; // Headless component
};
