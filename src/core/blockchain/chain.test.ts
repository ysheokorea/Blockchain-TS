import {Chain} from "@core/blockchain/chain"

describe("🔨 Chain 테스트", ()=>{
    // Genesis Block 생성
    let node:Chain = new Chain()

    it("1) getChain() 테스트", ()=>{
        console.log(node.getChain());
    })

    it("2) getLength() 테스트", ()=>{
        console.log(node.getLength());
    })

    it("3) getLatestBlock() 테스트", ()=>{
        console.log(node.getLatestBlock());
    })

    it("4) addBlock() 테스트", ()=>{
        for(let i=1; i<=100; i++){
            node.addBlock([`Block #${i}`])
        }

        console.table(node.getChain());
    })
})