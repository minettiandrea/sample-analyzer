import { Drawable } from '@/services/providers/draw-toolkit'
import { virtualCanvas } from './utils/logUtils'

export class Line implements Drawable {
  color:string
  width:number
  x: number // expressed in %, from 0 to 1
  visible: boolean
  log:boolean
  start:number
  length:number

  constructor (color:string, width:number, x: number, visible: boolean, start?:number, length?:number) {
    this.color = color
    this.width = width
    this.x = x
    this.visible = visible
    this.log = false
    if(start && length) {
      this.log = true
      this.start = start
      this.length = length
    }
  }


  draw (ctx:CanvasRenderingContext2D) {
    if (this.visible) {
      ctx.strokeStyle = this.color
      ctx.lineWidth = this.width
      ctx.beginPath()
      let posx = Math.floor(ctx.canvas.width * this.x)
      if(this.log) {
        const sizing = virtualCanvas(ctx.canvas.width,this.start,this.length)
        posx = sizing.width + sizing.offset + Math.log(this.x) / Math.log(sizing.width) * sizing.width
      }
      
      ctx.moveTo(posx, 0)
      ctx.lineTo(posx, ctx.canvas.offsetHeight)
      ctx.stroke()
    }
  }
}
