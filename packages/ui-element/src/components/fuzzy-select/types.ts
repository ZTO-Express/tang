export type FuzzySelectOption = Record<string, any>

export type FuzzySelectResponse =
  | {
      list: FuzzySelectOption[]
      [prop: string]: any
    }
  | FuzzySelectOption[]

// eslint-disable-next-line no-unused-vars
export type FuzzySelectRemoteMethod = (query: string, payload: any) => Promise<FuzzySelectResponse>
