import { Block } from "@core/blockchain/block";
import { GENESIS } from "@core/config";
 
describe("Block 검증", () => {
  let newBlock: Block;
 
  // it() : 테스트할 최소 단위의 코드를 작성하는 공간
  it("블록 생성 테스트", () => {
    const data = ["Block #2"];
 
    newBlock = Block.generateBlock(GENESIS, data);
 
    console.log(newBlock);
  });
});