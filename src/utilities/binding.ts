import { Dispatch, SetStateAction } from 'react'

type Binding<T> = {
    value: T
    update: Dispatch<SetStateAction<T>>
}

export default Binding