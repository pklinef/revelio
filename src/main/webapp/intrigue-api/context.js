import createRpcClient from './rpc'
import fetch from './fetch'

const catalogMethods = {
  create: 'ddf.catalog/create',
  query: 'ddf.catalog/query',
  update: 'ddf.catalog/update',
  delete: 'ddf.catalog/delete',
  getSourceIds: 'ddf.catalog/getSourceIds',
  getSourceInfo: 'ddf.catalog/getSourceInfo',
}

const enumerationMethods = {
  getAllEnumerations: 'ddf.enumerations/all',
}

const generateRpcMethods = rpc => {
  const catalog = Object.keys(catalogMethods).reduce((catalog, method) => {
    catalog[method] = params => rpc(catalogMethods[method], params)
    return catalog
  }, {})

  const enumerations = Object.keys(enumerationMethods).reduce(
    (enumerations, method) => {
      enumerations[method] = params => rpc(enumerationMethods[method], params)
      return enumerations
    },
    {}
  )

  return { catalog, enumerations }
}

const context = () => {

  return {
    fetch,
    ...generateRpcMethods(createRpcClient(fetch)),
  }
}

export default context
