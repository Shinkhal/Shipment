import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getActiveShipments } from '../services/api';
import { useShipment } from '../context/ShipmentContext';
import { useNavigate } from 'react-router-dom';

const ActiveShipments = () => {
  const { user, loading: authLoading } = useAuth();
  const {setSelectedShipment} = useShipment();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    in_transit: 'bg-indigo-100 text-indigo-800'
  };

  const statusIcons = {
    pending: '⏳',
    processing: '⚙️',
    shipped: '📦',
    in_transit: '🚚'
  };

    useEffect(() => {
    const fetchActiveShipments = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('Shipmenttoken');
        if (!token) {
          throw new Error('Authentication required. Please log in again.');
        }

        const response = await getActiveShipments(token);
        setShipments(response.data || []);
      } catch (err) {
        console.error('Error fetching active shipments:', err);
        
        let errorMessage = 'Something went wrong while fetching active shipments.';
        
        if (err.response?.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Access denied. You don\'t have permission to view this data.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setShipments([]);
      } finally {
        setLoading(false);
      }
    };
    if (authLoading || !user) return;
    fetchActiveShipments();
  }, [authLoading, user]);

  const handleDetailsClick = (shipment) => {
  setSelectedShipment(shipment);
  navigate('/details');
};


  const getDaysUntilDelivery = (estimatedDelivery) => {
    const deliveryDate = new Date(estimatedDelivery);
    const today = new Date();
    const diffTime = deliveryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-800 text-center">
          <h3 className="font-semibold">Error</h3>
          <p className="mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Active Shipments</h1>
          <p className="text-gray-600 mt-1">Track your ongoing deliveries</p>
        </div>
      </div>

      {shipments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Shipments</h3>
          <p className="text-gray-600">All your shipments have been delivered or completed.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shipments.map((shipment) => {
            const daysUntilDelivery = getDaysUntilDelivery(shipment.estimatedDelivery);
            return (
              <div key={shipment.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        #{shipment.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {shipment.senderName || 'Unknown Sender'} → {shipment.receiverName || 'Unknown Receiver'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[shipment.status]}`}>
                      {statusIcons[shipment.status]} {shipment.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Weight:</span>
                      <span className="font-medium">{shipment.weight || 'N/A'} kg</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery in:</span>
                      <span className={`font-medium ${daysUntilDelivery <= 1 ? 'text-red-600' : daysUntilDelivery <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {daysUntilDelivery > 0 ? `${daysUntilDelivery} days` : 'Overdue'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">From:</span>
                      <span className="font-medium text-right">{shipment.pickup.city || 'Unknown'}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">To:</span>
                      <span className="font-medium text-right">{shipment.delivery.city || 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Created: {new Date(shipment.createdAt).toLocaleDateString()}</span>
                      <span>ETA: {new Date(shipment.estimatedDelivery).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                      Track
                    </button>
                    <button 
  onClick={() => handleDetailsClick(shipment)} 
  className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
>
  Details
</button>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {shipments.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {shipments.length} active shipment{shipments.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default ActiveShipments;