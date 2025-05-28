const axios = require('axios');
const sgMail = require('@sendgrid/mail');
const { sendBugReport } = require('./slack.js');
const logger = require('../config/logger');
const config = require('../config/config.js');

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

sgMail.setApiKey(config.email.sendgridApiKey);

const sendDynamicMail = async (
  templateId,
  templateData,
  toEmail,
  attachments = [],
  subject = null,
  fromEmail = config.email.fromEmail,
  fromName = config.email.fromName,
) => {
  let mailData = {
    from: { email: fromEmail, name: fromName },
    personalizations: [
      {
        to: [
          {
            email: toEmail,
          },
        ],
        dynamic_template_data: {
          ...templateData,
          unsubscribe: `${config.frontend_url}/unsubscribe/${toEmail}`,
        },
      },
    ],
    subject,
    attachments,
    template_id: templateId,
  };

  axios.post(`https://api.sendgrid.com/v3/mail/send`, mailData, {
    headers: { Authorization: `Bearer ${config.email.sendgridApiKey}` },
  });
};

const sendTextMail = async (
  toEmail,
  subject,
  html,
  attachments = [],
  fromEmail = config.email.fromEmail,
  fromName = config.email.fromName,
) => {
  try {
    const result = await sgMail.send({
      to: toEmail,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject: subject,
      html: html,
      attachments,
    });

    return result;
  } catch (error) {
    try {
      if (validateEmail(toEmail)) {
        await sendBugReport('Error while sending mail', [], error);
      }
      logger.error(
        `Error while sending mail: toEmail: ${toEmail}, fromEmail: ${fromEmail}, fromName: ${fromName}, 
        error: ${JSON.stringify(error)}`,
      );
    } catch (logError) {
      console.error('Error logging the email error:', logError);
    }
  }
};

module.exports = {
  sendDynamicMail,
  sendTextMail,
};
