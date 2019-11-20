import React from 'react'

import TextField from '@material-ui/core/TextField'

import { setIn, get } from 'immutable'

export const label = 'Text'

export const generateFilter = () => {
  return {
    type: 'ILIKE',
    property: 'anyText',
    value: '%',
  }
}

export const validate = () => {}

export const match = filter => {
  return get(filter, 'property') === 'anyText'
}

const TextSearch = props => {
  const { state, setState } = props
  const text = state.value

  return (
    <TextField
      fullWidth
      label="Text"
      variant="outlined"
      value={text}
      onChange={e => {
        setState(setIn(state, ['value'], e.target.value))
      }}
    />
  )
}

export const Component = TextSearch
