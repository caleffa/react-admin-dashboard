import { useEffect, useRef } from 'react';

export const useSidebarAutoClose = (setSidebarOpen, isMobile) => {
  const sidebarRef = useRef(null);
  const lastInteractionTime = useRef(Date.now());

  useEffect(() => {
    const handleInteraction = () => {
      lastInteractionTime.current = Date.now();
    };

    const handleResize = () => {
      const now = Date.now();
      // Solo cerrar si ha pasado suficiente tiempo desde la última interacción
      if (now - lastInteractionTime.current > 50) {
        setSidebarOpen(false);
      }
    };

    // Detectar interacciones del usuario
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    
    // Cerrar sidebar al cambiar tamaño (especialmente útil para rotación)
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('resize', handleResize);
    };
  }, [setSidebarOpen]);

  return sidebarRef;
};