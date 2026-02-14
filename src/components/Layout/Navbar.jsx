import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="font-bold text-xl">Invoice Scheduler</span>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                <Link to="/invoices" className="hover:bg-gray-700 px-3 py-2 rounded-md">Invoices</Link>
                <Link to="/schedules" className="hover:bg-gray-700 px-3 py-2 rounded-md">Schedules</Link>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span>{user?.email} ({userRole})</span>
            <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Logout</button>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-700">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/invoices" className="block hover:bg-gray-700 px-3 py-2 rounded-md">Invoices</Link>
          <Link to="/schedules" className="block hover:bg-gray-700 px-3 py-2 rounded-md">Schedules</Link>
          <div className="pt-4 border-t border-gray-700">
            <span className="block px-3 py-2">{user?.email} ({userRole})</span>
            <button onClick={handleLogout} className="block w-full text-left px-3 py-2 bg-red-600 rounded hover:bg-red-700">Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
}