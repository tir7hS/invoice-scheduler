import { Pencil, Trash2 } from 'lucide-react'; // optional icons, or use text buttons

export default function InvoiceRow({ invoice, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2 border">{invoice.date}</td>
      <td className="px-4 py-2 border">{invoice.supplier_name}</td>
      <td className="px-4 py-2 border text-right">{invoice.quantity}</td>
      <td className="px-4 py-2 border text-right">
        ${parseFloat(invoice.dollar_amount).toFixed(2)}
      </td>
      <td className="px-4 py-2 border text-center space-x-2">
        <button
          onClick={() => onEdit(invoice)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => onDelete(invoice.id)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
}