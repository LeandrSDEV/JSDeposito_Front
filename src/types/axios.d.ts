import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** usado internamente pelo interceptor de refresh */
    __isRetryRequest?: boolean
  }
}
