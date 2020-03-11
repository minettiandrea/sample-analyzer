import { injectable } from 'inversify-props'

export interface Drawable {
  draw(ctx:CanvasRenderingContext2D):void;
}

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

export interface DrawToolkit {

    setUp(canvas : HTMLCanvasElement, alpha : number):Drawer;

}

export interface Drawer {
  redraw():void;
  add(d:Drawable):void;
}

export class DrawerImpl implements Drawer {
  private elements:Drawable[] = [];
  private canvas:HTMLCanvasElement;

  constructor (canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  redraw ():void {
    const ctx = this.canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight)
      this.elements.forEach(d => d.draw(ctx))
    }
  }

  add (d:Drawable):void {
    this.elements.push(d)
  }
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
    return new DrawerImpl(canvas)
  }
}
