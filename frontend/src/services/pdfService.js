import jsPDF from 'jspdf';

export const generateShipmentPDF = (shipment) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  const primaryColor = [0, 0, 0];
  const grayColor = [100, 100, 100];

  const nextLine = (offset = 8) => yPos += offset;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('QUICKSHIP LOGISTICS', margin, yPos);
  nextLine(10);
  doc.setLineWidth(0.5);
  doc.setDrawColor(...grayColor);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  nextLine(10);

  // Title & Tracking ID
  doc.setFontSize(14);
  doc.text('SHIPMENT RECEIPT', margin, yPos);
  nextLine(8);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tracking ID: ${shipment.trackingId}`, margin, yPos);
  nextLine(10);

  // Start main container
  const boxTop = yPos;
  const boxLeft = margin;
  const boxWidth = pageWidth - 2 * margin;

  // Set font
  doc.setFontSize(11);

  const addField = (label, value) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, boxLeft + 5, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${value || 'N/A'}`, boxLeft + 50, yPos);
    nextLine(7);
  };

  // Sender Info
  doc.setFont('helvetica', 'bold');
  doc.text('Sender Information', boxLeft + 2, yPos);
  nextLine(6);
  addField('Name', shipment.sender.name);
  addField('Phone', shipment.sender.phone);
  addField('Email', shipment.sender.email);

  nextLine(3);
  doc.setFont('helvetica', 'bold');
  doc.text('Receiver Information', boxLeft + 2, yPos);
  nextLine(6);
  addField('Name', shipment.receiver.name);
  addField('Phone', shipment.receiver.phone);
  addField('Email', shipment.receiver.email);

  nextLine(3);
  doc.setFont('helvetica', 'bold');
  doc.text('Pickup Address', boxLeft + 2, yPos);
  nextLine(6);
  addField('Address', shipment.pickup.address);
  addField('City', shipment.pickup.city);
  addField('State', shipment.pickup.state);
  addField('Pincode', shipment.pickup.pincode);

  nextLine(3);
  doc.setFont('helvetica', 'bold');
  doc.text('Delivery Address', boxLeft + 2, yPos);
  nextLine(6);
  addField('Address', shipment.delivery.address);
  addField('City', shipment.delivery.city);
  addField('State', shipment.delivery.state);
  addField('Pincode', shipment.delivery.pincode);

  nextLine(3);
  doc.setFont('helvetica', 'bold');
  doc.text('Package Details', boxLeft + 2, yPos);
  nextLine(6);
  addField('Description', shipment.package.description);
  addField('Weight', `${shipment.package.weight} kg`);
  addField('Category', shipment.package.category);

  nextLine(3);
  doc.setFont('helvetica', 'bold');
  doc.text('Service Information', boxLeft + 2, yPos);
  nextLine(6);
  addField('Type', getServiceTypeDisplay(shipment.service.type));
  addField('Pickup Date', formatDate(shipment.service.pickupDate));
  addField('Preferred Time', shipment.service.preferredTime);
  addField('Status', shipment.status);
  addField('Created At', formatDate(shipment.createdAt));
  addField('ETA', formatDate(shipment.estimatedDelivery));

  // Draw border after content
  const boxHeight = yPos - boxTop + 5;
  doc.setDrawColor(...grayColor);
  doc.rect(boxLeft, boxTop - 3, boxWidth, boxHeight, 'S');

  nextLine(10);

  // Footer
  const footerY = 280;
  doc.setLineWidth(0.5);
  doc.setDrawColor(...grayColor);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('This is a computer-generated document.', margin, footerY + 6);
  doc.text(`Generated on: ${formatDateTime(new Date())}`, margin, footerY + 12);
  doc.text('Customer Service: 1800-QUICKSHIP | support@quickship.com', pageWidth - 130, footerY + 6);

  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`Shipment_${shipment.trackingId}_${timestamp}.pdf`);
};

// Helpers
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getServiceTypeDisplay = (type) => {
  const map = {
    Standard: 'Standard (3-5 days)',
    Express: 'Express (1-2 days)',
    SameDay: 'Same Day Delivery'
  };
  return map[type] || type || 'N/A';
};
