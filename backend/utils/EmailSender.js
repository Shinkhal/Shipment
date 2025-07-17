import nodemailer from 'nodemailer';

const { EMAIL_USER, EMAIL_PASS } = process.env;

const sendEmail = async ({ to, subject, text, html }) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error("❌ Missing EMAIL_USER or EMAIL_PASS in .env");
    return { success: false, error: "Missing SMTP credentials" };
  }

  if (!to || typeof to !== "string" || !to.includes("@")) {
    console.error("❌ Invalid or missing recipient email:", to);
    return { success: false, error: "No valid recipient email provided" };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"ShipNest" <${EMAIL_USER}>`,
    to,
    subject: subject || "No Subject",
    text: text || "",
    html: html || "",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export { sendEmail };
