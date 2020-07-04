import { Drawable } from '@/services/providers/draw-toolkit'

export class Spectra implements Drawable {
    xaxis:number[]
    yaxis:number[]

    constructor (yaxis:number[], xaxis:number[]) {
      this.yaxis = yaxis
      this.xaxis = xaxis
    }

    draw (ctx: CanvasRenderingContext2D, canvas:HTMLCanvasElement) {
      ctx.translate(0, canvas.offsetHeight - 20) // canvas y axis to be on the bottom of the canvas |_|
      const maxin = Math.max(...this.yaxis)
      const minin = Math.min(...this.yaxis)
      const maxout = 10
      const minout = 1
      let scaled = this.yaxis.map((a) => {
        return (a - minin) * (maxout - minout) / (maxin - minin) + minout
      })
      const width = canvas.width
      const height = canvas.height
      const padding = -5
      for (let i = 0; i < this.xaxis.length; i++) {
        let x = Math.floor(Math.log10(this.xaxis[i]) / Math.log10(44100) * width)
        console.log(x)
        let y = Math.log10(scaled[i]) * height - padding

        // drawing the line
        ctx.lineWidth = 0.5
        ctx.strokeStyle = '#034efc'
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, -y)
        ctx.stroke()
      }
    }
}
