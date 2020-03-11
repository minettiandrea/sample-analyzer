import { Drawable } from '@/services/providers/draw-toolkit'

export class FreqBox implements Drawable {
  freq:string
  amplitude:string
  xpos:number
  ypos:number
  visible:boolean

  constructor (freq:string, amplitude:string, xpos:number, ypos:number, visible:boolean) {
    this.freq = freq
    this.amplitude = amplitude
    this.xpos = xpos
    this.ypos = ypos
    this.visible = visible
  }

  draw (ctx:CanvasRenderingContext2D, canvas:HTMLCanvasElement) {
    if (this.visible) {
      ctx.font = '10px verdana'
      if (this.xpos + 0.15 * this.xpos <= canvas.offsetWidth) {
        ctx.fillText(this.freq, this.xpos + 0.1 * this.xpos, this.ypos + 35)
      } else {
        ctx.fillText(this.freq, this.xpos - 0.1 * this.xpos, this.ypos + 35)
      }
    }
  }
}
