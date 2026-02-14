import { Pencil, Trash2 } from 'lucide-react';

export default function ScheduleView({ schedules, canManage, onEdit, onDelete }) {
  // Group schedules by employee name (custom_employee_name)
  const grouped = schedules.reduce((acc, schedule) => {
    const empName = schedule.custom_employee_name || 'Unnamed';
    if (!acc[empName]) {
      acc[empName] = {
        name: empName,
        shifts: []
      };
    }
    acc[empName].shifts.push(schedule);
    return acc;
  }, {});

  const employeeList = Object.values(grouped);

  // Sort employees by name
  employeeList.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8">
      {employeeList.length === 0 && (
        <p className="text-center py-8 text-gray-500">No schedules yet.</p>
      )}
      {employeeList.map(({ name, shifts }) => (
        <div key={name} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shifts.map((shift) => (
              <div key={shift.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">
                      {shift.date} • {shift.start_time.slice(0,5)} – {shift.end_time.slice(0,5)}
                    </p>
                    <p className="mt-1 text-gray-700">{shift.description || 'No description'}</p>
                  </div>
                  {canManage && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(shift)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(shift.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}