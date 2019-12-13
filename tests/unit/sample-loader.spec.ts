import 'reflect-metadata'
import '../../src/ioc'
import { container } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { SampleLoaderService } from '@/services/sample-loader/sample-loader'
import { setState } from 'web-audio-test-api'

const sampleLoader = container.get<SampleLoaderService>(REGISTRY.SampleLoader)

describe('SampleLoader', () => {
  it('should read a sample from URL', async () => {
    const sample = await sampleLoader.loadFromUrl(require('../../src/assets/cello.wav'))
    expect(sample.duration).toBeGreaterThan(0)
  })
  it('should return an empty buffer if wrong url is passed', async () => {
    setState('AudioContext#decodeAudioData', 'void')
    const sample = await sampleLoader.loadFromUrl('')
    expect(sample.duration).toBe(0)
  })
  it('should return an empty buffer if null file is passed', async () => {
    const sample = await sampleLoader.loadFromFile(null as any as File)
    expect(sample.duration).toBe(0)
  })
})
