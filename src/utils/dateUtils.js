// Date utility functions

export const formatDate = (date, format = 'MM/dd/yyyy') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  switch (format) {
    case 'MM/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`;
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    case 'MMM dd, yyyy':
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    case 'datetime':
      return `${month}/${day}/${year} ${hours}:${minutes}`;
    case 'time':
      return `${hours}:${minutes}`;
    default:
      return d.toLocaleDateString();
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, 'datetime');
};

export const formatTime = (date) => {
  return formatDate(date, 'time');
};

export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

export const isThisWeek = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  
  return checkDate >= weekStart && checkDate <= weekEnd;
};

export const isThisMonth = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};

export const getWeekDays = () => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

export const isPastDate = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

export const isFutureDate = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  today.setHours(23, 59, 59, 999);
  return checkDate > today;
};

export const getAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const getDateTimeInputValue = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// MISSING FUNCTIONS - Add these to fix the import errors:

// Alias for getDateTimeInputValue to match the import in IncidentForm
export const formatDateTimeLocal = (date) => {
  return getDateTimeInputValue(date);
};

// Week-related functions
export const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

export const endOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 6;
  return new Date(d.setDate(diff));
};

// Generate array of dates between two dates
export const eachDayOfInterval = (start, end) => {
  const days = [];
  const current = new Date(start);
  const endDate = new Date(end);
  
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

// Format function (alias for formatDate)
export const format = (date, formatString) => {
  return formatDate(date, formatString);
};

// Date arithmetic functions
export const subDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

export const addWeeks = (date, weeks) => {
  const result = new Date(date);
  result.setDate(result.getDate() + (weeks * 7));
  return result;
};

export const subWeeks = (date, weeks) => {
  const result = new Date(date);
  result.setDate(result.getDate() - (weeks * 7));
  return result;
};

export const subMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
};

// Month-related functions
export const startOfMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export const endOfMonth = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

// Get day of week (0 = Sunday, 1 = Monday, etc.)
export const getDay = (date) => {
  return new Date(date).getDay();
};