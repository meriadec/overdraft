import { CompositeDecorator } from 'draft-js'

import linkEntity from './entities/link'

export default function createDecorator(entities = []) {
  return new CompositeDecorator([linkEntity, ...entities])
}
