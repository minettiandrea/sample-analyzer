import { Drawable } from '@/services/providers/draw-toolkit'
import { SpectrumPoint } from '@/services/providers/quantizer'
import { of } from 'rxjs'

export class Axis implements Drawable {
    textFreq:string[]
    graphicFreq: number[]
    q:SpectrumPoint[]
    max:number
    logX = true
    min = 40

    constructor (t:string[], n:number[], q:SpectrumPoint[], max:number) {
      this.textFreq = t
      this.graphicFreq = n
      this.q = q
      this.max = max
    }

    draw (ctx:CanvasRenderingContext2D, canvas:HTMLCanvasElement) {
      ctx.translate(0, canvas.offsetHeight - 20)
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
         
          let pos = 0;

          if(this.logX) {
            const minFreqIndex = this.q.findIndex(x => x.frequency > this.min)
            pos = canvas.width + Math.log((idx+minFreqIndex)/this.q.length) / Math.log(widthpx) * widthpx
          } else {
            pos = Math.floor(idx / this.q.length * widthpx)
          }
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
      ctx.translate(0, -(canvas.offsetHeight - 20)) // Bring back Y = 0 to be in top of the canvas to match standard
    }
}
