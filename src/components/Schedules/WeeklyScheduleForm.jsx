import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { timeOptions } from '../../utils/timeOptions';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyScheduleForm({ onSuccess, onCancel }) {
  const [employees, setEmployees] = useState([
    { name: '', shifts: {} }
  ]);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (index, value) => {
    const newEmployees = [...employees];
    newEmployees[index].name = value;
    setEmployees(newEmployees);
  };

  const handleShiftChange = (empIndex, day, field, value) => {
    const newEmployees = [...employees];
    if (!newEmployees[empIndex].shifts[day]) {
      newEmployees[empIndex].shifts[day] = { start: '', end: '' };
    }
    newEmployees[empIndex].shifts[day][field] = value;
    setEmployees(newEmployees);
  };

  const addEmployee = () => {
    setEmployees([...employees, { name: '', shifts: {} }]);
  };

  const removeEmployee = (index) => {
    const newEmployees = employees.filter((_, i) => i !== index);
    setEmployees(newEmployees);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const schedulesToInsert = [];

    for (const emp of employees) {
      if (!emp.name.trim()) {
        setError('All employees must have a name.');
        setLoading(false);
        return;
      }

      for (const day of DAYS) {
        const shift = emp.shifts[day];
        if (shift && shift.start && shift.end) {
          const weekStartDate = new Date(weekStart);
          const dayIndex = DAYS.indexOf(day);
          const shiftDate = new Date(weekStartDate);
          shiftDate.setDate(weekStartDate.getDate() + dayIndex);
          const dateStr = shiftDate.toISOString().split('T')[0];

          schedulesToInsert.push({
            date: dateStr,
            start_time: shift.start,
            end_time: shift.end,
            description: `Weekly shift for ${emp.name}`,
            custom_employee_name: emp.name.trim(),
            employee_id: null,
          });
        }
      }
    }

    if (schedulesToInsert.length === 0) {
      setError('At least one shift must be defined.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('schedules')
      .insert(schedulesToInsert);

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Week Starting (Monday)</label>
        <input
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Shifts will be created for Monday through Sunday of this week.</p>
      </div>

      {employees.map((emp, empIndex) => (
        <div key={empIndex} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Employee {empIndex + 1}</h3>
            {employees.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmployee(empIndex)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
            <input
              type="text"
              value={emp.name}
              onChange={(e) => handleNameChange(empIndex, e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Full name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAYS.map((day) => (
              <div key={day} className="border rounded p-3">
                <p className="font-medium text-sm mb-2">{day}</p>
                <div className="flex space-x-2">
                  <select
                    value={emp.shifts[day]?.start || ''}
                    onChange={(e) => handleShiftChange(empIndex, day, 'start', e.target.value)}
                    className="w-1/2 border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value="">Start</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  <select
                    value={emp.shifts[day]?.end || ''}
                    onChange={(e) => handleShiftChange(empIndex, day, 'end', e.target.value)}
                    className="w-1/2 border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value="">End</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-400 mt-1">Leave both blank for day off</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEmployee}
        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
      >
        + Add Another Employee
      </button>

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
          {loading ? 'Saving...' : 'Save All Schedules'}
        </button>
      </div>
    </form>
  );
}