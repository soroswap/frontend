import { Context, useContext } from 'react'
import { SorobanContext, SorobanContextType } from './SorobanContext'

export function useSorobanReact() {
  const context = useContext(
    SorobanContext as Context<SorobanContextType | undefined>
  )
  if (!context)
    throw Error(
      'useSorobanReact can only be used within the useSorobanReact component'
    )
  return context
}
