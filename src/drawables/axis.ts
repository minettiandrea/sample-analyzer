import { Drawable } from '@/services/providers/draw-toolkit'
import { SpectrumPoint } from '@/services/providers/quantizer'
import { of } from 'rxjs'
import { virtualCanvas } from './utils/logUtils'

export class Axis implements Drawable {
    textFreq:string[]
    graphicFreq: number[]
    q:SpectrumPoint[]
    max:number
    log:boolean = true
    min:number = 40

    constructor (t:string[], n:number[], q:SpectrumPoint[], max:number, min:number, log:boolean) {
      this.textFreq = t
      this.graphicFreq = n
      this.q = q
      this.max = max
      this.min = min
      this.log =  log
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
        if (this.graphicFreq[j] < this.max && this.graphicFreq[j] >= this.min) {
          let widthpx = canvas.width // px width

          let minDelta = Math.min(...this.q.map(x => Math.abs(x.frequency - this.graphicFreq[j])))
          let idx = this.q.findIndex(x => x.frequency + minDelta === this.graphicFreq[j] || x.frequency - minDelta === this.graphicFreq[j])
         
          let pos = 0;

          if(this.log) {
            const minFreqIndex = this.q.findIndex(x => x.frequency > this.min)
            const sizing = virtualCanvas(canvas.offsetWidth,minFreqIndex,this.q.length)
            pos = sizing.width + sizing.offset + Math.log(idx/this.q.length) / Math.log(sizing.width) * sizing.width
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
