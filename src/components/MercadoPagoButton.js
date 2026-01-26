// frontend/src/components/MercadoPagoButton.jsx
import React, { useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { CreditCard, Loader2, ExternalLink } from 'lucide-react';
 
// Inicializar MercadoPago
//initMercadoPago(process.env.MERCADOPAGO_PUBLIC_KEY, {
initMercadoPago(process.env.MERCADOPAGO_PUBLIC_KEY || 'APP_USR-0218939b-f018-4705-9208-342565a19464', {
  locale: 'es-AR'
});

const MercadoPagoButton = ({ 
  paymentData, 
  memberId, 
  onPaymentSuccess 
}) => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // URL del backend
  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  const FRONTEND_URL = window.location.origin;

  const createPaymentPreference = async () => {
    setLoading(true);
    setError(null);
    
    try {
      //console.log('🔄 Creando preferencia...');
      //console.log('Frontend URL:', FRONTEND_URL);
      
      // Datos del pago
      const paymentRequest = {
        items: [{
          id: `payment-${memberId}-${Date.now()}`,
          title: `Cuota Mensual - ${paymentData.clubName || 'Club'}`,
          description: `Pago de cuota para ${paymentData.memberName || 'Socio'}`,
          unit_price: Number(paymentData.amount) || 1000,
          quantity: 1,
          currency_id: paymentData.currency || 'ARS',
          category_id: 'membership'
        }],
        payer: {
          name: paymentData.memberName || 'Cliente',
          surname: paymentData.memberLastName || '',
          email: paymentData.memberEmail || 'test_user_123456@testuser.com',
          identification: {
            type: 'DNI',
            number: paymentData.memberDNI || '9999999'
          }
        },
        // 🔹 URLs ABSOLUTAS - Muy importantes
        back_urls: {
          success: `${FRONTEND_URL}/payment/success?memberId=${memberId}`,
          failure: `${FRONTEND_URL}/payment/failure?memberId=${memberId}`,
          pending: `${FRONTEND_URL}/payment/pending?memberId=${memberId}`
        },
        //notification_url: `http://localhost:3000/api/payments/webhook`,
        //notification_url: `https://cristin-nonengrossing-filomena.ngrok-free.dev/api/payments/webhook`,
        external_reference: `member-${memberId}-${Date.now()}`,
        //auto_return: "approved", // Solo funciona si back_urls.success está definido
      };

      const response = await fetch(`${BACKEND_URL}/payments/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest)
      });

      const data = await response.json();
      console.log('📥 Respuesta del backend:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error ${response.status}`);
      }

      if (data.id) {
        setPreferenceId(data.id);
      } else {
        throw new Error('No se recibió un ID de preferencia válido');
      }
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(`Error: ${err.message}. Verifica que las URLs estén configuradas correctamente.`);
    } finally {
      setLoading(false);
    }
  };

  // Botón para probar URLs
  const TestUrlsButton = () => (
    <button
      onClick={async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/payments/test-urls`);
          const data = await response.json();
          console.log('🔗 URLs del backend:', data);
          alert(`URLs configuradas:\n\nFrontend: ${data.urls.frontend}\nSuccess: ${data.urls.success}`);
        } catch (err) {
          console.error('Error probando URLs:', err);
        }
      }}
      className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
    >
      <ExternalLink size={12} className="mr-1" />
      Probar URLs del backend
    </button>
  );

  if (error) {
    return (
      <div className="text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <p className="text-red-600 font-medium">Error de configuración</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <p className="text-gray-500 text-xs mt-2">
            URL actual: {FRONTEND_URL}
          </p>
        </div>
        
        <TestUrlsButton />
        
        <div className="mt-3 space-y-2">
          <button
            onClick={createPaymentPreference}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Reintentar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  if (preferenceId) {
    return (
      <div className="w-full">
        <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">
            <span className="font-medium">¡Listo!</span> Ahora completa el pago
          </p>
          <p className="text-xs text-green-600 mt-1">
            Serás redirigido a MercadoPago para finalizar
          </p>
        </div>
        
        <Wallet 
          initialization={{ preferenceId }}
          customization={{
            texts: {
              valueProp: 'smart_option'
            },
            visual: {
              buttonBackground: '#009ee3',
              borderRadius: '6px',
              height: '48px'
            }
          }}
        />
        
        <div className="mt-3 text-center">
          <button
            onClick={() => setPreferenceId(null)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </button>
          <TestUrlsButton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={createPaymentPreference}
        disabled={loading}
        className={`w-full px-4 py-3 rounded-lg font-medium transition duration-200 inline-flex items-center justify-center ${
          loading
            ? 'bg-gray-400 cursor-not-allowed text-gray-700'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Generando enlace de pago...
          </>
        ) : (
          <>
            <CreditCard size={18} className="mr-2" /> 
            Pagar {paymentData.currency || '$'} {paymentData.amount || '0.00'}
          </>
        )}
      </button>
      
      <div className="mt-2 text-center">
        <TestUrlsButton />
      </div>
      
      {/* Información de depuración (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-3 text-xs text-gray-500">
          <p>Debug info:</p>
          <p>• Backend: {BACKEND_URL}</p>
          <p>• Frontend: {FRONTEND_URL}</p>
        </div>
      )}
    </div>
  );
};



export default MercadoPagoButton;