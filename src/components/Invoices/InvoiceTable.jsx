import { Pencil, Trash2 } from 'lucide-react';

export default function InvoiceTable({ invoices, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount ($)</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.supplier_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{invoice.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                ${parseFloat(invoice.dollar_amount).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-3">
                <button
                  onClick={() => onEdit(invoice)}
                  className="text-indigo-600 hover:text-indigo-900 transition-colors"
                  title="Edit"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => onDelete(invoice.id)}
                  className="text-red-600 hover:text-red-900 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {invoices.length === 0 && (
        <div className="text-center py-8 text-gray-500">No invoices yet.</div>
      )}
    </div>
  );
}