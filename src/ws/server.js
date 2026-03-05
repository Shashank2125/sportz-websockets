import {WebSocket} from 'ws';
function sendJson(socket,payload){
    if(socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));

}

function broadcast(wss,payload){
    for (const client in wss.clients){
        if(client.readyState !== WebSocket.OPEN)return;
        client.send(JSON.stringify(payload));
    }
}

export function attachWebSocketServer(server){
    const wss=new WebSocket({
        server,//http server from express so the websocket can attach itself
        //to the server avoiding seperate port for wss
        path:'/ws',//seperate traffic for ws
        maxPayload:1024 * 1024
    });
    wss.on('connection',(socket)=>{
        sendJson(socket,{type:'welcome'});

        socket.on('error',console.error);
    });
    function broadcastMatchCreated(match){
        broadcast(wss,{type: 'match_created', data:match});
    }
    return {broadcastMatchCreated}
}