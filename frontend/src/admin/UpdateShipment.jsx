import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {Package, Calendar, CreditCard, MapPin, Truck, Edit3, Save, Clock, Weight, Tag, User, Mail, Phone} from 'lucide-react';
import { useShipment } from '../context/ShipmentContext';
import { updateShipmentStatus } from '../services/AdminApi';
import AdminLayout from './layout/AdminLayout';

const statuses = [
  'Pending', 'Processing', 'Shipped', 'In Transit',
  'Delivered', 'Cancelled', 'Returned'
];

const UpdateShipment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getShipmentById,
    editShipment
  } = useShipment();

  const [shipment, setShipment] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [description, setDescription] = useState('');
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading]= useState(true);

  useEffect(() => {
    const found = getShipmentById(id);
    if (!found) {
      toast.error('Shipment not found in context');
      navigate('/admin/shipments');
    } else {
      setShipment(found);
      setNewStatus(found.status || '');
      setLoading(false);
    }
  }, [id, getShipmentById, navigate]);

  const handleUpdate = async () => {
    if (!newStatus.trim()) {
      toast.error('Please select a status');
      return;
    }

    setUpdating(true);
    try {
      await updateShipmentStatus(id, {
        status: newStatus,
        description: description.trim(),
      });

      editShipment(id, { status: newStatus });
      toast.success('Shipment status updated!');
      navigate('/admin/shipments');
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Delivered': 'bg-green-100 text-green-800 border-green-200',
      'In Transit': 'bg-blue-100 text-blue-800 border-blue-200',
      'Processing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
      'Pending': 'bg-gray-100 text-gray-800 border-gray-200',
      'Returned': 'bg-purple-100 text-purple-800 border-purple-200',
      'Shipped': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (addressObj) => {
    if (!addressObj) return 'N/A';
    return `${addressObj.address || ''}, ${addressObj.city || ''}, ${addressObj.state || ''} - ${addressObj.pincode || ''}`.replace(/^,\s*|,\s*$/g, '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Shipment Not Found</h2>
          <p className="text-gray-600 mb-4">The requested shipment could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>

    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Update Shipment</h1>
                <p className="text-gray-600 mt-1">Tracking ID: {shipment.trackingId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(shipment.status)}`}>
                {shipment.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-indigo-600" />
                Shipment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label>
                  <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded-lg">
                    {shipment.trackingId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(shipment.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(shipment.estimatedDelivery)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sender & Receiver Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sender Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Sender Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {shipment.sender?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <p className="text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {shipment.sender?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <p className="text-gray-900 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {shipment.sender?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Receiver Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-600" />
                  Receiver Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {shipment.receiver?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <p className="text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {shipment.receiver?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <p className="text-gray-900 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {shipment.receiver?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup & Delivery Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Address */}
              {shipment.pickup && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                    Pickup Address
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 leading-relaxed">
                      {formatAddress(shipment.pickup)}
                    </p>
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {shipment.delivery && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Delivery Address
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 leading-relaxed">
                      {formatAddress(shipment.delivery)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Package Information */}
            {shipment.package && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-indigo-600" />
                  Package Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{shipment.package.description || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                    <p className="text-gray-900 flex items-center">
                      <Weight className="w-4 h-4 mr-2 text-gray-400" />
                      {shipment.package.weight || 0} kg
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <p className="text-gray-900 flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-gray-400" />
                      {shipment.package.category || 'Others'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Service Information */}
            {shipment.service && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-indigo-600" />
                  Service Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                    <p className="text-gray-900">{shipment.service.type || 'Standard'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {shipment.service.pickupDate ? new Date(shipment.service.pickupDate).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                    <p className="text-gray-900 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {shipment.service.preferredTime || 'Anytime'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information */}
            {shipment.payment && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                  Payment Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{(shipment.payment.amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      shipment.payment.status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {shipment.payment.status || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <p className="text-gray-900">{shipment.payment.method || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                    <p className="text-gray-900 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                      {shipment.payment.transactionId || 'N/A'}
                    </p>
                  </div>
                  {shipment.payment.paidAt && (
                      <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Paid At</label>
                      <p className="text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(shipment.payment.paidAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status History */}
            {shipment.statusHistory && shipment.statusHistory.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                  Status History
                </h2>
                <div className="space-y-4">
                  {shipment.statusHistory.map((history, index) => (
                    <div key={index} className="border-l-4 border-indigo-200 pl-4 pb-4">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(history.status)}`}>
                          {history.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(history.timestamp)}
                        </span>
                      </div>
                      {history.description && (
                        <p className="text-gray-600 mt-2 text-sm">{history.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Update Status Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Edit3 className="w-5 h-5 mr-2 text-indigo-600" />
                Update Status
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Status
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Description (Optional)
                  </label>
                  <textarea
                    placeholder="Add a note about this status update..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleUpdate}
                  disabled={updating || newStatus === shipment.status}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                      updating || newStatus === shipment.status
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                    >
                  {updating ? (
                      <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                      <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Status
                    </>
                  )}
                </button>

                {newStatus === shipment.status && (
                    <p className="text-sm text-gray-500 text-center">
                    Status is already set to "{newStatus}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
                      </AdminLayout>
  );
};

export default UpdateShipment;