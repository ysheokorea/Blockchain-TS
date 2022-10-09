import { WebSocket } from "ws";
import { Chain } from "@core/blockchain/chain";

enum MessageType{
    latest_block = 0,
    all_block = 1,
    receivedChain = 2,
}

interface Message{
    type : MessageType;
    payload : any;
}

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
     * connectToPeer()
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
     * connectSocket()
     * Client가 Server가 되서 Broadcasting 하게 됨
     */
    connectSocket(socket:WebSocket){
        this.sockets.push(socket);

        this.messageHandler(socket);

        const data : Message = {
            type : MessageType.latest_block,
            payload : {},
        }

        this.errorHandler(socket);

        const send = P2PServer.send(socket);
        send(data);

        // socket.on('message', (data:string)=>{   
        //     console.log(data);
        // })

        socket.send('message from server');
    }

    /**
     * messageHandler()
     * @params socket
     * @desc Client A노드는 B노드로 부터 데이터를 전달받을 준비함
     */
    messageHandler(socket:WebSocket){
        const callback = (_data:string)=>{
            const result:Message = P2PServer.dataParse<Message>(_data);
            const send = P2PServer.send(socket);

            switch(result.type){
                case MessageType.latest_block:{
                    const message : Message = {
                        type : MessageType.all_block,
                        payload : [this.getLatestBlock()],
                    };
                    send(message);
                    break;
                }

                case MessageType.all_block: {
                    const message : Message = {
                        type : MessageType.receivedChain,
                        payload : this.getChain(),
                    }
                    // chain에 블록을 추가할지 결정함
                    const [receivedBlock] = result.payload;

                    const isValid = this.addToChain(receivedBlock);

                    if(!isValid.isError) break;

                    send(message);
                    break;
                }

                case MessageType.receivedChain : {
                    const receivedChain : IBlock[] = result.payload;

                    // chain을 교체함
                    this.handleChainResponse(receivedChain);
                    break;
                }
            }
        };

        socket.on('message', callback);
    }

    errorHandler(socket : WebSocket){
        const close = () => {
            // Error 발생 시 해당 socket을 제거함
            this.sockets.splice(this.sockets.indexOf(socket), 1);
        }

        // socket 통신이 끊긴 경우
        socket.on('close', close);
    
        // Error 발생하는 경우
        socket.on('error', close);
    }

    /**
     * handleChainResponse()
     */
    handleChainResponse(receivedChain:IBlock[]):Failable<Message | undefined, string>{
        const isValidChain = this.isValidChain(receivedChain)

        if(isValidChain.isError) return {isError:true, error:isValidChain.error}

        const isValid = this.replaceChain(receivedChain);
        if(isValid.isError) return {isError : true, error : isValid.error};

        // Broadcasting
        const message : Message = {
            type : MessageType.receivedChain,
            payload : receivedChain,
        }
        this.broadcast(message);

        return{isError:false, value: undefined}
    }

    /**
     * broadcast()
     */

    broadcast(message:Message):void{
        this.sockets.forEach((socket)=>P2PServer.send(socket)(message))
    }
    /**
     * 전체 socket 반환 메소드
     */

    getSockets():WebSocket[]{
        return this.sockets;
    }

    /**
     * 
     * @param _socket 
     * @returns _function
     * @desc WebSocket.send()로 통신함
     */
    static send(_socket:WebSocket){
        return (_data:Message)=>{
            _socket.send(JSON.stringify(_data))
        }
    }

    static dataParse<T>(_data:string): T {
        return JSON.parse(Buffer.from(_data).toString());
    }
}