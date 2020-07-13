export function virtualCanvas(canvasWidth:number,start:number,length:number):{width:number, offset:number} {
    let width = canvasWidth
    let offsetX = -(Math.log(start/length) / Math.log(width) * width + width)
    while((width + offsetX - canvasWidth) < 0 && width < 10000) {
        width += 10;
        offsetX = -(Math.log(start/length) / Math.log(width) * width + width)
    }
    return {width: width, offset:offsetX}
}