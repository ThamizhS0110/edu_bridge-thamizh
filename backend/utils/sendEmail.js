const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like 'Outlook365', 'SendGrid', etc.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, htmlContent) => {
    try {
        await transporter.sendMail({
            from: `"EduBridge" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent,
        });
        console.log('Email sent successfully to:', to);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;