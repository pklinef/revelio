import TextField from '@material-ui/core/TextField'
import React from 'react'
import Units from './units'
import { getDistanceInMeters } from './distance-utils'

import { Map, getIn, setIn } from 'immutable'

export const label = 'Line'

const getCommon = value => {
  const coordinates = getIn(value, ['geojson', 'geometry', 'coordinates'])
  const bufferWidth = getIn(
    value,
    ['geojson', 'properties', 'buffer', 'width'],
    0
  )
  const unit = getIn(
    value,
    ['geojson', 'properties', 'buffer', 'unit'],
    'meters'
  )

  return { coordinates, bufferWidth, unit }
}

export const validate = location => {
  const errors = {}
  const { coordinates = [], bufferWidth = 0 } = getCommon(location)

  if (typeof coordinates === 'string') {
    errors.coordinates = 'Invalid Line'
  }

  if (bufferWidth < 0) {
    errors.bufferWidth = 'Buffer width must be greater or equal to 0'
  }
  return errors
}

const parseLine = line => line.map(([lon, lat]) => `${lon} ${lat}`).join()

export const generateFilter = () => {
  const coordinates = []
  const bufferWidth = 0
  const unit = 'meters'

  return {
    type: bufferWidth > 0 ? 'DWITHIN' : 'INTERSECTS',
    property: 'anyGeo',
    value: {
      type: 'GEOMETRY',
      value: `LINESTRING(${parseLine(coordinates)})`,
    },
    ...(bufferWidth > 0 && {
      distance: getDistanceInMeters({ distance: bufferWidth, units: unit }),
    }),
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates,
      },
      properties: {
        type: 'LineString',
        buffer: {
          width: bufferWidth,
          unit,
        },
      },
    },
  }
}

const Line = props => {
  const { value = Map(), onChange, errors = {} } = props

  const { coordinates, bufferWidth, unit } = getCommon(value)

  return (
    <div style={{ paddingTop: 10 }}>
      <TextField
        fullWidth
        label="Line"
        error={errors.coordinates !== undefined}
        helperText={errors.coordinates}
        value={
          typeof coordinates === 'string'
            ? coordinates
            : JSON.stringify(coordinates)
        }
        onChange={e => {
          let coordinates = e.target.value
          try {
            coordinates = JSON.parse(coordinates)
          } catch (e) {}
          onChange(
            setIn(value, ['geojson', 'geometry', 'coordinates'], coordinates)
          )
        }}
      />
      <div style={{ display: 'flex', paddingTop: 10 }}>
        <div style={{ flex: '1', overflow: 'hidden' }}>
          <TextField
            fullWidth
            type="number"
            label="Buffer Width"
            error={errors.bufferWidth !== undefined}
            helperText={errors.bufferWidth}
            value={bufferWidth}
            onChange={e => {
              onChange(
                setIn(
                  value,
                  ['geojson', 'properties', 'buffer', 'width'],
                  e.target.value
                )
              )
            }}
          />
        </div>
        <div style={{ width: 20 }} />
        <Units
          value={unit}
          onChange={e => {
            onChange(
              setIn(
                value,
                ['geojson', 'properties', 'buffer', 'unit'],
                e.target.value
              )
            )
          }}
        />
      </div>
    </div>
  )
}

export default Line
export const component = Line
