import { useEffect, useRef } from 'react';

const DEFAULT_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart'
];

export default function useIdleLogout({ timeout, onLogout }) {
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onLogout();
    }, timeout);
  };

  useEffect(() => {
    DEFAULT_EVENTS.forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer(); // inicia el contador al montar

    return () => {
      DEFAULT_EVENTS.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
      clearTimeout(timerRef.current);
    };
  }, []);
}
