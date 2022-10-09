import type { Config } from "@jest/types";
const config: Config.InitialOptions = {
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["<rootDir>/**/*.test.(js|ts)"],  // 테스트 코드를 실행할 파일명
  moduleNameMapper: {
    // 경로에 별칭 사용시 작성
    "^@core/(.*)$": "<rootDir>/src/core/$1",
  },
  testEnvironment: "node",
  verbose: true,  // 테스트 실행시 터미널 창에서 테스트 항목 확인
  preset: "ts-jest",
};
 
export default config;