import { createContext, useContext } from 'react'

export const Sim = createContext(null)

// { s: state, d: dispatch, t: (普通の文言, やさしい文言) => string }
export const useSim = () => useContext(Sim)
