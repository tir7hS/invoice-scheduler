import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ScheduleForm({ schedule, onSuccess, onCancel }) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [employeeChoice, setEmployeeChoice] = useState(''); // either an employee ID or 'other'
  const [customEmployeeName, setCustomEmployeeName] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(true);
  const [error, setError] = useState('');

  // Fetch all employees (users with role 'employee')
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'employee')
        .order('name');
      if (error) {
        console.error('Error fetching employees:', error);
      } else {
        setEmployees(data || []);
      }
      setFetchingEmployees(false);
    };
    fetchEmployees();
  }, []);

  // Prefill form when editing
  useEffect(() => {
    if (schedule) {
      setDate(schedule.date);
      setStartTime(schedule.start_time);
      setEndTime(schedule.end_time);
      setDescription(schedule.description || '');
      if (schedule.employee_id) {
        setEmployeeChoice(schedule.employee_id);
        setCustomEmployeeName('');
      } else if (schedule.custom_employee_name) {
        setEmployeeChoice('other');
        setCustomEmployeeName(schedule.custom_employee_name);
      }
    }
  }, [schedule]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let scheduleData = {
      date,
      start_time: startTime,
      end_time: endTime,
      description,
    };

    if (employeeChoice === 'other') {
      if (!customEmployeeName.trim()) {
        setError('Please enter a custom employee name.');
        setLoading(false);
        return;
      }
      scheduleData.employee_id = null;
      scheduleData.custom_employee_name = customEmployeeName.trim();
    } else if (employeeChoice) {
      scheduleData.employee_id = employeeChoice;
      scheduleData.custom_employee_name = null;
    } else {
      setError('Please select an employee or choose "Other".');
      setLoading(false);
      return;
    }

    let error;
    if (schedule) {
      const { error: updateError } = await supabase
        .from('schedules')
        .update(scheduleData)
        .eq('id', schedule.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('schedules')
        .insert([scheduleData]);
      error = insertError;
    }

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      onSuccess();
    }
  };

  if (fetchingEmployees) {
    return <div className="text-center py-4">Loading employees...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., Warehouse shift"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
        <select
          value={employeeChoice}
          onChange={(e) => setEmployeeChoice(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="" disabled>Select an employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
          <option value="other">Other (type name)</option>
        </select>
      </div>

      {employeeChoice === 'other' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom Employee Name</label>
          <input
            type="text"
            value={customEmployeeName}
            onChange={(e) => setCustomEmployeeName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter employee name"
            required
          />
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : schedule ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}