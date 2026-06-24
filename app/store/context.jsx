"use client"
import { useContext,createContext,useRef } from "react";
import { clientStore,tokenStore } from "./store";
import { useStore } from "zustand";

const context= createContext(null)

export default function Provider({children}){
    let clientStoreRef = useRef()
    if(!clientStoreRef.current){
        clientStoreRef.current = clientStore()
    }
    let tokenStoreRef = useRef()
    if(!tokenStoreRef.current){
        tokenStoreRef.current = tokenStore()
    }

    return <>
        <context.Provider value={{ clientStore: clientStoreRef.current, tokenStore: tokenStoreRef.current }}>
            {children}
        </context.Provider>
    </>
}

export const useSync = (selector) => {
    const { clientStore } = useContext(context)
    return useStore(clientStore, selector)
}

export const useTokenSync = (selector) => {
    const { tokenStore } = useContext(context)
    return useStore(tokenStore, selector)
}

