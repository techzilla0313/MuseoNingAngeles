import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

const AnnouncementPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDateAnnouncements, setSelectedDateAnnouncements] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("https://api.museoningangeles.com/api/announcements");
        if (!response.ok) {
          throw new Error("Failed to fetch announcements");
        }
        const data = await response.json();
        const sorted = data.sort(
          (a, b) => new Date(a.event_date) - new Date(b.event_date)
        );
        setAnnouncements(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Helper: Format a Date object as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split("T")[0];

  const announcementsForDay = (date) => {
    const dateStr = formatDate(date);
    return announcements.filter((ann) => {
      const annDateStr = new Date(ann.event_date).toISOString().split("T")[0];
      return annDateStr === dateStr;
    });
  };

  const getCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];
    if (startDay > 0) {
      const prevMonthLastDate = new Date(year, month, 0).getDate();
      for (let i = startDay - 1; i >= 0; i--) {
        days.push({
          date: new Date(year, month - 1, prevMonthLastDate - i),
          inCurrentMonth: false,
        });
      }
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: new Date(year, month, d),
        inCurrentMonth: true,
      });
    }
    const remaining = days.length % 7;
    if (remaining !== 0) {
      const daysToAdd = 7 - remaining;
      for (let i = 1; i <= daysToAdd; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          inCurrentMonth: false,
        });
      }
    }
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const handleDayClick = (day) => {
    const anns = announcementsForDay(day);
    if (anns.length > 0) {
      setSelectedDate(day);
      setSelectedDateAnnouncements(anns);
      setCurrentAnnouncementIndex(0);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDateAnnouncements([]);
    setSelectedDate(null);
  };

  const handlePrevAnnouncement = () => {
    if (currentAnnouncementIndex === 0) {
      setCurrentAnnouncementIndex(selectedDateAnnouncements.length - 1);
    } else {
      setCurrentAnnouncementIndex(currentAnnouncementIndex - 1);
    }
  };

  const handleNextAnnouncement = () => {
    if (currentAnnouncementIndex === selectedDateAnnouncements.length - 1) {
      setCurrentAnnouncementIndex(0);
    } else {
      setCurrentAnnouncementIndex(currentAnnouncementIndex + 1);
    }
  };

  const prevMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    setCurrentDate(newDate);
  };

  // Dropdown options for months and years
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  if (loading)
    return (
      <div className="pt-20 text-center py-6 text-gray-700">
        Loading announcements...
      </div>
    );
  if (error)
    return (
      <div className="pt-20 text-center py-6 text-red-600">
        Error: {error}
      </div>
    );

  const weeks = getCalendarGrid();
  const monthYear = currentDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white font-sans">
      <div className="pt-20 container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">
          Announcements Calendar
        </h1>
        {/* Date Text Above Navigation */}
        <div className="mb-2 text-center">
          <span className="text-lg font-semibold text-gray-700">
            {monthYear}
          </span>
        </div>
        {/* Navigation row: Previous button, Month/Year dropdowns, Next button */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={prevMonth}
            className="px-3 sm:px-4 py-2 bg-yellow-600 text-white rounded shadow hover:bg-yellow-700 transition text-xs sm:text-sm"
          >
            Previous
          </button>
          <select
            value={currentDate.getMonth()}
            onChange={(e) =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), parseInt(e.target.value), 1)
              )
            }
            className="border border-gray-300 rounded-md shadow-sm p-2 text-xs sm:text-sm"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={currentDate.getFullYear()}
            onChange={(e) =>
              setCurrentDate(
                new Date(parseInt(e.target.value), currentDate.getMonth(), 1)
              )
            }
            className="border border-gray-300 rounded-md shadow-sm p-2 text-xs sm:text-sm"
          >
            {generateYears().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button
            onClick={nextMonth}
            className="px-3 sm:px-4 py-2 bg-yellow-600 text-white rounded shadow hover:bg-yellow-700 transition text-xs sm:text-sm"
          >
            Next
          </button>
        </div>
        <div className="border border-gray-300 p-4 sm:p-6 rounded-lg shadow-lg mb-10 bg-white">
          <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-600 text-xs sm:text-sm">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 border-b">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weeks.map((week, weekIdx) => (
              <React.Fragment key={weekIdx}>
                {week.map((dayObj, dayIdx) => {
                  const dayAnns = announcementsForDay(dayObj.date);
                  return (
                    <div
                      key={dayIdx}
                      className={`border p-2 sm:p-3 ${
                        dayObj.inCurrentMonth ? "bg-white" : "bg-gray-100"
                      } h-24 sm:h-32 cursor-pointer relative transition transform hover:scale-105`}
                      onClick={() => handleDayClick(dayObj.date)}
                    >
                      <div className="text-xs sm:text-sm font-bold text-gray-800">
                        {dayObj.date.getDate()}
                      </div>
                      {dayAnns.length > 0 && (
                        <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 sm:w-3 h-2 sm:h-3 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle className="bg-yellow-600 text-white">
          Announcements for {selectedDate ? formatDate(selectedDate) : ""}
        </DialogTitle>
        <DialogContent dividers className="bg-white">
          {selectedDateAnnouncements.length > 0 && (
            <div className="text-center">
              <h3 className="text-lg sm:text-2xl font-bold mb-4 text-gray-800">
                {selectedDateAnnouncements[currentAnnouncementIndex].title}
              </h3>
              {selectedDateAnnouncements[currentAnnouncementIndex].image && (
                <img
                  src={`https://api.museoningangeles.com${selectedDateAnnouncements[currentAnnouncementIndex].image}`}
                  alt={selectedDateAnnouncements[currentAnnouncementIndex].title}
                  className="w-full h-auto object-contain rounded mb-4 shadow-lg"
                />
              )}
              <p className="text-xs sm:text-base text-gray-700 break-words whitespace-normal">
                {selectedDateAnnouncements[currentAnnouncementIndex].content}
              </p>
            </div>
          )}
        </DialogContent>
        <DialogActions className="bg-gray-50">
          {selectedDateAnnouncements.length > 1 && (
            <>
              <Button onClick={handlePrevAnnouncement} color="primary" className="font-semibold text-xs sm:text-sm">
                Previous
              </Button>
              <Button onClick={handleNextAnnouncement} color="primary" className="font-semibold text-xs sm:text-sm">
                Next
              </Button>
            </>
          )}
          <Button onClick={handleCloseModal} color="secondary" className="font-semibold text-xs sm:text-sm">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AnnouncementPage;
