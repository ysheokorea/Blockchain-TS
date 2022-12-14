import { Block } from "@core/blockchain/block";
import { DIFFICULTY_ADJUSTMENT_INTERVAL } from "@core/config";

export class Chain {
  private blockchain: Block[];

  constructor() {
    this.blockchain = [Block.getGENESIS()];
  }

  public getChain(): Block[] {
    return this.blockchain;
  }

  public getLength(): number {
    return this.blockchain.length;
  }

  public getLatestBlock(): Block {
    return this.blockchain[this.blockchain.length - 1];
  }

  public addBlock(data: string[]): Failable<Block, string> {
    const previousBlock = this.getLatestBlock();

    // 이전 블록 묶음 구하기
    const adjustmentBlock: Block = this.getAdjustmentBlock();

    const newBlock = Block.generateBlock(previousBlock, data, adjustmentBlock);
    const isValid = Block.isValidNewBlock(newBlock, previousBlock);

    if (isValid.isError) return { isError: true, error: isValid.error };

    this.blockchain.push(newBlock);

    return { isError: false, value: newBlock };
  }

  /**
   * addToChain()
   * 
   */

  public addToChain(_receivedBlock : Block):Failable<undefined, string>{
    const isValid = Block.isValidNewBlock(_receivedBlock, this.getLatestBlock());

    if(isValid.isError) return {isError:true, error : isValid.error};

    this.blockchain.push(_receivedBlock);
    return {isError : false, value : undefined}
  }

  /**
   * isValidChain()
   */

  isValidChain(_chain:Block[]):Failable<undefined, string>{
    for(let i=1; i<_chain.length; i++){
      const newBlock = _chain[i];
      const previousBlock = _chain[i-1];
      const isValid = Block.isValidNewBlock(newBlock, previousBlock);
      if(isValid.isError) return {isError:true, error:isValid.error}
    }

    return {isError:false, value : undefined}
  }

  /**
   * replaceChain()
   * 체인을 교체한다
   */

  replaceChain(receivedChain:Block[]):Failable<undefined, string>{
    const latestReceivedBlock:Block = receivedChain[receivedChain.length  -1];
    const latestBlock:Block = this.getLatestBlock();
    if(latestReceivedBlock.height === 0){
      return {isError:true, error:"receivedBlock is GENESIS BLOCK"}
    }

    if(latestReceivedBlock.height <= latestBlock.height){
      return {isError:true, error:"Invalid Block"}
    }

    // 현재 체인이 더 짧다면 긴 체인으로 변경
    this.blockchain = receivedChain;

    return {isError:false, value : undefined}
  }
  /**
   * getAdjustmentBlock()
   * 생성 시점 기준 이전 블록 묶음을 구한다
   * 1) 현재 높이 < DIFFICULTY_ADJUSTMENT_INTERVAL => GENESIS Block
   * 2) 현재 높이 > DIFFICULTY_ADJUSTMENT_INTERVAL => -10 번째 블록 반환
   */
  public getAdjustmentBlock() {
    const currentLength = this.getLength();
    const adjustmentBlock: Block =
      this.getLength() < DIFFICULTY_ADJUSTMENT_INTERVAL
        ? Block.getGENESIS()
        : this.blockchain[currentLength - DIFFICULTY_ADJUSTMENT_INTERVAL];
    return adjustmentBlock;
  }
}
