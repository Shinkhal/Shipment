import { createContext, useContext, useState } from 'react';

const ShipmentContext = createContext();

export const ShipmentProvider = ({ children }) => {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Add a new shipment
  const addShipment = (shipment) => {
    setShipments((prev) => [...prev, shipment]);
  };

  // Update shipment status by ID
  const updateShipmentStatus = (id, newStatus) => {
    setShipments((prev) =>
      prev.map((shipment) =>
        shipment.id === id ? { ...shipment, status: newStatus } : shipment
      )
    );
  };

  // Delete shipment by ID
  const deleteShipment = (id) => {
    setShipments((prev) => prev.filter((shipment) => shipment.id !== id));
  };

  // Edit shipment by ID (update any field)
  const editShipment = (id, updatedFields) => {
    setShipments((prev) =>
      prev.map((shipment) =>
        shipment.id === id ? { ...shipment, ...updatedFields } : shipment
      )
    );
  };

  // Get shipment by ID
  const getShipmentById = (id) => {
    return shipments.find((shipment) => shipment.id === id);
  };

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        addShipment,
        selectedShipment,
        setSelectedShipment,
        updateShipmentStatus,
        deleteShipment,
        editShipment,
        getShipmentById,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
};

export const useShipment = () => {
  const context = useContext(ShipmentContext);
  if (!context) throw new Error('useShipment must be used within ShipmentProvider');
  return context;
};
