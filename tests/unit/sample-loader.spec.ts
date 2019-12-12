import 'reflect-metadata'
import '../../src/ioc'
import { container } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { SampleLoaderService } from '@/services/sample-loader/sample-loader'

const sampleLoader = container.get<SampleLoaderService>(REGISTRY.SampleLoader)

describe('SampleLoader', () => {
  it('should read a sample from URL', () => {
    sampleLoader.loadFromUrl(require('@/src/assets/cello.wav')).then(sample => {
      expect(sample.duration > 0)
    })
  })
})
