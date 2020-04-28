import { Note } from '@/model/note'

export interface FFTElement{
    frequency: number,
    magnitude:number
}

export interface SpectralAnalisis{
    /**
     * List of all the peaks (including the fundamental) [Hz]
     */
    peaks:number[];

    /**
     * List of the harmonics peaks, integer multiples of the fundamental [Hz]
     */
    harmonicPeaks:number[];

    /**
     * List of inharmonic peaks, non integer multiples of the fundamental [Hz]
     */
    inharmonicPeaks:number[];

    /**
     * Fundamental frequency [Hz]
     */
    fundamental:number;

    /**
     * Note of fundamental
     */
    fundamentalNote:Note;

    /**
     * Notes corresponding to all the peaks
     */
    overtones:Note[];

    /**
     * raw data of the FFT, useful for plotting
     */
    fft:FFTElement[];
}

export interface SpectralExtractor {
    /**
     * Perform spectral analysis on the sample
     * @param sample sample to analyze
     */
    analyze(sample:Float32Array): Promise<SpectralAnalisis>;
}
