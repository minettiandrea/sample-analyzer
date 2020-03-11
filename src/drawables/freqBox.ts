import { Drawable } from '@/services/providers/draw-toolkit'

export class FreqBox implements Drawable {
  freq:string
  amplitude:string
  xpos:number
  ypos:number
  visible:boolean
  offset:number

  constructor (freq:string, amplitude:string, xpos:number, ypos:number, visible:boolean, offset:number) {
    this.freq = freq
    this.amplitude = amplitude
    this.xpos = xpos
    this.ypos = ypos
    this.visible = visible
    this.offset = offset
  }

  draw (ctx:CanvasRenderingContext2D) {
    if (this.visible) {
      ctx.font = '10px verdana'
      if (this.xpos + 0.15 * this.xpos <= this.offset) {
        ctx.fillText(this.freq, this.xpos + 0.1 * this.xpos, this.ypos + 15)
      } else {
        ctx.fillText(this.freq, this.xpos - 0.1 * this.xpos, this.ypos + 15)
      }
    }
  }
}
