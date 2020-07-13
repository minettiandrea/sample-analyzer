import { Drawable } from '@/services/providers/draw-toolkit'
import { SpectrumPoint } from '@/services/providers/quantizer'
import { virtualCanvas } from './utils/logUtils'

export class Spectra implements Drawable {
    spectrum:SpectrumPoint[]
    log:boolean = true
    min: number = 40

    constructor (spectrum:SpectrumPoint[],min:number,log:boolean) {
      this.spectrum = spectrum
      this.min = min
      this.log = log
    }

    draw (ctx: CanvasRenderingContext2D, canvas:HTMLCanvasElement) {
      
      ctx.translate(0, canvas.offsetHeight - 20) // canvas y axis to be on the bottom of the canvas |_|
      
      const maxin = Math.max(...this.spectrum.map(x => x.magnitude))
      const minin = Math.min(...this.spectrum.map(x => x.magnitude))
      const maxout = 10
      const minout = 1
      let scaled = this.spectrum.map(x => x.magnitude).map((a) => {
        return (a - minin) * (maxout - minout) / (maxin - minin) + minout
      })
      let width = canvas.offsetWidth
      const height = canvas.height
      const padding = -5
      const nblocks = this.spectrum.length
      let start = 0
      let offsetX = -1000
      if(this.log) {
        const minFreqIndex = this.spectrum.findIndex(x => x.frequency > this.min)
        start = minFreqIndex
        const sizing = virtualCanvas(canvas.offsetWidth,start,nblocks)
        offsetX = sizing.offset
        width = sizing.width
      }
      for (let i = start; i < nblocks; i++) {
        let x = 0;
        if(this.log) {
          x = width + offsetX + (Math.log((i)/(nblocks)) / Math.log(width)) * width
        } else { //linear
          x = i / nblocks * width
        }
        
        let y = Math.log10(scaled[i]) * height - padding

        // drawing the line
        ctx.lineWidth = 0.5
        ctx.strokeStyle = '#034efc'
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, -y)
        ctx.stroke()
      }
      ctx.translate(0, -(canvas.offsetHeight - 20)) // Bring back Y = 0 to be in top of the canvas to match standard
    }
}
