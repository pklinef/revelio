import React from 'react'

import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'

import { fromJS, get, getIn } from 'immutable'

import TimeRange, { validate as timeRangeValidate } from '../time-range'

export const label = 'Time Range'

const TIME_RANGE_KEY = 'timeRange'

export const generateFilter = () => {
  return {
    type: 'OR',
    basic_type: TIME_RANGE_KEY,
    filters: [],
  }
}

export const validate = timeRange => {
  const errors = {}

  const filters = get(timeRange, 'filters', [])

  if (filters.length === 0) {
    errors.attributeSelectorErrors = 'Must choose at least one attribute'
  }

  return errors
}

const timeAttributes = [
  'created',
  'datetime.end',
  'datetime.start',
  'effective',
  'expiration',
  'metacard.created',
  'metacard.modified',
  'metacard.version.versioned-on',
  'modified',
]

export const match = filter => {
  if (get(filter, 'basic_type') === TIME_RANGE_KEY) {
    return true
  }

  const property = getIn(filter, ['filters', 0, 'property'])
  return timeAttributes.includes(property)
}

export const uglyMap = {
  minutes: howMany => `RELATIVE(PT${howMany}M)`,
  hours: howMany => `RELATIVE(PT${howMany}H)`,
  days: howMany => `RELATIVE(P${howMany}D)`,
  months: howMany => `RELATIVE(P${howMany}M)`,
  years: howMany => `RELATIVE(P${howMany}Y)`,
}

const relativeUnits = {
  P: {
    D: 'days',
    M: 'months',
    Y: 'years',
  },
  PT: {
    H: 'hours',
    M: 'minutes',
  },
}

// Create the Map
const unitsMap = fromJS(relativeUnits)

export const parseRelative = relative => {
  if (typeof value !== 'string') {
    return
  }

  const matches = relative.match(/RELATIVE\((PT?)(\d*)(\D*)\)/)
  if (matches && matches.length > 3) {
    /* eslint-disable no-unused-vars */
    const [full, timeOrDay, last, unitKey] = matches
    /* eslint-enable */
    const unit = unitsMap.getIn([timeOrDay, unitKey])

    return { last, unit }
  }

  return {}
}

const getTimeRangeFilter = (applyTo, timeRange) => {
  let rest = {}

  if (timeRange.type === '=') {
    const { last, unit } = timeRange
    rest = uglyMap[unit](last)
  }

  return {
    type: 'OR',
    basic_type: TIME_RANGE_KEY,
    filters: applyTo.map(property => ({
      ...rest,
      ...timeRange,
      property,
    })),
  }
}

const AttributeSelector = props => {
  const { attributes = [], setAttributes, errors } = props

  return (
    <FormControl fullWidth>
      <InputLabel>Apply Time Range To</InputLabel>
      <Select
        error={errors !== undefined}
        multiple
        value={attributes}
        onChange={e => setAttributes(e.target.value)}
        input={<Input />}
        renderValue={selected => {
          return selected.join(', ')
        }}
      >
        {timeAttributes.map(name => (
          <MenuItem key={name} value={name}>
            <Checkbox checked={attributes.indexOf(name) > -1} />
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Select>
      <FormHelperText error={errors !== undefined}>{errors}</FormHelperText>
    </FormControl>
  )
}

const BasicTimeRange = ({ state = Map(), setState, errors = {} }) => {
  const { filters = [] } = state

  const applyTo = filters.map(({ property }) => property)

  const value = filters[0] || {}

  const type = value.type || 'BEFORE'

  const timeRange = {
    type,
    ...parseRelative(value.value || ''),
    ...value,
  }

  return (
    <div style={{ flex: '1', overflow: 'hidden' }}>
      <TimeRange
        errors={errors.timeRangeErrors}
        fullWidth
        timeRange={timeRange}
        setTimeRange={updatedTimeRange => {
          const next = getTimeRangeFilter(applyTo, updatedTimeRange)
          setState(next)
        }}
      />
      <FormControl fullWidth>
        <AttributeSelector
          attributes={applyTo}
          errors={errors.attributeSelectorErrors}
          setAttributes={attributes => {
            const next = getTimeRangeFilter(attributes, timeRange)
            setState(next)
          }}
        />
      </FormControl>
    </div>
  )
}

export const Component = BasicTimeRange
