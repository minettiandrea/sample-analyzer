import { Drawable } from '@/services/providers/draw-toolkit'
import { LogPoint } from '@/services/providers/quantizer'

export class Axis implements Drawable {
    textFreq:string[]
    graphicFreq: number[]
    q:LogPoint[]
    max:number

    constructor (t:string[], n:number[], q:LogPoint[], max:number) {
      this.textFreq = t
      this.graphicFreq = n
      this.q = q
      this.max = max
    }

    draw (ctx:CanvasRenderingContext2D, canvas:HTMLCanvasElement) {
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(canvas.width - 1, 0)
      ctx.stroke()
      ctx.moveTo(0, 0)
      ctx.lineTo(1, -canvas.offsetHeight + 1)
      ctx.stroke()
      // frequency bins
      for (let j = 0; j < this.graphicFreq.length; j++) {
        if (this.graphicFreq[j] < this.max) {
          let widthpx = canvas.width // px width

          let minDelta = Math.min(...this.q.map(x => Math.abs(x.frequency - this.graphicFreq[j])))
          let idx = this.q.findIndex(x => x.frequency + minDelta === this.graphicFreq[j] || x.frequency - minDelta === this.graphicFreq[j])

          let pos = Math.floor(idx / this.q.length * widthpx)
          ctx.lineWidth = 3
          ctx.strokeStyle = 'black'
          ctx.beginPath()
          ctx.moveTo(pos, -4)
          ctx.lineTo(pos, 4)
          ctx.stroke()
          ctx.lineWidth = 0.5
          ctx.font = '8px verdana'
          ctx.strokeText(this.textFreq[j], pos - 5, 15)
        }
      }
    }
}
