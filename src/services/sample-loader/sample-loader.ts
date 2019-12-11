export interface SampleLoaderService {
  loadFromUrl(url: string):Promise<AudioBuffer>;
  loadFromFile(file: File):Promise<AudioBuffer>;
}
