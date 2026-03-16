import express from 'express';
import {matchRouter} from "./routes/matches.js";
import http from "http";
import {attachWebSocketServer} from "./ws/server.js";
import {securityMiddleware} from "./arcjet.js";
import {commentaryRouter} from "./routes/commentary.js";

//creating port and host for http server
const PORT =Number(process.env.PORT || 8000);
const HOST=process.env.HOST || '0.0.0.0';

const app = express();
const server=http.createServer(app)

app.use(express.json());

//middleware arcjet=protecting all of our rest api
app.use(securityMiddleware());

app.get('/', (req, res) => {
    res.send('Hello From Express Server!');
});


//router
app.use('/matches',matchRouter);
app.use('/matches/:id/commentary',commentaryRouter);
//create http server

const {broadcastMatchCreated}=attachWebSocketServer(server);
app.locals.broadcastMatchCreated=broadcastMatchCreated;

server.listen(PORT, HOST,() => {
    const baseUrl=HOST==='0.0.0.0'?`http://localhost:${PORT}`:`http://${HOST}:${PORT}`;
    console.log(`Server started at ${baseUrl}`);
    //replace http server to ws server
    console.log(`Websocket server is running on ${baseUrl.replace('http','ws')}/ws`);
})
