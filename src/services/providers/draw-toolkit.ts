import { injectable } from 'inversify-props'

export interface Drawable {
  draw(ctx:CanvasRenderingContext2D, canvas:HTMLCanvasElement):void;
}

export interface DrawToolkit {

    setUp(canvas : HTMLCanvasElement, alpha : number):Panel;

}

export interface Panel {
  redraw():void;
  add(d:Drawable):void;
  reset():void
}

export class PanelImpl implements Panel {
  private elements:Drawable[] = [];
  private canvas:HTMLCanvasElement;
  private ctx:CanvasRenderingContext2D

  constructor (canvas: HTMLCanvasElement, ctx:CanvasRenderingContext2D) {
    this.canvas = canvas
    this.ctx = ctx
  }

  redraw ():void {
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight)
    this.elements.forEach(d => d.draw(this.ctx, this.canvas))
  }

  add (d:Drawable):void {
    this.elements.push(d)
  }

  reset ():void{
    this.elements = []
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
      return new PanelImpl(canvas, ctx)
    }
    throw new Error('Canvas not ready')
  }
}
