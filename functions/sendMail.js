const nodemailer = require('nodemailer');

/**
 * Netlify/Firebase Function: sendMail
 *
 * Sends an email using Zoho Mail’s SMTP service.  You must configure
 * `ZOHOMAIL_USER` and `ZOHOMAIL_PASS` environment variables.  The request
 * body should be JSON with `to`, `subject` and `text` fields.
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const user = process.env.ZOHOMAIL_USER;
  const pass = process.env.ZOHOMAIL_PASS;
  if (!user || !pass) {
    return { statusCode: 500, body: 'Email credentials not configured' };
  }
  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON body' };
  }
  const { to, subject, text } = payload;
  if (!to || !subject || !text) {
    return { statusCode: 400, body: 'Missing to, subject or text' };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });
    const info = await transporter.sendMail({
      from: user,
      to,
      subject,
      text,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent', id: info.messageId }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};