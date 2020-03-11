import { injectable } from 'inversify-props'

export interface Drawable {
  draw(ctx:CanvasRenderingContext2D):void;
}

export interface DrawToolkit {

    setUp(canvas : HTMLCanvasElement, alpha : number):Panel;

}

export interface Panel {
  redraw():void;
  add(d:Drawable):void;
}

export class PanelImpl implements Panel {
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
    return new PanelImpl(canvas)
  }
}
