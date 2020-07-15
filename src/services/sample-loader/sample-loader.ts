export interface SampleLoaderService {
  emptyBuffer():AudioBuffer
  loadFromUrl(url: string):Promise<AudioBuffer>;
  loadFromFile(file: File):Promise<AudioBuffer>;
}
