import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { Map, getIn } from 'immutable'
import React from 'react'

import * as LineString from './line'
import * as Point from './point-radius'
import * as Polygon from './polygon'

export const locationTypes = {
  LineString,
  Polygon,
  Point,
  /*BoundingBox: {
    label: 'Bounding Box',
    component: null,
    validate: () => ({}),
    generateFilter: () => null,
  },
  Keyword: {
    label: 'Keyword',
    component: null,
    validate: () => ({}),
    generateFilter: () => null,
  },*/
}

export const generateFilter = () => {
  return LineString.generateFilter()
}

export const validate = value => {
  const type = getIn(value, ['geojson', 'properties', 'type'])
  return locationTypes[type].validate(value)
}

const Location = ({ value, onChange, errors = {} }) => {
  const type = getIn(value, ['geojson', 'properties', 'type'])

  const [locations, setLocations] = React.useState(Map({ [type]: value }))

  const Component = locationTypes[type].component

  const onSelection = e => {
    setLocations(locations.set(type, value))
    const newType = e.target.value

    const newValue = locations.get(
      newType,
      locationTypes[newType].generateFilter()
    )

    onChange(newValue)
  }

  return (
    <FormControl fullWidth>
      <InputLabel>Location</InputLabel>
      <Select value={type ? type : 'line'} onChange={onSelection}>
        {Object.keys(locationTypes).map(key => (
          <MenuItem key={key} value={key}>
            {locationTypes[key].label}
          </MenuItem>
        ))}
      </Select>
      {Component ? (
        <Component value={value} onChange={onChange} errors={errors} />
      ) : null}
    </FormControl>
  )
}

export default Location
