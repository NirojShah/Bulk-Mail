const nodemailer = require('nodemailer');
const Imap = require('imap');
const { inspect } = require('util');

// Create transporter for sending email
const transporter = nodemailer.createTransport({
    host: '192.168.201.119', // Replace with your SMTP server
    port: 25, // SMTP port (587 for TLS)
    secure: false, // Use false for TLS, true for SSL
    auth: {
      user: 'niroj@qugates.in', // Your email
      pass: '123456', // Your email password
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });
  

// IMAP configuration


// List of recipients
const recipients = [
  'koushik@qugates.in',
  'dev@qugates.in',
  'rajesh@qugates.in',
];

// Function to store email in the 'Sent' folder via IMAP
async function storeInSentFolder(emailData) {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
        user: 'niroj',
        password: '123456',
        host: '192.168.0.119',
        port: 143,
        tls: false
    });
      

    imap.once('ready', () => {
      imap.openBox('Sent', false, (err) => {
        if (err) {
          reject(err);
          return;
        }

        const message = [
          `From: ${emailData.from}`,
          `To: ${emailData.to}`,
          `Subject: ${emailData.subject}`,
          `Date: ${emailData.date}`,
          '',
          emailData.body,
        ].join('\n');

        // Append the email to the 'Sent' folder
        imap.append(message, { mailbox: 'Sent' }, (err) => {
          if (err) {
            console.log(err)
            reject(err);
            return;
          }
          console.log(`Stored email to ${emailData.to} in 'Sent' folder.`);
          imap.end();
          resolve();
        });
      });
    });

    imap.once('error', (err) => {
      reject(err);
    });

    imap.once('end', () => {
      console.log('IMAP connection ended');
    });

    imap.connect();
  });
}

// Function to send bulk emails
async function sendBulkEmails() {
    for (let i = 0; i < recipients.length; i++) {
      const mailOptions = {
        from: '"niroj" <niroj@qugates.in>', // Sender address
        to: recipients[i], // Recipient address
        subject: 'Bulk Email Subject', // Subject line
        text: 'Hello, this is a test bulk email!', // Plain text body
        html: '<b>Hello, this is a test bulk email!</b>', // HTML body
        messageId: `message-${i}@example.com`, // Custom messageId
        date: new Date().toUTCString(), // Date header
      };
  
      try {
        // Send email using nodemailer
        let info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipients[i]}: ${info.messageId}`);
  
        // Store the email in the 'Sent' folder
        await storeInSentFolder({
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          date: mailOptions.date,
          body: mailOptions.text,
        });
  
        // Add a 14-second delay between emails
        await sleep(14000); // 14 seconds delay
      } catch (error) {
        console.log(error)
        console.error(`Failed to send email to ${recipients[i]}: ${error.message}`);
      }
    }
  }
  

// Utility function to delay execution
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Start sending emails
sendBulkEmails();
