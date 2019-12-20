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
export class DrawToolkit implements DrawToolkit {
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

  filterData (array: number[], bars:number):number[] {
    const blocksize = Math.floor(array.length / bars) // how many samples in each block
    var dataf : number [] = [] // initialize the output

    for (let i = 0; i < bars; i++) { // for each bar
      let blockbegins = blocksize * i
      let sum = 0

      for (let j = 0; j < blocksize; j++) { // in each bar I sum up the values of each sample
        sum = sum + Math.abs(array[blockbegins + j])
      // sum
      }
      dataf.push(sum / blocksize) // pushes the average of each block into an array
    }
    return dataf
  }
}
