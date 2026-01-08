import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { isAxiosErrorLike } from 'types/errors'

export interface IApiService {
  get<T, P = Record<string, unknown>>(
    url: string,
    params?: P,
    config?: AxiosRequestConfig
  ): Promise<T>
  post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>
  put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>
  patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>
}

export class ApiService implements IApiService {
  private axiosInstance: AxiosInstance

  constructor(config: AxiosRequestConfig) {
    this.axiosInstance = axios.create({
      ...config,
      paramsSerializer: {
        serialize: (params) => {
          const usp = new URLSearchParams()
          Object.entries(params || {}).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((item) => usp.append(key, String(item)))
            } else if (value !== undefined && value !== null) {
              usp.append(key, String(value))
            }
          })
          return usp.toString()
        }
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (isAxiosErrorLike(error)) {
          const status = error.response?.status
          const method = error.config?.method?.toUpperCase()
          const url = error.config?.baseURL
            ? `${error.config.baseURL}${error.config.url}`
            : error.config?.url
          const detail = error.response?.data

          console.error('API Error:', {
            message: error.message,
            code: error.code,
            status,
            method,
            url,
            detail
          })
        } else {
          console.error('API Error:', error)
        }
        return Promise.reject(error)
      }
    )
  }

  public get<T, P = Record<string, unknown>>(
    url: string,
    params?: P,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.axiosInstance.get(url, { ...config, params }).then((res) => res.data)
  }

  public post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.post(url, data, config).then((res) => res.data)
  }

  public put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.put(url, data, config).then((res) => res.data)
  }

  public patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.patch(url, data, config).then((res) => res.data)
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.delete(url, config).then((res) => res.data)
  }
}
