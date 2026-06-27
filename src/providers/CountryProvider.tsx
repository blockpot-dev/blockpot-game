import { createContext, ReactNode, useContext, useState, useEffect } from 'react'
import countries from 'i18n-iso-countries'
import en from 'i18n-iso-countries/langs/en.json'
countries.registerLocale(en)

export type CountryContextType = {
    country: string | null
    countryName: string | null
}

const CountryContext = createContext<CountryContextType>({
    country: null,
    countryName: null,
})

export default function CountryProvider(props: { children: ReactNode }) {
    const [country, setCountry] = useState<string | null>(null)
    const [countryName, setCountryName] = useState<string | null>(null)

    useEffect(() => {
        // Check if MOCK_COUNTRY is set to 'TRUE' in environment
        if (import.meta.env.VITE_MOCK_COUNTRY === 'TRUE') {
            const mockedCountry = 'US'
            setCountry(mockedCountry)
            setCountryName(countries.getName(mockedCountry, 'en') ?? null)
            return
        }

        // Otherwise, read from window.__COUNTRY__ (set by Cloudflare)
        if (typeof window !== 'undefined' && window.__COUNTRY__) {
            setCountry(window.__COUNTRY__)
            setCountryName(countries.getName(window.__COUNTRY__, 'en') ?? null)
        }
    }, [])

    const value: CountryContextType = {
        country,
        countryName,
    }

    return (
        <CountryContext.Provider value={value}>
            {props.children}
        </CountryContext.Provider>
    )
}

export const useCountry = () => {
    return useContext(CountryContext)
}
