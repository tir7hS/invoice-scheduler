import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

// Predefined supplier list
const SUPPLIERS = [
  'CoreMark',
  'Milk',
  'Pepsi Co',
  'Coca Cola Co',
  'SRP',
  'Prime',
  'Fritolay',
  'Bimbo',
  'Beer Store',
  'Lcbo',
  'BEER_WINE_3rd_Party',
  'Smokes',
  'Other'
];

export default function InvoiceForm({ invoice, onSuccess, onCancel }) {
  const [date, setDate] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [customSupplier, setCustomSupplier] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dollarAmount, setDollarAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When editing, prefill the form
  useEffect(() => {
    if (invoice) {
      setDate(invoice.date);
      // Check if the supplier is in the list, otherwise set to "Other" and fill custom
      if (SUPPLIERS.includes(invoice.supplier_name)) {
        setSupplierName(invoice.supplier_name);
        setCustomSupplier('');
      } else {
        setSupplierName('Other');
        setCustomSupplier(invoice.supplier_name);
      }
      setQuantity(invoice.quantity);
      setDollarAmount(invoice.dollar_amount);
    }
  }, [invoice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Determine final supplier name
    const finalSupplier = supplierName === 'Other' ? customSupplier : supplierName;

    // Validate if "Other" is selected but custom field is empty
    if (supplierName === 'Other' && !customSupplier.trim()) {
      setError('Please enter a custom supplier name.');
      setLoading(false);
      return;
    }

    const invoiceData = {
      date,
      supplier_name: finalSupplier,
      quantity: parseInt(quantity),
      dollar_amount: parseFloat(dollarAmount),
    };

    let error;
    if (invoice) {
      // Update
      const { error: updateError } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', invoice.id);
      error = updateError;
    } else {
      // Insert
      const { error: insertError } = await supabase
        .from('invoices')
        .insert([invoiceData]);
      error = insertError;
    }

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      onSuccess();
    }
  };

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
        <select
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="" disabled>Select a supplier</option>
          {SUPPLIERS.map((supplier) => (
            <option key={supplier} value={supplier}>{supplier}</option>
          ))}
        </select>
      </div>

      {supplierName === 'Other' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom Supplier Name</label>
          <input
            type="text"
            value={customSupplier}
            onChange={(e) => setCustomSupplier(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter supplier name"
            required={supplierName === 'Other'}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dollar Amount</label>
        <input
          type="number"
          step="0.01"
          value={dollarAmount}
          onChange={(e) => setDollarAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
          min="0"
        />
      </div>

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
          {loading ? 'Saving...' : invoice ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}