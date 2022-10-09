import { Blockchain } from "@core/index";
import { P2PServer } from "./src/server/p2p";
import express, { Request, Response } from "express";

const app = express();
const ws = new P2PServer();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("bit-chain");
});

// 블록 조회
app.post("/chains", (req, res) => {
  const { data } = req.body;
  const newBlock = ws.addBlock(data);

  if (newBlock.isError) return res.status(500).json(newBlock.error);

  res.json(newBlock.value);
});

// ws 연결 요청
app.post("/add-to-peer", (req, res) => {
  const { peer } = req.body;
  ws.connectToPeer(peer);
});

// 연결된 sockets 전체 조회
app.get('/peers', (req:Request, res:Response)=>{
    const sockets = ws.getSockets().map((s:any)=>s._socket.remoteAddress + ':' + s._socket.remotePort);
    res.json(sockets);
})

app.listen(3000, () => {
  console.log("server is listening on #3000");
  ws.listen();
});
