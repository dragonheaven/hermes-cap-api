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

exports.subscribeNewsletter = async (data) => {
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
            Sender_Name: 'Hermes Team',
            Sender_Address: '45 Boulevard Victor hugo clichy',
            Sender_Zip: '92110 FRA'
          }
        }
      ],
      from: {
        email: data.from
      },
      template_id: 'd-73abab273658462aac30a9ee6817e422'
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
            Sender_Name: 'Hermes Team',
            Sender_Address: '45 Boulevard Victor hugo clichy',
            Sender_Zip: '92110 FRA'
          }
        }
      ],
      from: {
        email: data.from
      },
      template_id: 'd-865f4241ea234d36a3f7184ea8aa64c6'
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
