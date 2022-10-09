import { Chain } from "@core/blockchain/chain";

export class Blockchain{
    public chain:Chain;

    constructor(){
        this.chain = new Chain();
    }
}