import { useState } from 'react';
import { FaPlus, FaRegCalendarCheck } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const eventOptions = {
  "Client Call": "Call with the client to discuss project updates.",
  "Deadline": "Project deadline due for submission.",
  "Team Meeting": "Team meeting to discuss progress and next steps."
};

export default function Calendar({ isDarkMode }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ type: '', description: '', name: '' });
  const [showModal, setShowModal] = useState(false);

  const handleAddEvent = () => {
    if (!newEvent.type.trim() && !newEvent.name.trim()) return;
    const event = { date: selectedDate, type: newEvent.type || newEvent.name, description: newEvent.description || 'Custom Event' };
    setEvents([...events, event]);
    setNewEvent({ type: '', description: '', name: '' });
    setShowModal(false);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  const upcomingEvents = [...events]
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date - b.date)
    .slice(0, 3);

  const totalEvents = events.length;
  const monthlyOverview = {
    "Total Events": totalEvents,
    "Client Calls": events.filter(e => e.type === "Client Call").length,
    "Deadlines": events.filter(e => e.type === "Deadline").length,
    "Team Meetings": events.filter(e => e.type === "Team Meeting").length
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded flex items-center gap-2">
          <FaPlus /> Add Event
        </button>
      </div>

      {/* Small Calendar aligned to the left */}
      <div className="p-4 rounded-lg shadow-lg w-fit bg-transparent flex flex-col items-start">
        <h3 className="text-xl font-semibold mb-4">Select a Date</h3>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateClick}
          inline
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
      </div>

      {/* Upcoming Events */}
      <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
        <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event, index) => (
            <div key={index} className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <FaRegCalendarCheck className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold">{event.type}</h4>
                <p className="text-sm text-gray-300">{event.date.toDateString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-300">No upcoming events</p>
        )}
      </div>

      {/* Monthly Overview */}
      <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-6 rounded-lg shadow-lg`}>

        <h3 className="text-xl font-semibold mb-4">Monthly Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(monthlyOverview).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-2xl font-bold text-purple-500">{value}</p>
              <p className="text-gray-300">{key}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-6 rounded-lg w-96`}>
            <h3 className="text-xl font-bold mb-4">Add New Event</h3>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="w-full p-2 mb-4 bg-gray-600 text-white rounded"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
            <select
              className="w-full p-2 mb-4 bg-gray-600 text-white rounded"
              value={newEvent.type}
              onChange={(e) => setNewEvent({ type: e.target.value, description: eventOptions[e.target.value], name: '' })}
            >
              <option value="">Select Event Type</option>
              {Object.keys(eventOptions).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or Enter Event Name"
              className="w-full p-2 mb-4 bg-gray-600 text-white rounded"
              value={newEvent.name}
              onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value, type: e.target.value, description: 'Custom Event' })}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-500 rounded text-white">Cancel</button>
              <button onClick={handleAddEvent} className="px-4 py-2 bg-purple-600 rounded text-white">Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}