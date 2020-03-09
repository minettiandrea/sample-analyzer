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
