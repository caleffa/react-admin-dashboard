import React, { useState, useEffect, useMemo } from 'react';
import { clubScheduleService, clubCategoryService, clubUserService } from '../../services/api';
import { useClubAuth } from '../../context/ClubAuthContext';

// Función para formatear hora
function formatTime(timeString) {
  if (!timeString) return '--:--';
  try {
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      const hours = timeParts[0].padStart(2, '0');
      const minutes = timeParts[1].padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return timeString;
  } catch (error) {
    return '--:--';
  }
}

// Función para obtener nombre del día en español basado en INT (0=Domingo, 1=Lunes, etc.)
function getDayName(dayNumber) {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  // Asegurarse de que dayNumber sea un número entre 0-6
  const dayIndex = typeof dayNumber === 'string' ? parseInt(dayNumber, 10) : dayNumber;
  
  // Validar rango
  if (dayIndex >= 0 && dayIndex < days.length) {
    return days[dayIndex];
  }
  
  return `Día ${dayNumber}`;
}

// Función para obtener el día en formato corto
function getDayShortName(dayNumber) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Asegurarse de que dayNumber sea un número entre 0-6
  const dayIndex = typeof dayNumber === 'string' ? parseInt(dayNumber, 10) : dayNumber;
  
  // Validar rango
  if (dayIndex >= 0 && dayIndex < days.length) {
    return days[dayIndex];
  }
  
  return `D${dayNumber}`;
}

// Función para generar eventos recurrentes desde created_at hasta 3 meses adelante
function generateRecurringEvents(schedule) {
  const events = [];
  
  // Parsear created_at a fecha
  let startDate = new Date(schedule.created_at || new Date());
  if (isNaN(startDate.getTime())) {
    startDate = new Date(); // Si created_at es inválido, usar fecha actual
  }
  
  // Calcular fecha de fin (3 meses después de created_at)
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 3);
  
  // Obtener el día de la semana del schedule (0=Domingo, 1=Lunes, etc.)
  const scheduleDayOfWeek = typeof schedule.day_of_week === 'string' 
    ? parseInt(schedule.day_of_week, 10) 
    : schedule.day_of_week;
  
  // Validar que scheduleDayOfWeek esté en el rango correcto
  if (scheduleDayOfWeek === undefined || scheduleDayOfWeek === null || 
      scheduleDayOfWeek < 0 || scheduleDayOfWeek > 6) {
    console.warn('Día de la semana inválido:', scheduleDayOfWeek, 'en schedule:', schedule.id);
    return events;
  }
  
  // Encontrar la primera ocurrencia del día de la semana después de startDate
  const firstOccurrence = new Date(startDate);
  const currentDayOfWeek = firstOccurrence.getDay(); // getDay() devuelve 0=Domingo, 1=Lunes, etc.
  
  // Calcular días hasta el próximo scheduleDayOfWeek
  let daysToAdd = scheduleDayOfWeek - currentDayOfWeek;
  if (daysToAdd < 0) {
    daysToAdd += 7;
  }
  
  firstOccurrence.setDate(firstOccurrence.getDate() + daysToAdd);
  
  // Si la primera ocurrencia es hoy o en el futuro, incluirla
  // Si es en el pasado, saltar a la próxima semana
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (firstOccurrence < today) {
    firstOccurrence.setDate(firstOccurrence.getDate() + 7);
  }
  
  // Generar eventos semanales hasta endDate
  let currentDate = new Date(firstOccurrence);
  
  while (currentDate <= endDate) {
    events.push({
      id: `${schedule.id}-${currentDate.toISOString().split('T')[0]}`,
      scheduleId: schedule.id,
      date: new Date(currentDate),
      dateString: currentDate.toISOString().split('T')[0],
      dayOfWeek: scheduleDayOfWeek,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      discipline_name: schedule.discipline_name,
      category_name: schedule.category_name,
      teacher_name: schedule.teacher_name,
      room: schedule.room,
      max_capacity: schedule.max_capacity,
      enrolled_member: schedule.enrolled_member || 0,
      status: schedule.status,
      isRecurring: true,
      originalSchedule: schedule
    });
    
    // Avanzar 7 días para la próxima semana
    currentDate.setDate(currentDate.getDate() + 7);
  }
  console.log('Eventos: ' +events);
  return events;
}

// Componente de Vista de Calendario Semanal Mejorado
const WeeklyCalendarView = ({ schedules, onEdit, onDelete }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' o 'day'
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Generar todos los eventos recurrentes
  const allEvents = useMemo(() => {
    const events = [];
    
    schedules.forEach(schedule => {
      if (schedule.status === 'active') {
        const recurringEvents = generateRecurringEvents(schedule);
        events.push(...recurringEvents);
      }
    });
    
    // Ordenar por fecha y hora
    return events.sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime();
      if (dateCompare !== 0) return dateCompare;
      
      const [aHour, aMinute] = a.start_time.split(':').map(Number);
      const [bHour, bMinute] = b.start_time.split(':').map(Number);
      return (aHour * 60 + aMinute) - (bHour * 60 + bMinute);
    });
  }, [schedules]);

  // Horarios del día (de 6 AM a 10 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  // Días de la semana actual o días del mes según viewMode
  const calendarDays = useMemo(() => {
    if (viewMode === 'week') {
      const days = [];
      const startOfWeek = new Date(currentWeek);
      startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay()); // Domingo como inicio
      
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push({
          date: day,
          dayOfWeek: i, // 0 = Domingo, 1 = Lunes, etc.
          dayName: getDayShortName(i),
          dateString: day.toISOString().split('T')[0],
          isToday: day.toDateString() === new Date().toDateString()
        });
      }
      return days;
    } else {
      // Modo día - solo el día seleccionado
      return [{
        date: selectedDate,
        dayOfWeek: selectedDate.getDay(),
        dayName: getDayShortName(selectedDate.getDay()),
        dateString: selectedDate.toISOString().split('T')[0],
        isToday: selectedDate.toDateString() === new Date().toDateString()
      }];
    }
  }, [currentWeek, viewMode, selectedDate]);

  // Filtrar eventos por rango de fechas
  const filteredEvents = useMemo(() => {
    if (calendarDays.length === 0) return [];
    
    const startDate = new Date(calendarDays[0].date);
    const endDate = new Date(calendarDays[calendarDays.length - 1].date);
    endDate.setHours(23, 59, 59, 999);
    
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      return eventDate >= startDate && eventDate <= endDate;
    });
  }, [allEvents, calendarDays]);

  // Obtener eventos para un día específico
  const getEventsForDay = (dateString) => {
    return filteredEvents.filter(event => event.dateString === dateString);
  };

  // Calcular posición y altura de cada evento
  const calculateEventPosition = (event) => {
    if (!event.start_time || !event.end_time) {
      return { top: '0%', height: '0%' };
    }
    
    try {
      const [startHour, startMinute] = event.start_time.split(':').map(Number);
      const [endHour, endMinute] = event.end_time.split(':').map(Number);
      
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;
      const durationInMinutes = endTimeInMinutes - startTimeInMinutes;
      
      // La cuadrícula empieza a las 6:00 AM (360 minutos)
      const top = ((startTimeInMinutes - 360) / 60) * 100; // En porcentaje
      const height = (durationInMinutes / 60) * 100; // En porcentaje
      
      return { top: `${Math.max(0, top)}%`, height: `${Math.max(0, height)}%` };
    } catch (error) {
      console.error('Error calculando posición del evento:', error, event);
      return { top: '0%', height: '0%' };
    }
  };

  // Navegación entre semanas/días
  const goToPrevious = () => {
    if (viewMode === 'week') {
      setCurrentWeek(prev => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() - 7);
        return newDate;
      });
    } else {
      setSelectedDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() - 1);
        return newDate;
      });
    }
  };

  const goToNext = () => {
    if (viewMode === 'week') {
      setCurrentWeek(prev => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + 7);
        return newDate;
      });
    } else {
      setSelectedDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + 1);
        return newDate;
      });
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentWeek(today);
    setSelectedDate(today);
  };

  // Obtener el rango de fechas visible
  const getDateRange = () => {
    if (viewMode === 'week') {
      const start = new Date(calendarDays[0].date);
      const end = new Date(calendarDays[6].date);
      
      const startMonth = start.toLocaleDateString('es-AR', { month: 'short' });
      const endMonth = end.toLocaleDateString('es-AR', { month: 'short' });
      
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} de ${endMonth} ${end.getFullYear()}`;
      } else {
        return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
      }
    } else {
      return selectedDate.toLocaleDateString('es-AR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  // Colores para diferentes disciplinas
  const getDisciplineColor = (disciplineName) => {
    const colors = [
      'bg-blue-100 border-blue-300 hover:bg-blue-200',
      'bg-green-100 border-green-300 hover:bg-green-200',
      'bg-yellow-100 border-yellow-300 hover:bg-yellow-200',
      'bg-purple-100 border-purple-300 hover:bg-purple-200',
      'bg-pink-100 border-pink-300 hover:bg-pink-200',
      'bg-indigo-100 border-indigo-300 hover:bg-indigo-200',
      'bg-teal-100 border-teal-300 hover:bg-teal-200',
      'bg-orange-100 border-orange-300 hover:bg-orange-200',
      'bg-red-100 border-red-300 hover:bg-red-200',
      'bg-cyan-100 border-cyan-300 hover:bg-cyan-200',
    ];
    
    if (!disciplineName) {
      return colors[0];
    }
    
    // Generar un índice basado en el nombre de la disciplina
    let hash = 0;
    for (let i = 0; i < disciplineName.length; i++) {
      hash = disciplineName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    
    return colors[index];
  };

  // Calcular estadísticas
  const getStats = () => {
    const totalEvents = filteredEvents.length;
    const uniqueDisciplines = new Set(filteredEvents.map(e => e.discipline_name)).size;
    const totalCapacity = filteredEvents.reduce((sum, e) => sum + (parseInt(e.max_capacity) || 0), 0);
    const totalEnrolled = filteredEvents.reduce((sum, e) => sum + (parseInt(e.enrolled_member) || 0), 0);
        console.log( totalEvents, uniqueDisciplines, totalCapacity, totalEnrolled);
    return { totalEvents, uniqueDisciplines, totalCapacity, totalEnrolled };
  };

  const stats = getStats();

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Controles de navegación */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
          >
            Hoy
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevious}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-lg font-semibold text-gray-800">
              {getDateRange()}
            </span>
            <button
              onClick={goToNext}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Selector de vista */}
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm font-medium rounded ${viewMode === 'week' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-sm font-medium rounded ${viewMode === 'day' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Día
            </button>
          </div>
          
          {/* Estadísticas */}
          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span className="font-semibold">{stats.totalEvents}</span>
              <span>clases</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold">{stats.uniqueDisciplines}</span>
              <span>disciplinas</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold">{stats.totalEnrolled}/{stats.totalCapacity}</span>
              <span>cupos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Cabecera con días */}
          <div className="flex border-b border-gray-200">
            {/* Columna de horas */}
            <div className="w-16 border-r border-gray-200 bg-gray-50"></div>
            
            {/* Días de la semana o día único */}
            {calendarDays.map((day) => {
              const dayEvents = getEventsForDay(day.dateString);
              
              return (
                <div 
                  key={day.dateString} 
                  className={`flex-1 min-w-[150px] text-center py-3 border-r border-gray-200 ${day.isToday ? 'bg-blue-50' : 'bg-gray-50'}`}
                >
                  <div className={`text-sm font-semibold ${day.isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                    {day.dayName}
                  </div>
                  <div className={`text-lg font-bold ${day.isToday ? 'text-blue-800' : 'text-gray-800'}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dayEvents.length} {dayEvents.length === 1 ? 'clase' : 'clases'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {day.date.toLocaleDateString('es-AR', { month: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cuerpo del calendario */}
          <div className="flex relative">
            {/* Columna de horas */}
            <div className="w-16 border-r border-gray-200">
              {timeSlots.map((time, index) => (
                <div 
                  key={time} 
                  className="h-12 border-b border-gray-100 relative"
                  style={{ minHeight: '60px' }}
                >
                  <div className="absolute -top-2 right-1 text-xs text-gray-400">
                    {time}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="flex flex-1">
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDay(day.dateString);
                
                return (
                  <div 
                    key={day.dateString} 
                    className="flex-1 min-w-[150px] border-r border-gray-200 relative"
                    style={{ minHeight: `${timeSlots.length * 60}px` }}
                  >
                    {/* Líneas de hora */}
                    {timeSlots.map((time, index) => (
                      <div 
                        key={`${day.dateString}-${time}`} 
                        className="absolute w-full border-b border-gray-100"
                        style={{ 
                          top: `${(index / timeSlots.length) * 100}%`,
                          height: '1px'
                        }}
                      />
                    ))}
                    
                    {/* Eventos recurrentes */}
                    {dayEvents.map((event) => {
                      const position = calculateEventPosition(event);
                      const colorClass = getDisciplineColor(event.discipline_name || 'General');
                      
                      return (
                        <div
                          key={event.id}
                          className={`absolute left-1 right-1 rounded-md border p-2 overflow-hidden cursor-pointer transition-all duration-200 ${colorClass}`}
                          style={{
                            top: position.top,
                            height: position.height,
                            zIndex: 10
                          }}
                          onClick={() => onEdit(event.originalSchedule)}
                          title={`${event.discipline_name} - ${event.category_name}\n${formatTime(event.start_time)} - ${formatTime(event.end_time)}\nProf: ${event.teacher_name}\nFecha: ${event.date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}\nCupos: ${event.enrolled_member}/${event.max_capacity || '∞'}`}
                        >
                          <div className="font-semibold text-xs truncate">
                            {event.discipline_name}
                          </div>
                          <div className="text-xs truncate text-gray-600">
                            {event.category_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </div>
                          <div className="text-xs truncate text-gray-600 mt-1">
                            {event.teacher_name}
                          </div>
                          {event.room && (
                            <div className="text-xs text-gray-500 mt-1">
                              📍 {event.room}
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs">
                              👥 {event.enrolled_member || 0}/{event.max_capacity || '∞'}
                            </div>
                            <div className="flex space-x-1">
                              <div className="text-xs bg-blue-100 text-blue-800 px-1 rounded text-xs">
                                {event.date.getDate()}/{event.date.getMonth() + 1}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(event.scheduleId);
                                }}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Mensaje si no hay eventos */}
                    {dayEvents.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Sin clases programadas</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Información y leyenda */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Leyenda */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">Leyenda por disciplina:</span>
              {Array.from(new Set(filteredEvents.map(e => e.discipline_name))).slice(0, 5).map((discipline, index) => (
                <div key={discipline} className="flex items-center space-x-1">
                  <div 
                    className={`w-3 h-3 rounded ${getDisciplineColor(discipline).split(' ')[0]}`}
                  />
                  <span className="text-xs text-gray-600">{discipline}</span>
                </div>
              ))}
              {Array.from(new Set(filteredEvents.map(e => e.discipline_name))).length > 5 && (
                <span className="text-xs text-gray-500">
                  +{Array.from(new Set(filteredEvents.map(e => e.discipline_name))).length - 5} más
                </span>
              )}
            </div>
          </div>
          
          {/* Información del periodo */}
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">●</span>
              <span>Mostrando clases desde hoy hasta 3 meses adelante</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Total de eventos generados: {allEvents.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClubSchedulesManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Nueva pestaña para vista de calendario
  const [activeTab, setActiveTab] = useState('list'); // 'list' o 'calendar'

  // Estados para DataTable
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [disciplines, setDisciplines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const { user: currentUser } = useClubAuth();
  const [selectedSchedule, setSelectedSchedule] = useState('');

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar categorías del club
      const categoryData = await clubCategoryService.getCategoriesByClubId(currentUser.club_id);
      const activeCategories = categoryData.filter(category => category.status === 'active');
      setCategories(activeCategories);
      
      // Cargar disciplinas del club
      const disciplineData = await clubCategoryService.getDisciplinesByClubId(currentUser.club_id);
      const activeDisciplines = disciplineData.filter(discipline => discipline.status === 'active');
      setDisciplines(activeDisciplines);

      // Cargar profesores del club
      const teacherData = await clubUserService.getUsersByClubId(currentUser.club_id);
      const activeTeachers = teacherData.filter(teacher => teacher.status === 'active' && teacher.role === 'teacher');
      setTeachers(activeTeachers);

      // Cargar cronogramas del mismo club
      const schedulesData = await clubScheduleService.getSchedulesByClubId(currentUser.club_id);
      setSchedules(schedulesData);

    } catch (err) {
      setError(err.message);
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para ordenar los datos
  const sortedAndFilteredSchedules = useMemo(() => {
    let filtered = schedules.filter(schedule => 
      schedule.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.discipline_name?.toLowerCase().includes(searchTerm.toLowerCase()) 
    );

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Manejar valores nulos o undefined
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [schedules, searchTerm, sortField, sortDirection]);

  // Paginación
  const paginatedSchedules = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredSchedules.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredSchedules, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredSchedules.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === 'asc' ? 
      <span className="text-blue-500">↑</span> : 
      <span className="text-blue-500">↓</span>;
  };

  const handleCreate = async (scheduleData) => {
    try {
      setError('');
      
      // Convertir día de la semana de string a int si es necesario
      const processedData = {
        ...scheduleData,
        day_of_week: parseInt(scheduleData.day_of_week, 10),
        club_id: currentUser.club_id
      };
      
      await clubScheduleService.createSchedule(processedData);
      setSuccessMessage('Cronograma creado exitosamente');
      setShowCreateModal(false);
      loadSchedules();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Error al crear cronograma');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setShowEditModal(true);
  };

  const handleUpdate = async (scheduleData) => {
    try {
      setError('');
      
      // Convertir día de la semana de string a int si es necesario
      const processedData = {
        ...scheduleData,
        day_of_week: parseInt(scheduleData.day_of_week, 10),
        club_id: currentUser.club_id
      };
      
      await clubScheduleService.updateSchedule(editingSchedule.id, processedData);
      setShowEditModal(false);
      setEditingSchedule(null);
      setSuccessMessage('Cronograma actualizada exitosamente');
      loadSchedules();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar la cronograma: ' + err.message);
      console.error('Error updating schedule:', err);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cronograma? Esto eliminará todas las clases recurrentes programadas.')) {
      try {
        setError('');
        await clubScheduleService.deleteSchedule(scheduleId);
        setSuccessMessage('Cronograma eliminado exitosamente');
        loadSchedules();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError('Error al eliminar el cronograma: ' + err.message);
        console.error('Error deleting schedule:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando cronogramas del club...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cronogramas</h2>
          <p className="text-gray-600">Total: {sortedAndFilteredSchedules.length} cronogramas activos</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Crear Cronograma</span>
          </button>
          <button
            onClick={loadSchedules}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Pestañas */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'list' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Lista de Cronogramas</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'calendar' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Calendario de Clases (3 meses)</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido según pestaña activa */}
      {activeTab === 'list' ? (
        <>
          {/* Barra de búsqueda y controles (solo para lista) */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por disciplina, categoría o profesor..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">📊</span>
                  <span className="text-sm text-gray-600">Mostrar:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {sortedAndFilteredSchedules.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No se encontraron cronogramas que coincidan con la búsqueda' : 'No se encontraron cronogramas en este club'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Crear Primer Cronograma
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('discipline_name')} >
                        <div className="flex items-center space-x-1">
                          <span>Disciplina</span>
                          {getSortIcon('discipline_name')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('category_name')} >
                        <div className="flex items-center space-x-1">
                          <span>Categoría</span>
                          {getSortIcon('category_name')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('teacher_name')} >
                        <div className="flex items-center space-x-1">
                          <span >Profesor/a</span>
                          {getSortIcon('teacher_name')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('day_of_week')} >
                        <div className="flex items-center space-x-1">
                          <span >Día</span>
                          {getSortIcon('day_of_week')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('start_time')} >
                        <div className="flex items-center space-x-1">
                          <span >Inicio</span>
                          {getSortIcon('start_time')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('end_time')} >
                        <div className="flex items-center space-x-1">
                          <span >Fin</span>
                          {getSortIcon('end_time')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('max_capacity')} >
                        <div className="flex items-center space-x-1">
                          <span >Capacidad</span>
                          {getSortIcon('max_capacity')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('room')} >
                        <div className="flex items-center space-x-1">
                          <span >Área</span>
                          {getSortIcon('room')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('enrolled_member')} >
                        <div className="flex items-center space-x-1">
                          <span >Inscriptos</span>
                          {getSortIcon('enrolled_member')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedSchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {schedule.discipline_name?.charAt(0).toUpperCase() || 'U'}
                              {schedule.category_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {schedule.discipline_name} 
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.category_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.teacher_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getDayName(schedule.day_of_week)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(schedule.start_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(schedule.end_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.max_capacity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.room}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            schedule.enrolled_member >= 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {schedule.enrolled_member || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            schedule.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {schedule.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                          
                            <button
                              onClick={() => handleDelete(schedule.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, sortedAndFilteredSchedules.length)}
                        </span> de{' '}
                        <span className="font-medium">{sortedAndFilteredSchedules.length}</span> resultados
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        // Vista de Calendario con eventos recurrentes
        <WeeklyCalendarView 
          schedules={schedules}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modales - ACTUALIZADOS para manejar INT en day_of_week */}
      {showCreateModal && (
        <CreateScheduleModal
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
          schedules={schedules}
          categories={categories}
          disciplines={disciplines}
          teachers={teachers}
        />
      )}

      {showEditModal && editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          onSave={handleUpdate}
          onClose={() => {
            setShowEditModal(false);
            setEditingSchedule(null);
          }}
          schedules={schedules}
          categories={categories}
          disciplines={disciplines}
          teachers={teachers}
        />
      )}
    </div>
  );
};

// Componente CreateScheduleModal ACTUALIZADO para manejar INT
const CreateScheduleModal = ({ 
  onSave, 
  onClose, 
  teachers,
  disciplines,
  categories
}) => {
  const [formData, setFormData] = useState({
    discipline_id: '',
    teacher_id: '',
    start_time: '',
    end_time: '',
    category_id: '',
    room: '',
    day_of_week: '', // Mantener como string para el select, luego convertir a INT
    max_capacity: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filtrar categorías basadas en la disciplina seleccionada
  const filteredCategories = useMemo(() => {
    if (!formData.discipline_id) {
      return categories;
    }
    return categories.filter(category => 
      category.discipline_id === parseInt(formData.discipline_id)
    );
  }, [formData.discipline_id, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validaciones
    if (!formData.teacher_id || !formData.day_of_week || !formData.category_id || !formData.start_time || !formData.end_time ) {
      setError('Todos los campos marcados con * son obligatorios');
      setLoading(false);
      return;
    }

    // Validar que la hora de fin sea mayor que la de inicio
    if (formData.start_time && formData.end_time) {
      const [startHour, startMinute] = formData.start_time.split(':').map(Number);
      const [endHour, endMinute] = formData.end_time.split(':').map(Number);
      
      if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
        setError('La hora de fin debe ser mayor que la hora de inicio');
        setLoading(false);
        return;
      }
    }

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Si cambia la disciplina, limpiar la categoría seleccionada
      if (name === 'discipline_id') {
        newData.category_id = '';
      }
      
      return newData;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Crear Cronograma</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

        <div className="grid grid-cols-2 gap-4">
          {/* Campo Disciplina */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disciplina *
            </label>
            <select
              name="discipline_id"
              value={formData.discipline_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Seleccionar disciplina</option>
              {disciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Categoría (dependiente de la disciplina) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={!formData.discipline_id || filteredCategories.length === 0}
            >
              <option value="">
                {!formData.discipline_id 
                  ? 'Primero seleccione una disciplina' 
                  : filteredCategories.length === 0 
                    ? 'No hay categorías para esta disciplina'
                    : 'Seleccionar categoría'
                }
              </option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formData.discipline_id && filteredCategories.length === 0 && (
              <p className="text-yellow-600 text-sm mt-1">
                Esta disciplina no tiene categorías configuradas
              </p>
            )}
          </div>
        </div>
          {/* Campo profe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profesor/a *
            </label>
            <select
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Seleccionar profesor/a</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name}
                </option>
              ))}
            </select>
          </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inicio *
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fin *
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidad *
            </label>
            <input
              type="number"
              name="max_capacity"
              value={formData.max_capacity}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Día de la semana *
            </label>
            <select
              name="day_of_week"
              value={formData.day_of_week}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
             >
              <option value="">Seleccionar día</option>
              <option value="0">Domingo</option>
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miércoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
              <option value="6">Sábado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área
            </label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
              placeholder="Ej: Sala A, Gimnasio"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </form>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creando...</span>
              </>
            ) : (
              <span>Crear Cronograma</span>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
};

// Componente EditScheduleModal ACTUALIZADO para manejar INT
const EditScheduleModal = ({ 
  schedule, 
  onSave, 
  onClose, 
  teachers,
  disciplines,
  categories
}) => {
  const [formData, setFormData] = useState({
    teacher_id: schedule?.teacher_id || '',
    day_of_week: schedule?.day_of_week?.toString() || '', // Convertir INT a string para el select
    category_id: schedule?.category_id || '',
    start_time: schedule?.start_time || '',
    end_time: schedule?.end_time || '',
    max_capacity: schedule?.max_capacity || '',
    room: schedule?.room || '',
    status: schedule?.status || 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Obtener la disciplina del cronograma para preseleccionar
  const scheduleDisciplineId = useMemo(() => {
    if (!schedule || !schedule.discipline_id) return '';
    return schedule.discipline_id.toString();
  }, [schedule]);

  // Filtrar categorías basadas en la disciplina del cronograma
  const filteredCategories = useMemo(() => {
    if (!scheduleDisciplineId) {
      return categories;
    }
    return categories.filter(category => 
      category.discipline_id === parseInt(scheduleDisciplineId)
    );
  }, [scheduleDisciplineId, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.teacher_id || !formData.category_id || !formData.day_of_week || !formData.start_time || !formData.end_time) {
      setError('Todos los campos obligatorios deben ser completados');
      setLoading(false);
      return;
    }

    // Validar que la hora de fin sea mayor que la de inicio
    if (formData.start_time && formData.end_time) {
      const [startHour, startMinute] = formData.start_time.split(':').map(Number);
      const [endHour, endMinute] = formData.end_time.split(':').map(Number);
      
      if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
        setError('La hora de fin debe ser mayor que la hora de inicio');
        setLoading(false);
        return;
      }
    }

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Actualizar Cronograma</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Información de disciplina (solo lectura) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disciplina
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {schedule?.discipline_name || 'No especificada'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              La disciplina no se puede modificar una vez creado el cronograma
            </p>
          </div>

          {/* Campo Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={filteredCategories.length === 0}
            >
              <option value="">
                {filteredCategories.length === 0 
                  ? 'No hay categorías disponibles'
                  : 'Seleccionar categoría'
                }
              </option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {filteredCategories.length === 0 && (
              <p className="text-yellow-600 text-sm mt-1">
                No hay categorías configuradas para esta disciplina
              </p>
            )}
          </div>
          
          {/* Campo profe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profesor/a *
            </label>
            <select
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Seleccionar profesor/a</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name}
                </option>
              ))}
            </select>
          </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inicio *
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fin *
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidad *
            </label>
            <input
              type="number"
              name="max_capacity"
              value={formData.max_capacity}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Día de la semana *
            </label>
            <select
              name="day_of_week"
              value={formData.day_of_week}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
             >
              <option value="">Seleccionar día</option>
              <option value="0">Domingo</option>
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miércoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
              <option value="6">Sábado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área
            </label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
              placeholder="Ej: Sala A, Gimnasio"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </form>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Actualizando...</span>
              </>
            ) : (
              <span>Actualizar Cronograma</span>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default ClubSchedulesManagement;