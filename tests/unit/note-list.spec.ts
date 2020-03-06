import 'reflect-metadata'
import '../../src/ioc'
import { container } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { SampleLoaderService } from '@/services/sample-loader/sample-loader'
import { setState } from 'web-audio-test-api'
import { NoteFrequencyProvider } from '@/services/providers/note-frequency';

const noteFrequency = container.get<NoteFrequencyProvider>(REGISTRY.NoteFrequencyProvider)

describe('NoteFrequency', () => {
  it('should return all the notes', async () => {
    noteFrequency.allNotes()
  })
})
