import 'bootstrap/dist/css/bootstrap.min.css'
import queryString from 'query-string'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import {
  VALUES,
  validateResult,
  validateValues,
  type Result,
  type Values,
} from './data'
import './index.css'
import { getFromLocalStorage, saveToLocalStorage, unpackObject } from './utils'

const params = queryString.parse(location.search)
const valuesParam =
  params.v && unpackObject<Values>(params.v as string, validateValues)
const resultParam =
  params.r && unpackObject<Result>(params.r as string, validateResult)
const hasParams = Boolean(valuesParam || resultParam)

const values = hasParams
  ? valuesParam || VALUES
  : getFromLocalStorage<Values>('values', validateValues) || VALUES
const result = hasParams
  ? resultParam || {}
  : getFromLocalStorage<Result>('result', validateResult) || {}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App
      values={values}
      result={result}
      onChangeValues={(newValues) => {
        if (!hasParams) saveToLocalStorage('values', newValues)
      }}
      onChangeResult={(newResult) => {
        if (!hasParams) saveToLocalStorage('result', newResult)
      }}
    />
  </React.StrictMode>
)
