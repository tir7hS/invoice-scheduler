import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import ScheduleView from '../components/Schedules/ScheduleView';
import WeeklyScheduleForm from '../components/Schedules/WeeklyScheduleForm';
import EditScheduleForm from '../components/Schedules/EditScheduleForm';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

export default function SchedulesPage() {
  const { userRole } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const fetchSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (!error) {
      setSchedules(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();

    const subscription = supabase
      .channel('schedules')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' },
        () => fetchSchedules())
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const handleAddWeekly = () => {
    setShowWeeklyModal(true);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this schedule?')) {
      await supabase.from('schedules').delete().eq('id', id);
    }
  };

  const handleModalClose = () => {
    setShowWeeklyModal(false);
    setShowEditModal(false);
    setEditingSchedule(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    fetchSchedules();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Work Schedules</h1>
        {userRole === 'employer' && (
          <button
            onClick={handleAddWeekly}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Add Weekly Schedule
          </button>
        )}
      </div>

      {/* Modal for adding weekly schedules */}
      <Modal
        isOpen={showWeeklyModal}
        onClose={handleModalClose}
        title="Add Weekly Schedule"
      >
        <WeeklyScheduleForm
          onSuccess={handleSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      {/* Modal for editing a single shift */}
      <Modal
        isOpen={showEditModal}
        onClose={handleModalClose}
        title="Edit Shift"
      >
        {editingSchedule && (
          <EditScheduleForm
            schedule={editingSchedule}
            onSuccess={handleSuccess}
            onCancel={handleModalClose}
          />
        )}
      </Modal>

      {loading ? (
        <Spinner />
      ) : (
        <ScheduleView
          schedules={schedules}
          canManage={userRole === 'employer'}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}