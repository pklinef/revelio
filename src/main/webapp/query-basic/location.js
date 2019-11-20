import React from 'react'

import { Map, get } from 'immutable'

import Location, { validate, generateFilter } from '../location'

export const label = 'Location'

export { validate, generateFilter }

export const match = filter => {
  return get(filter, 'property') === 'anyGeo'
}

const BasicLocation = ({ state = Map(), setState, errors }) => {
  return <Location value={state} onChange={setState} errors={errors} />
}

export const Component = BasicLocation
