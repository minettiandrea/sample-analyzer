/**
 * Unit of measure is always number of samples (@MA is that ok or we prefer to have it in time?)
 */
export interface TimeAnalisis{
    start:number;
    end:number;
    peaks: number[];
    /**
     * X Y coordinates of the envelope
     */
    envelope: number[][];
    attackSlope:number;
    decaySlope:number;
}

export interface TimeExtractor{
    analyze(sample:AudioBuffer):Promise<TimeAnalisis>;
}
