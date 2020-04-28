export interface Message{
    ID:string
    type:string
    payload:any
    setID():string;
}

export class EssentiaMessage implements Message {
    ID:string;
    type:string;
    payload:any;

    constructor (ID:string, type:string, payload:any) {
      this.ID = ID
      this.type = type
      this.payload = payload
    }

    setID ():string {
      return '_' + Math.random().toString(36).substr(2, 9)
    }
}
