import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import InvoiceTable from '../components/Invoices/InvoiceTable';
import InvoiceForm from '../components/Invoices/InvoiceForm';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('date', { ascending: false });
    if (!error) setInvoices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();

    const subscription = supabase
      .channel('invoices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, 
        () => fetchInvoices())
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      await supabase.from('invoices').delete().eq('id', id);
    }
  };

  const handleAdd = () => {
    setEditingInvoice(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingInvoice(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    fetchInvoices();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Invoice
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingInvoice ? 'Edit Invoice' : 'New Invoice'}
      >
        <InvoiceForm
          invoice={editingInvoice}
          onSuccess={handleSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      {loading ? (
        <Spinner />
      ) : (
        <InvoiceTable
          invoices={invoices}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}