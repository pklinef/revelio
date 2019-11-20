import React, { Fragment, useState } from 'react'

import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Divider from '@material-ui/core/Divider'
import CloseIcon from '@material-ui/icons/Close'
import { red } from '@material-ui/core/colors'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import Collapse from '@material-ui/core/Collapse'

import SortOrder from './search-settings'
import { SourcesSelect } from './sources'

import { get, setIn, removeIn, merge, has, List } from 'immutable'

const defaultSorts = [
  {
    attribute: 'modified',
    direction: 'descending',
  },
]

const defaultSources = ['ddf.distribution']

const SearchButton = props => (
  <Button
    style={props.style}
    fullWidth
    variant="contained"
    color="primary"
    onClick={props.onSearch}
    disabled={props.disabled}
  >
    Search
  </Button>
)

const populateDefaultQuery = (
  filterTree,
  srcs = defaultSources,
  sorts = defaultSorts
) => {
  const filters = List(get(filterTree, 'filters', []))

  if (filters.isEmpty()) {
    filterTree = {
      type: 'ILIKE',
      property: 'anyText',
      value: '%',
    }
  }

  return {
    srcs,
    start: 1,
    count: 250,
    filterTree,
    sorts,
    spellcheck: false,
    phonetics: false,
  }
}

import * as MatchTypes from './query-basic/match-types'
import * as TimeRange from './query-basic/time-range'
import * as TextSearch from './query-basic/text'
import * as Location from './query-basic/location'

const filterTypes = {
  text: TextSearch,
  location: Location,
  timeRange: TimeRange,
  datatypes: MatchTypes,
}

const getBasicType = filter => {
  if (filter !== undefined) {
    const type = Object.keys(filterTypes).find(type => {
      const { match } = filterTypes[type]
      return match(filter)
    })

    return filterTypes[type]
  }
}

const FilterCard = props => {
  const [state, setState] = useState(true)
  const { children, label, hasErrors, onRemove } = props

  const spacing = 16
  const Arrow = state ? KeyboardArrowUpIcon : KeyboardArrowDownIcon

  const border = `2px solid ${hasErrors ? red[500] : 'rgba(0,0,0,0)'}`

  return (
    <Paper style={{ marginTop: 20, border }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography style={{ padding: 12 }} color="textSecondary">
          {label}
        </Typography>
        <div style={{ display: 'flex' }}>
          <IconButton onClick={() => setState(!state)}>
            <Arrow />
          </IconButton>
          <IconButton style={{ color: red[500] }} onClick={onRemove}>
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <Collapse in={state}>
        <Divider />
        <div
          style={{
            padding: spacing,
            boxSizing: 'border-box',
          }}
        >
          {children}
        </div>
      </Collapse>
    </Paper>
  )
}

const defaultQuery = {
  //filterTree: require('./filterTree.json'),
}

const BasicSearchFilter = props => {
  const { filter, errors, onRemove, onChange } = props

  const entry = getBasicType(filter)

  if (entry === undefined && has(filter, 'filters')) {
    const filters = get(filter, 'filters')
    return (
      <Fragment>
        {filters.map((filter, i) => {
          return (
            <BasicSearchFilter
              key={i}
              filter={filter}
              errors={get(errors, i)}
              onRemove={() => {
                const next = removeIn(props.filter, ['filters', i])
                onChange(next)
              }}
              onChange={value => {
                const next = setIn(props.filter, ['filters', i], value)
                onChange(next)
              }}
            />
          )
        })}
      </Fragment>
    )
  }

  if (entry === undefined) {
    return null
  }

  const { Component, label } = entry

  return (
    <FilterCard
      label={label}
      onRemove={onRemove}
      hasErrors={errors !== undefined}
    >
      <Component state={filter} setState={onChange} errors={errors} />
    </FilterCard>
  )
}

const AddButton = ({ options, onAdd }) => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  function handleClick(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <React.Fragment>
      <Button onClick={handleClick} style={{ marginLeft: '20px' }}>
        Add Options
      </Button>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {options.map(option => {
          const { value, label } = option
          return (
            <MenuItem
              key={value}
              value={value}
              onClick={() => {
                onAdd(option)
                handleClose()
              }}
            >
              {label}
            </MenuItem>
          )
        })}
      </Menu>
    </React.Fragment>
  )
}

export const BasicSearch = props => {
  const [query, setQuery] = useState(props.query || defaultQuery)

  const setFilterTree = filterTree => {
    setQuery(setIn(query, ['filterTree'], filterTree))
  }

  const { filterTree } = query

  const [submitted, setSubmitted] = useState(false)
  const errors = validate(query)

  const options = Object.keys(filterTypes).map(value => {
    const label = filterTypes[value].label
    return { value, label }
  })

  return (
    <div
      style={{
        overflow: 'auto',
        padding: 2,
        maxWidth: 600,
        maxHeight: '100%',
      }}
    >
      <AddButton
        options={options}
        onAdd={option => {
          setSubmitted(false)
          const { generateFilter } = filterTypes[option.value]
          const filter = generateFilter()

          if (['sortOrder', 'sources'].includes(option.value)) {
            const next = merge(query, filter)
            return setQuery(next)
          }

          if (filterTree === undefined) {
            setFilterTree(filter)
          } else if (has(filterTree, 'filters')) {
            setFilterTree(
              setIn(filterTree, ['filters', filterTree.filters.length], filter)
            )
          } else {
            setFilterTree({
              type: 'AND',
              filters: [filterTree, filter],
            })
          }
        }}
      />
      <BasicSearchFilter
        filter={filterTree}
        errors={submitted ? get(errors, 'filterTree') : undefined}
        onChange={filterTree => {
          setFilterTree(filterTree)
        }}
        onRemove={() => {
          setFilterTree(undefined)
        }}
      />
      {has(query, 'srcs') ? (
        <FilterCard
          label="Sources"
          onRemove={() => {
            setQuery(removeIn(query, ['srcs']))
          }}
        >
          <SourcesSelect
            value={get(query, 'srcs')}
            onChange={srcs => {
              setQuery(merge(query, { srcs }))
            }}
          />
        </FilterCard>
      ) : null}
      {has(query, 'sorts') ? (
        <FilterCard
          label="Sorts"
          onRemove={() => {
            setQuery(removeIn(query, ['sorts']))
          }}
        >
          <SortOrder
            value={get(query, 'sorts')}
            onChange={sorts => {
              setQuery(merge(query, { sorts }))
            }}
          />
        </FilterCard>
      ) : null}
      <div
        style={{
          marginTop: 20,
        }}
      >
        <SearchButton
          fullWidth
          disabled={submitted && errors !== undefined}
          onSearch={() => {
            setSubmitted(true)

            if (errors === undefined) {
              const search = populateDefaultQuery(
                filterTree,
                query.sources,
                query.sorts
              )
              console.log(search)
              props.onSearch(search)
            }
          }}
        />
      </div>
    </div>
  )
}

const validateFilterTree = filter => {
  const entry = getBasicType(filter)

  if (entry === undefined && has(filter, 'filters')) {
    const errors = get(filter, 'filters').map(validateFilterTree)

    if (errors.some(error => error !== undefined)) {
      return errors
    }

    return
  }

  if (entry === undefined) {
    return
  }

  const { validate } = entry

  if (typeof validate === 'function') {
    const errors = validate(filter)
    if (errors !== undefined && Object.keys(errors).length > 0) {
      return errors
    }
  }
}

const validate = query => {
  const filterTree = validateFilterTree(get(query, 'filterTree'))

  if (filterTree !== undefined) {
    return { filterTree }
  }
}

export default BasicSearch
