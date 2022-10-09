// src/cor/blockchain/block.ts

import { SHA256 } from "crypto-js";
import merkle from "merkle";
import { BlockHeader } from "./blockHeader";

// 추가1 : 제네시스 블록
import {
  DIFFICULTY_ADJUSTMENT_INTERVAL,
  BLOCK_GENERATION_INTERVAL,
  BLOCK_GENERATION_TIME_UNIT,
  GENESIS,
} from "@core/config";

import hexToBinary from "hex-to-binary";

export class Block extends BlockHeader implements IBlock {
  public hash: string;
  public merkleRoot: string;
  public nonce: number;
  public difficulty: number;
  public data: string[];

  constructor(_previousBlock: Block, _data: string[], _adjustmentBlock: Block) {
    super(_previousBlock);

    const merkleRoot = Block.getMerkleRoot(_data);

    this.merkleRoot = merkleRoot;
    this.hash = Block.createBlockHash(this);
    this.nonce = 0;
    this.difficulty = Block.getDifficulty(
      this,
      _adjustmentBlock,
      _previousBlock
    );
    this.data = _data;
  }

  // 추가2 : 제네시스 블록
  public static getGENESIS(): Block {
    return GENESIS;
  }

  public static getMerkleRoot<T>(_data: T[]): string {
    const merkleTree = merkle("sha256").sync(_data);
    return merkleTree.root();
  }

  public static createBlockHash(_block: Block): string {
    const {
      version,
      timestamp,
      height,
      merkleRoot,
      previousHash,
      difficulty,
      nonce,
    } = _block;
    const values: string = `${version}${timestamp}${height}${merkleRoot}${previousHash}${difficulty}${nonce}`;
    return SHA256(values).toString();
  }

  // 추가3 : 블록 생성 메소드
  public static generateBlock(
    _previousBlock: Block,
    _data: string[],
    _adjustmentBlock: Block
  ): Block {
    const generateBlock = new Block(_previousBlock, _data, _adjustmentBlock);
    const newBlock = Block.findBlock(generateBlock);
    return newBlock;
  }

  public static findBlock(_generateBlock: Block) {
    let hash: string;
    let nonce: number = 0;

    while (true) {
      nonce++;
      _generateBlock.nonce = nonce;
      hash = Block.createBlockHash(_generateBlock);

      // 16진수 > 2진수
      const binary: string = hexToBinary(hash);
      // difficulty는 0의 개수
      const result: boolean = binary.startsWith(
        "0".repeat(_generateBlock.difficulty)
      );

      if (result) {
        _generateBlock.hash = hash;
        return _generateBlock;
      }
    }
  }

  public static getDifficulty(
    _newBlock: Block,
    _adjustmentBlock: Block,
    _previousBlock: Block
  ): number {
    if (_newBlock.height <= 9) return 0;
    else if (_newBlock.height <= 19) return 1;

    if (_newBlock.height % DIFFICULTY_ADJUSTMENT_INTERVAL !== 0)
      return _previousBlock.difficulty;

    /**
     * 블록이 생성되는 시간은 개당 10분
     */
    const timeTaken: number = _newBlock.timestamp - _adjustmentBlock.timestamp;
    /**
     * 블록 묶음이 생성되는 시간 6000초
     */
    const timeExpected: number =
      BLOCK_GENERATION_TIME_UNIT *
      BLOCK_GENERATION_INTERVAL *
      DIFFICULTY_ADJUSTMENT_INTERVAL;

    if(timeTaken < timeExpected / 2) return _adjustmentBlock.difficulty + 1;
    else if(timeTaken > timeExpected * 2) return _adjustmentBlock.difficulty - 1;
    return _adjustmentBlock.difficulty;
  }

  public static isValidNewBlock(
    _newBlock: Block,
    _previousBlock: Block
  ): Failable<Block, string> {
    if (_previousBlock.height + 1 !== _newBlock.height)
      return { isError: true, error: "height error" };
    if (_previousBlock.hash !== _newBlock.previousHash)
      return { isError: true, error: "previousHash error" };
    if (Block.createBlockHash(_newBlock) !== _newBlock.hash)
      return { isError: true, error: "block hash error" };

    return { isError: false, value: _newBlock };
  }
}
