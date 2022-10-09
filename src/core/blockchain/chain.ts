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
