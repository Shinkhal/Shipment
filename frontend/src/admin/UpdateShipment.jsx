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
      'Delivered': 'bg-success/20 text-success border-success/30',
      'In Transit': 'bg-blue-100 text-blue-700 border-blue-200',
      'Processing': 'bg-accent/20 text-accent border-accent/30',
      'Cancelled': 'bg-error/20 text-error border-error/30',
      'Pending': 'bg-textSecondary/20 text-textSecondary border-textSecondary/30',
      'Returned': 'bg-purple-100 text-purple-700 border-purple-200',
      'Shipped': 'bg-primary/20 text-primary border-primary/30'
    };
    return colors[status] || 'bg-textSecondary/20 text-textSecondary border-textSecondary/30';
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
      <AdminLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-textSecondary">Loading shipment details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!shipment) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-textPrimary mb-2">Shipment Not Found</h2>
            <p className="text-textSecondary mb-4">The requested shipment could not be found.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-surface shadow-card border-b border-border mb-6">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div>
                  <h1 className="text-3xl font-bold text-textPrimary">Update Shipment</h1>
                  <p className="text-textSecondary mt-1">Tracking ID: {shipment.trackingId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-medium border ${getStatusColor(shipment.status)}`}>
                  {shipment.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipment Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-surface rounded-2xl shadow-card border border-border p-6">
                <h2 className="text-xl font-semibold text-textPrimary mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-primary" />
                  Shipment Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Tracking ID</label>
                    <p className="text-textPrimary font-mono bg-background px-3 py-2 rounded-xl">
                      {shipment.trackingId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Current Status</label>
                    <span className={`inline-flex px-3 py-1 rounded-xl text-sm font-medium ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Created Date</label>
                    <p className="text-textPrimary flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-textSecondary" />
                      {formatDate(shipment.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Estimated Delivery</label>
                    <p className="text-textPrimary flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-textSecondary" />
                      {formatDate(shipment.estimatedDelivery)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sender & Receiver Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sender Details */}
                <div className="bg-surface rounded-2xl shadow-card border border-border p-6">
                  <h2 className="text-lg font-semibold text-textPrimary mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    Sender Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Full Name</label>
                      <p className="text-textPrimary flex items-center">
                        <User className="w-4 h-4 mr-2 text-textSecondary" />
                        {shipment.sender?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Email Address</label>
                      <p className="text-textPrimary flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-textSecondary" />
                        {shipment.sender?.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Phone Number</label>
                      <p className="text-textPrimary flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-textSecondary" />
                        {shipment.sender?.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Receiver Details */}
                <div className="bg-surface rounded-2xl shadow-card border border-border p-6">
                  <h2 className="text-lg font-semibold text-textPrimary mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-success" />
                    Receiver Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Full Name</label>
                      <p className="text-textPrimary flex items-center">
                        <User className="w-4 h-4 mr-2 text-textSecondary" />
                        {shipment.receiver?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Email Address</label>
                      <p className="text-textPrimary flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-textSecondary" />
                        {shipment.receiver?.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Phone Number</label>
                      <p className="text-textPrimary flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-textSecondary" />
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
                  <div className="bg-surface rounded-2xl shadow-card border border-border p-6">
                    <h2 className="text-lg font-semibold text-textPrimary mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-primary" />
                      Pickup Address
                    </h2>
                    <div className="bg-background p-4 rounded-xl">
                      <p className="text-textPrimary leading-relaxed">
                        {formatAddress(shipment.pickup)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                {shipment.delivery && (
                  <div className="bg-surface rounded-2xl shadow-card border border-border p-6">
                    <h2 className="text-lg font-semibold text-textPrimary mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-success" />
                      Delivery Address
                    </h2>
                    <div className="bg-background p-4 rounded-xl">
                      <p className="text-textPrimary leading-relaxed">
                        {formatAddress(shipment.delivery)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Package Information */}
              {shipment.package && (
                <div className="bg-surface rounded-2xl shadow-card border border-border p-6">
                  <h2 className="text-xl font-semibold text-textPrimary mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-primary" />
                    Package Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Description</label>
                      <p className="text-textPrimary">{shipment.package.description || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Weight</label>
                      <p className="text-textPrimary flex items-center">
                        <Weight className="w-4 h-4 mr-2 text-textSecondary" />
                        {shipment.package.weight || 0} kg
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Category</label>
                      <p className="text-textPrimary flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-textSecondary" />
                        {shipment.package.category || 'Others'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Information */}
              {shipment.service && (
                <div className="bg-surface rounded-2xl shadow-card border border-border p-6">
                  <h2 className="text-xl font-semibold text-textPrimary mb-4 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-primary" />
                    Service Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Service Type</label>
                      <p className="text-textPrimary">{shipment.service.type || 'Standard'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Pickup Date</label>
                      <p className="text-textPrimary flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-textSecondary" />
                        {shipment.service.pickupDate ? new Date(shipment.service.pickupDate).toLocaleDateString('en-IN') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Preferred Time</label>
                      <p className="text-textPrimary flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-textSecondary" />
                        {shipment.service.preferredTime || 'Anytime'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {shipment.payment && (
                <div className="bg-surface rounded-2xl shadow-card border border-border p-6">
                  <h2 className="text-xl font-semibold text-textPrimary mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-primary" />
                    Payment Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Amount</label>
                      <p className="text-2xl font-bold text-success">
                        ₹{(shipment.payment.amount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Payment Status</label>
                      <span className={`inline-flex px-3 py-1 rounded-xl text-sm font-medium ${
                        shipment.payment.status === 'Paid' 
                          ? 'bg-success/20 text-success' 
                          : 'bg-accent/20 text-accent'
                      }`}>
                        {shipment.payment.status || 'Pending'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Payment Method</label>
                      <p className="text-textPrimary">{shipment.payment.method || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Transaction ID</label>
                      <p className="text-textPrimary font-mono text-sm bg-background px-2 py-1 rounded-xl">
                        {shipment.payment.transactionId || 'N/A'}
                      </p>
                    </div>
                    {shipment.payment.paidAt && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Paid At</label>
                        <p className="text-textPrimary flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-textSecondary" />
                          {formatDate(shipment.payment.paidAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status History */}
              {shipment.statusHistory && shipment.statusHistory.length > 0 && (
                <div className="bg-surface rounded-2xl shadow-card border border-border p-6">
                  <h2 className="text-xl font-semibold text-textPrimary mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-primary" />
                    Status History
                  </h2>
                  <div className="space-y-4">
                    {shipment.statusHistory.map((history, index) => (
                      <div key={index} className="border-l-4 border-primary/20 pl-4 pb-4">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex px-3 py-1 rounded-xl text-sm font-medium ${getStatusColor(history.status)}`}>
                            {history.status}
                          </span>
                          <span className="text-sm text-textSecondary">
                            {formatDate(history.timestamp)}
                          </span>
                        </div>
                        {history.description && (
                          <p className="text-textSecondary mt-2 text-sm">{history.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Update Status Panel */}
            <div className="lg:col-span-1">
              <div className="bg-surface rounded-2xl shadow-card border border-border p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-textPrimary mb-4 flex items-center">
                  <Edit3 className="w-5 h-5 mr-2 text-primary" />
                  Update Status
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">
                      Select New Status
                    </label>
                    <select
                      className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-textPrimary"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">
                      Update Description (Optional)
                    </label>
                    <textarea
                      placeholder="Add a note about this status update..."
                      className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-textPrimary"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleUpdate}
                    disabled={updating || newStatus === shipment.status}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all ${
                      updating || newStatus === shipment.status
                        ? 'bg-textSecondary/20 text-textSecondary cursor-not-allowed'
                        : 'bg-primary text-surface hover:bg-primary/90 shadow-card'
                    }`}
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-surface mr-2"></div>
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
                    <p className="text-sm text-textSecondary text-center">
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