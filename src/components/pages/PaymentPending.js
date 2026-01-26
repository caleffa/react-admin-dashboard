import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Home } from 'lucide-react';

const PaymentPending = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="flex justify-center mb-6">
          <Clock className="w-16 h-16 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Pago Pendiente
        </h1>
        <p className="text-gray-600 mb-6">
          Tu pago está siendo procesado. Te notificaremos cuando se complete.
        </p>
        <Link
          to="/MemberDashboard/Dashboard"
          className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Home className="w-5 h-5 mr-2" />
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentPending;