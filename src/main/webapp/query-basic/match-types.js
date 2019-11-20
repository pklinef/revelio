import React from 'react'

import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import InputLabel from '@material-ui/core/InputLabel'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'

import { Set, get, getIn, List } from 'immutable'

export const label = 'Match Types'

export const generateFilter = () => {
  return {
    type: 'OR',
    basic_type: 'datatypes',
    filters: [],
  }
}

export const validate = filter => {
  const filters = List(get(filter, 'filters', []))
  if (filters.isEmpty()) {
    return 'Must choose at least one attribute'
  }
}

const datatypeProperties = ['metadata-content-type', 'datatype']

export const match = filter => {
  if (get(filter, 'basic_type') === 'datatypes') {
    return true
  }

  const property = getIn(filter, ['filters', 0, 'property'])
  return datatypeProperties.includes(property)
}

const getDatatypesFilter = applyTo => {
  if (!applyTo || applyTo.length === 0) {
    return {
      type: 'OR',
      basic_type: 'datatypes',
      filters: [],
    }
  }
  const datatypeFilters = applyTo.map(value => ({
    type: 'ILIKE',
    property: 'datatype',
    value,
  }))
  const contentTypeFilters = applyTo.map(value => ({
    type: 'ILIKE',
    property: 'metadata-content-type',
    value,
  }))
  return {
    type: 'OR',
    filters: [...datatypeFilters, ...contentTypeFilters],
  }
}

const datatypes = [
  'Interactive Resource',
  'Moving Image',
  'Still Image',
  'Dataset',
  'Collection',
  'Event',
  'Service',
  'Software',
  'Sound',
  'Text',
  'Image',
  'Physical Object',
]

const MatchTypes = ({ state = [], setState, errors }) => {
  const { filters = [] } = state
  const applyTo = Set(filters.map(({ value }) => value))

  return (
    <FormControl fullWidth>
      <InputLabel>Match Types</InputLabel>
      <Select
        error={errors !== undefined}
        multiple
        value={applyTo.toJSON()}
        onChange={e => {
          const filter = getDatatypesFilter(e.target.value)
          setState(filter)
        }}
        renderValue={selected => selected.join(', ')}
      >
        {datatypes.map(datatype => (
          <MenuItem key={datatype} value={datatype}>
            <Checkbox checked={applyTo.has(datatype)} />
            <ListItemText primary={datatype} />
          </MenuItem>
        ))}
      </Select>
      <FormHelperText error={errors !== undefined}>{errors}</FormHelperText>
    </FormControl>
  )
}

export const Component = MatchTypes
