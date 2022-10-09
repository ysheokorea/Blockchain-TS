
/**
 *  난이도 조정 블록 묶음 갯수(10개로 지정)
 */
 export const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;
 
 /**
  *  블록 생성 시간 (단위 : 10분)
  */
 export const BLOCK_GENERATION_INTERVAL: number = 10;
  
 /**
  *  블록 생성 시간 단위 (초)
  */
 export const BLOCK_GENERATION_TIME_UNIT: number = 60;

export const GENESIS: IBlock = {
    version: "1.0.0",
    height: 0,
    timestamp: new Date().getTime(),
    hash: "0".repeat(64),
    previousHash: "0".repeat(64),
    merkleRoot: "0".repeat(64),
    difficulty: 0,
    nonce: 0,
    data: [
      "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks",
    ],
  };