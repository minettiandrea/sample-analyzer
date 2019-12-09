import { shallowMount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'
import '../../src/ioc'
import { container } from 'inversify-props'
import { SpectralExtractor } from '@/services/spectral-extractor/spectral-extractor'
import { REGISTRY } from '@/ioc/registry'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const se = container.get<SpectralExtractor>(REGISTRY.SpectralExtractor)

    const msg = se.test()
    const wrapper = shallowMount(HelloWorld)
    expect(wrapper.text()).toMatch(msg)
  })
})
