import { useState, useEffect } from 'react';

export type SystemState = 'IDLE' | 'ACCELERATING' | 'CRUISING' | 'DECELERATING' | 'EMERGENCY_STOP';

export function useHyperloop() {
  const [systemState, setSystemState] = useState<SystemState>('IDLE');
  const [speed, setSpeed] = useState(0);
  const [temperature, setTemperature] = useState(22);
  const [pressure, setPressure] = useState(101);

  const handleStart = () => setSystemState('ACCELERATING');
  const handleStop = () => setSystemState('DECELERATING');
  const handleEmergency = () => {
    setSystemState('EMERGENCY_STOP');
    setSpeed(0);
  };

  useEffect(() => {
    let interval: Timer;

    if (systemState !== 'IDLE' && systemState !== 'EMERGENCY_STOP') {
      interval = setInterval(() => {
        const speedFluctuation = Math.floor(Math.random() * 10) - 2; 
        const tempFluctuation = Math.random() * 2 - 0.5;
        const pressureFluctuation = Math.random() * 4 - 2;

        setSpeed(prev => {
          if (systemState === 'ACCELERATING') return Math.min(prev + 15 + speedFluctuation, 1200);
          if (systemState === 'DECELERATING') return Math.max(prev - 20 + speedFluctuation, 0);
          return prev;
        });

        setTemperature(prev => {
          const targetTemp = 22 + (speed / 100);
          return Number((prev + (targetTemp - prev) * 0.1 + tempFluctuation).toFixed(1));
        });

        setPressure(prev => Number(Math.max(10, prev + pressureFluctuation).toFixed(1)));
      }, 500);
    }

    if (systemState === 'DECELERATING' && speed <= 0) {
      setSystemState('IDLE');
      setSpeed(0);
    }

    return () => clearInterval(interval);
  }, [systemState, speed]);

  return { speed, temperature, pressure, systemState, handleStart, handleStop, handleEmergency };
}