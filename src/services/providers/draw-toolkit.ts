import { injectable } from 'inversify-props'

export class Line {
    ctx:CanvasRenderingContext2D
    color:string
    width:number
    x: number // expressed in %
    visible: boolean

    constructor (ctx:CanvasRenderingContext2D, color:string, width:number, x: number, visible: boolean) {
      this.ctx = ctx
      this.color = color
      this.width = width
      this.x = x
      this.visible = visible
    }

    draw () {
      if (this.visible) {
        this.ctx.strokeStyle = this.color
        this.ctx.lineWidth = this.width
        this.ctx.beginPath()
        let posx = this.ctx.canvas.offsetWidth * this.x
        this.ctx.moveTo(posx, 0)
        this.ctx.lineTo(posx, this.ctx.canvas.offsetHeight)
        this.ctx.stroke()
      }
    }
}

export class FreqBox {
  ctx:CanvasRenderingContext2D
  freq:string
  amplitude:string
  xpos:number
  ypos:number
  visible:boolean

  constructor (ctx:CanvasRenderingContext2D, freq:string, amplitude:string, xpos:number, ypos:number, visible:boolean) {
    this.ctx = ctx
    this.freq = freq
    this.amplitude = amplitude
    this.xpos = xpos
    this.ypos = ypos
    this.visible = visible
  }

  draw (offset:number) {
    if (this.visible) {
      this.ctx.font = '10px verdana'
      if (this.xpos + 0.15 * this.xpos <= offset) {
        this.ctx.fillText(this.freq, this.xpos + 0.1 * this.xpos, this.ypos + 15)
      } else {
        this.ctx.fillText(this.freq, this.xpos - 0.1 * this.xpos, this.ypos + 15)
      }
    }
  }
}

export interface DrawToolkit {

    setUp(canvas : HTMLCanvasElement, alpha : number):void;
  }

@injectable()
export class DrawToolkitImpl implements DrawToolkit {
  setUp (canvas : HTMLCanvasElement, alpha : number) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = (canvas.offsetHeight) * dpr
      ctx.scale(dpr, dpr)
      ctx.globalAlpha = alpha
    }
  }
}
