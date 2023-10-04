import { freighter } from '../../freighter/src'
import { Connector } from '../../types/src'

export const getDefaultConnectors = (): Connector[] => {
  const list: Connector[] = [freighter()]

  return list
}
