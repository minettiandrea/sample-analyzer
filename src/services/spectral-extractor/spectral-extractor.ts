import { Note } from '@/model/note'

export interface FFTElement{
    frequency: number,
    magnitude:number
}

export interface SpectralAnalisis{
    /**
     * List of all the peaks (including the fundamental) [Hz]
     */
    peaks:{ frequencies: number[], magnitudes: number[]};
    hpcp: number[]

}

export interface SpectralExtractor {
    /**
     * Perform spectral analysis on the sample
     * @param sample sample to analyze
     */
    analyze(sample:number[]): Promise<SpectralAnalisis>;
}
