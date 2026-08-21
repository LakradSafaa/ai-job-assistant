const fs = require('fs');
const https = require('https');

const config = JSON.parse(
  fs.readFileSync('./france-travail.json', 'utf8')
);

const clientId = config['Identifiant client'];
const clientSecret = config['Clé secrète'];

const auth = Buffer
  .from(`${clientId}:${clientSecret}`)
  .toString('base64');

const body = 'grant_type=client_credentials&scope=o2dsoffre';

const request = https.request(
  {
    hostname: 'entreprise.francetravail.fr',
    path: '/connexion/oauth2/access_token?realm=/partenaire',
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
  },
  (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      console.log('AUTH HTTP:', response.statusCode);

      if (response.statusCode !== 200) {
        console.log(data);
        return;
      }

      const tokenData = JSON.parse(data);
      const token = tokenData.access_token;

      console.log('TOKEN OK ✅');
      console.log('Scope:', tokenData.scope);

      const api = https.request(
        {
          hostname: 'api.francetravail.io',
          path: '/partenaire/offresdemploi/v2/offres/search?motsCles=developpeur%20IA&range=0-4',
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
        (apiResponse) => {
          let result = '';

          apiResponse.on('data', (chunk) => {
            result += chunk;
          });

          apiResponse.on('end', () => {
            console.log('OFFRES HTTP:', apiResponse.statusCode);
            console.log('REPONSE:');
            console.log(result);
          });
        }
      );

      api.on('error', (error) => {
        console.log('API ERROR:', error.message);
      });

      api.end();
    });
  }
);

request.on('error', (error) => {
  console.log('AUTH ERROR:', error.message);
});

request.write(body);
request.end();