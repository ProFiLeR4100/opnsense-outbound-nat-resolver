const express = require('express');
const app = express();
const router = express.Router();
const axios = require('axios');

const FIREWALL_QUERY_STATES_ENDPOINT = '/api/diagnostics/firewall/query_states';
const OPNSENSE_PROTO = process.env.OPNSENSE_PROTO;
const OPNSENSE_ADDR = process.env.OPNSENSE_ADDR;
const OPNSENSE_PORT = process.env.OPNSENSE_PORT;
const OPNSENSE_FULL_ADDRESS = `${OPNSENSE_PROTO}://${OPNSENSE_ADDR}:${OPNSENSE_PORT}`;
const OPNSENSE_API_KEY = process.env.OPNSENSE_API_KEY;
const OPNSENSE_API_SECRET = process.env.OPNSENSE_API_SECRET;
const AUTH_TOKEN = 'Basic ' + Buffer.from(OPNSENSE_API_KEY + ':' + OPNSENSE_API_SECRET).toString('base64');
const APP_PORT = process.env.APP_PORT;
const APP_API_KEY = process.env.APP_API_KEY;

app.use(express.json());

router.get('/*', async (req, res) => {
    await res.status(404).send('<html><h1 style="text-align: center; font-size: 210px">404</h1><h2 style="text-align: center;">Nobody here but us chickens</h2></html>');
});

router.post('/api/resolve', async (req, res) => {
    try {
        const {data: {address, port}, apiKey} = req.body;

        if (apiKey !== APP_API_KEY) {
            throw new Error("KEY_IS_INVALID");
        }

        const {data: states} = await axios.post(`${OPNSENSE_FULL_ADDRESS}${FIREWALL_QUERY_STATES_ENDPOINT}`, {
            "current": 1,
            "rowCount": 100,
            "sort": {},
            "searchPhrase": `${address}:${port}`
        }, {
            headers: {
                'Authorization': AUTH_TOKEN
            }
        });

        const result = {
            nat_addr: address,
            nat_port: port
        };

        const exactMatch = states.rows.find(row => {
            return row.direction === "out" &&
                row.src_addr === address &&
                row.src_port === port;
        });

        if (!exactMatch) {
            console.error(`${req.ip} requested to convert ${result.nat_addr}:${result.nat_port}, Error: SOURCE_IP_NOT_FOUND`);

            await res.status(404).json({
                error: "SOURCE_IP_NOT_FOUND"
            });
            return;
        }
        result.src_addr = exactMatch.nat_addr;
        result.src_port = exactMatch.nat_port;
        result.dst_addr = exactMatch.dst_addr;
        result.dst_port = exactMatch.dst_port;


        console.log(`${req.ip} requested to convert ${result.nat_addr}:${result.nat_port}, Result: ${result.src_addr}:${result.src_port}`);

        await res.status(200).json(result);
    } catch (e) {
        const {data: {address, port}} = req.body;
        console.error(`${req.ip} requested to convert ${address}:${port}, ${e}`);

        await res.status(500).json({
            error: e.message ?? e
        });
    }
});

app.use('/', router);

app.listen(APP_PORT, () => {
    console.log(`outbound-nat-resolver app listening on port ${APP_PORT}!`);
});