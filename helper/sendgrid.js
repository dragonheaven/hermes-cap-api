const rp = require('request-promise');
const { env, sendgridApiUrl, sendgridApiKey } = require('../config/vars');

exports.addContact = async (data) => {
  if (env === 'development') return;

  const options = {
    uri: `${sendgridApiUrl}/marketing/contacts`,
    method: 'put',
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`
    },
    body: {
      list_ids: [data.listId],
      contacts: [
        {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email
        }
      ]
    },
    json: true // Automatically parses the JSON string in the response
  };

  rp(options)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.sendConfirmationEmail = data => new Promise((resolve, reject) => {
  if (env === 'development') resolve({ status: true });

  const options = {
    uri: `${sendgridApiUrl}/mail/send`,
    method: 'post',
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`
    },
    body: {
      personalizations: [
        {
          to: [
            {
              email: data.to
            }
          ],
          dynamic_template_data: {
            first_name: data.firstName,
            last_name: data.lastName,
            confirm_url: data.confirmUrl,
            Sender_Name: 'ArbTitan',
            Sender_Address: '37 LONDON DR EAST BRUNSWICK',
            Sender_Zip: '08816'
          }
        }
      ],
      from: {
        email: 'Support@ArbTitan.com'
      },
      template_id: 'd-8b5059cfd93a4e8d9287154e1081ab30'
    },
    json: true // Automatically parses the JSON string in the response
  };

  rp(options)
    .then((result) => {
      console.log(result);
      resolve({ status: true });
    })
    .catch((err) => {
      console.log(err);
      reject(err);
    });
});

exports.sendPasswordResetEmail = data => new Promise((resolve, reject) => {
  if (env === 'development') resolve({ status: true });

  const options = {
    uri: `${sendgridApiUrl}/mail/send`,
    method: 'post',
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`
    },
    body: {
      personalizations: [
        {
          to: [
            {
              email: data.to
            }
          ],
          dynamic_template_data: {
            first_name: data.firstName,
            last_name: data.lastName,
            confirm_url: data.confirmUrl,
            Sender_Name: 'ArbTitan',
            Sender_Address: '37 LONDON DR EAST BRUNSWICK',
            Sender_Zip: '08816'
          }
        }
      ],
      from: {
        email: 'Support@ArbTitan.com'
      },
      template_id: 'd-55814a05ea9b4a9c825f056c0f52b31a'
    },
    json: true // Automatically parses the JSON string in the response
  };

  rp(options)
    .then((result) => {
      console.log(result);
      resolve({ status: true });
    })
    .catch((err) => {
      console.log(err);
      reject(err);
    });
});
