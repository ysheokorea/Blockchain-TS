import { WebSocket } from "ws";
import { Chain } from "@core/blockchain/chain";

export class P2PServer extends Chain{
    private sockets:WebSocket[];

    constructor(){
        super();
        this.sockets = [];
    }

    /**
     * listen()
     * 클라이언트가 연결을 시도할 때 코드 실행
     */
    listen(){
        const server = new WebSocket.Server({port : 7545});

        // Server 기준 Connection
        server.on('connection', (socket)=>{
            console.log('WebSocket connected');

            this.connectSocket(socket);
        })        
    }
    /**
     * Client가 P2P 네트워크에 입장함
     * 서버로 연결을 요청할 때 코드 실행
     */
     connectToPeer(newPeer:string){
        const socket = new WebSocket(newPeer);
        
        // Client 기준 open
        socket.on('open', ()=>{
            this.connectSocket(socket);
        })
    }

    /**
     * 
     */
    connectSocket(socket:WebSocket){
        this.sockets.push(socket);

        socket.on('message', (data:string)=>{   
            console.log(data);
        })

        socket.send('message from server');
    }
}