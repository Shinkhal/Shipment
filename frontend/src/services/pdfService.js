import jsPDF from 'jspdf';

// === Helpers ===
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
    Standard: 'Standard (3–5 days)',
    Express: 'Express (1–2 days)',
    SameDay: 'Same Day Delivery'
  };
  return map[type] || type || 'N/A';
};

export const generateShipmentPDF = (shipment) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Tailwind Style Color Palette
  const colors = {
    primary: [26, 30, 46],       // #1A1E2E
    accent: [224, 198, 138],     // #E0C68A
    background: [241, 243, 245], // #F1F3F5
    surface: [255, 255, 255],    // #FFFFFF
    textPrimary: [17, 17, 17],   // #111111
    textSecondary: [107, 114, 128], // #6B7280
    border: [229, 231, 235],     // #E5E7EB
  };

  const nextLine = (offset = 8) => yPos += offset;

  // === Header ===
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('ShipNest', margin, yPos);
  nextLine(10);
  doc.setLineWidth(0.5);
  doc.setDrawColor(...colors.border);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  nextLine(10);

  // === Receipt Title ===
  doc.setFontSize(14);
  doc.setTextColor(...colors.accent);
  doc.text('SHIPMENT RECEIPT', margin, yPos);
  nextLine(8);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textPrimary);
  doc.text(`Tracking ID: ${shipment.trackingId}`, margin, yPos);
  nextLine(10);

  // === Draw background rectangle BEFORE writing inner fields ===

  const boxTop = yPos;
  const boxLeft = margin;
  const boxWidth = pageWidth - 2 * margin;

  // Helper functions to track height for accurate background rect
  let fieldHeights = [];

  const addSectionTitle = (title) => {
    fieldHeights.push(6);
  };

  const addField = (label, value) => {
    fieldHeights.push(7);
  };

  // --- Simulate content to calculate height needed ---
  addSectionTitle('Sender Information');
  addField('Name');
  addField('Phone');
  addField('Email');

  fieldHeights.push(3); // Spacer before next section

  addSectionTitle('Receiver Information');
  addField('Name');
  addField('Phone');
  addField('Email');

  fieldHeights.push(3);

  addSectionTitle('Pickup Address');
  addField('Address');
  addField('City');
  addField('State');
  addField('Pincode');

  fieldHeights.push(3);

  addSectionTitle('Delivery Address');
  addField('Address');
  addField('City');
  addField('State');
  addField('Pincode');

  fieldHeights.push(3);

  addSectionTitle('Package Details');
  addField('Description');
  addField('Weight');
  addField('Category');

  fieldHeights.push(3);

  addSectionTitle('Service Information');
  addField('Type');
  addField('Pickup Date');
  addField('Preferred Time');
  addField('Status');
  addField('Created At');
  addField('ETA');

  // Calculate total content height
  const totalContentHeight = fieldHeights.reduce((a, b) => a + b, 0);
  const boxHeight = totalContentHeight + 10; // +10 for some padding

  // Draw rectangle first
  doc.setDrawColor(...colors.border);
  doc.setFillColor(...colors.background);
  doc.rect(boxLeft, boxTop - 3, boxWidth, boxHeight, 'FD');

  // --- Now render content properly ---
  yPos = boxTop;

  // Render section helpers for real output
  const realAddSectionTitle = (title) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...colors.primary);
    doc.text(title, boxLeft + 2, yPos);
    nextLine(6);
  };

  const realAddField = (label, value) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.textSecondary);
    doc.text(`${label}:`, boxLeft + 5, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.textPrimary);
    doc.text(`${value || 'N/A'}`, boxLeft + 50, yPos);

    nextLine(7);
  };

  // Sender Info
  realAddSectionTitle('Sender Information');
  realAddField('Name', shipment.sender.name);
  realAddField('Phone', shipment.sender.phone);
  realAddField('Email', shipment.sender.email);

  nextLine(3);
  realAddSectionTitle('Receiver Information');
  realAddField('Name', shipment.receiver.name);
  realAddField('Phone', shipment.receiver.phone);
  realAddField('Email', shipment.receiver.email);

  nextLine(3);
  realAddSectionTitle('Pickup Address');
  realAddField('Address', shipment.pickup.address);
  realAddField('City', shipment.pickup.city);
  realAddField('State', shipment.pickup.state);
  realAddField('Pincode', shipment.pickup.pincode);

  nextLine(3);
  realAddSectionTitle('Delivery Address');
  realAddField('Address', shipment.delivery.address);
  realAddField('City', shipment.delivery.city);
  realAddField('State', shipment.delivery.state);
  realAddField('Pincode', shipment.delivery.pincode);

  nextLine(3);
  realAddSectionTitle('Package Details');
  realAddField('Description', shipment.package.description);
  realAddField('Weight', `${shipment.package.weight} kg`);
  realAddField('Category', shipment.package.category);

  nextLine(3);
  realAddSectionTitle('Service Information');
  realAddField('Type', getServiceTypeDisplay(shipment.service.type));
  realAddField('Pickup Date', formatDate(shipment.service.pickupDate));
  realAddField('Preferred Time', shipment.service.preferredTime);
  realAddField('Status', shipment.status);
  realAddField('Created At', formatDate(shipment.createdAt));
  realAddField('ETA', formatDate(shipment.estimatedDelivery));

  // === Footer ===
  const footerY = 280;
  doc.setDrawColor(...colors.border);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFontSize(8);
  doc.setTextColor(...colors.textSecondary);
  doc.text('This is a computer-generated document.', margin, footerY + 6);
  doc.text(`Generated on: ${formatDateTime(new Date())}`, margin, footerY + 12);
  doc.text(
    'Customer Service: 1800-ShipNest | support@ShipNest.com', 
    pageWidth - 130, 
    footerY + 6
  );

  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`Shipment_${shipment.trackingId}_${timestamp}.pdf`);
};
