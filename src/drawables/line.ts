import { Drawable } from '@/services/providers/draw-toolkit'

export class Line implements Drawable {
  color:string
  width:number
  x: number // expressed in %
  visible: boolean

  constructor (color:string, width:number, x: number, visible: boolean) {
    this.color = color
    this.width = width
    this.x = x
    this.visible = visible
  }

  draw (ctx:CanvasRenderingContext2D) {
    if (this.visible) {
      ctx.strokeStyle = this.color
      ctx.lineWidth = this.width
      ctx.beginPath()
      let posx = ctx.canvas.offsetWidth * this.x
      ctx.moveTo(posx, 0)
      ctx.lineTo(posx, ctx.canvas.offsetHeight)
      ctx.stroke()
    }
  }
}
