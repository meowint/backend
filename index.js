const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const { port, projectId, packageName } = require('./config.json');

const app = express();

app.use(bodyParser.json());

const serviceJSON = './service_account.json';

const jwtClient = new JWT({
	keyFile: serviceJSON,
	scopes: ['https://www.googleapis.com/auth/playintegrity']
})

app.post('/verify', async (req, res) => {
	const token = req.body.token;
	if (!token) return res.sendStatus(400);
	try {
		await jwtClient.authorize();

		const integrity = google.playintegrity({
			version: 'v1',
			auth: jwtClient
		});

		const response = await integrity.v1.decodeIntegrityToken({
			packageName: packageName,
			requestBody: {
				integrityToken: token
			}
		})
		res.json(response.data.tokenPayloadExternal)
	} catch (e) {
		console.error(e)
		res.sendStatus(500)
	}
})

app.listen(port, () => {
	console.log(`MeowIntegrity backend running on ${port}`)
})