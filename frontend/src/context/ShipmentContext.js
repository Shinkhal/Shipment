import { createContext, useContext, useState } from 'react';

const ShipmentContext = createContext();

export const ShipmentProvider = ({ children }) => {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);

  const addShipment = (shipment) => {
    setShipments((prev) => [...prev, shipment]);
  };

  const updateShipmentStatus = (id, newStatus) => {
    setShipments((prev) =>
      prev.map((shipment) =>
        shipment.id === id ? { ...shipment, status: newStatus } : shipment
      )
    );
  };

  const deleteShipment = (id) => {
    setShipments((prev) => prev.filter((shipment) => shipment.id !== id));
  };

  const editShipment = (id, updatedFields) => {
    setShipments((prev) =>
      prev.map((shipment) =>
        shipment.id === id ? { ...shipment, ...updatedFields } : shipment
      )
    );
  };

  const getShipmentById = (id) => {
    return shipments.find((shipment) => shipment.id === id);
  };

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        setShipments,           // ✅ Expose this so we can use it directly in components
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
