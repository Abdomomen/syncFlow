import { createStore } from "zustand";
import { persist } from "zustand/middleware";

export const clientStore = () => {
    return createStore(
        persist(
            (set) => ({
                user: null,
                setUser: (user) => set({ user }),
            }),
            {
                name: "user-storage",
            }
        )
    );
};

export const tokenStore = () => {
    return createStore(
        (set) => ({
            token: null,
            setToken: (token) => set({ token }),
        })
    );
};
