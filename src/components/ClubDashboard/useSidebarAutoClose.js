import { useEffect, useRef } from 'react';

export const useSidebarAutoClose = (setSidebarOpen, isMobile) => {
  const sidebarRef = useRef(null);
  const lastClickTime = useRef(Date.now());

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si no es móvil, no hacer nada
      if (!isMobile) return;
      
      // Si el sidebar no está abierto, no hacer nada
      if (!sidebarRef.current) return;
      
      // Si se hizo clic en el botón de toggle, no cerrar
      if (event.target.closest('[data-sidebar-toggle]')) return;
      
      // Si se hizo clic fuera del sidebar, cerrarlo
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        const now = Date.now();
        // Prevenir cierre rápido consecutivo (debouncing)
        if (now - lastClickTime.current > 100) {
          setSidebarOpen(false);
          lastClickTime.current = now;
        }
      }
    };

    // Solo agregar el listener si es móvil
    if (isMobile) {
      // Pequeño delay para evitar que se cierre inmediatamente
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [isMobile, setSidebarOpen]);

  return sidebarRef;
};