import { ApolloClient } from 'apollo-client'
import { SchemaLink } from 'apollo-link-schema'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { onError } from 'apollo-link-error'
import { makeExecutableSchema } from 'graphql-tools'
import { ApolloLink } from 'apollo-link'
import schema from './schema'

const clientErrorLink = onAuthentication =>
  onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        if (err.extensions && err.extensions.code === 'UNAUTHENTICATED') {
          onAuthentication(() => {
            forward(operation, graphQLErrors)
          })
        }
      }
    }
    if (networkError) {
      console.log(networkError)
      return forward(networkError, operation)
    }
  })

const createApolloClient = params => {
  const { onAuthentication } = params
  const cache = new InMemoryCache()
  cache.restore(window.__APOLLO_STATE__)

  const executableSchema = makeExecutableSchema(schema)

  return new ApolloClient({
    link: ApolloLink.from([
      clientErrorLink(onAuthentication),
      new SchemaLink({schema: executableSchema, context: schema.context}),
    ]),
    cache,
  })
}
export default createApolloClient
