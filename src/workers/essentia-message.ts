export interface Message{
    type:string
    payload:any
    reply (payload:any):Message
    isForMe(message:Message):boolean
}

export class EssentiaMessage implements Message {
    static SPECTRUM = 'spectrum'
    static RHYTHM = 'rhythm'
    static HARMONY = 'harmony'

    private ID:string;
    type:string;
    payload:any;

    constructor (type:string, payload:any) {
      this.ID = '_' + Math.random().toString(36).substr(2, 9)
      this.type = type
      this.payload = payload
    }

    static fromData (d:any) {
      let clonedMessage = new EssentiaMessage(d.type, d.payload)
      clonedMessage.setID(d.ID)
      return clonedMessage
    }

    private setID (id:string) {
      this.ID = id
    }

    reply (payload:any):Message {
      let reply = new EssentiaMessage(this.type, payload)
      reply.setID(this.ID)
      return reply
    }

    isForMe (message: any): boolean {
      if (message.ID) {
        return message.ID === this.ID
      }
      return false
    }
}
