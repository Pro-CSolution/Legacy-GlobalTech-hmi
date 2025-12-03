/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TrendData } from '../models/TrendData';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DataService {
    /**
     * Get History
     * @param deviceId
     * @param parameterId
     * @param startTime
     * @param endTime
     * @param limit
     * @returns TrendData Successful Response
     * @throws ApiError
     */
    public static getHistoryApiV1HistoryGet(
        deviceId: string,
        parameterId: string,
        startTime?: string,
        endTime?: string,
        limit: number = 100,
    ): CancelablePromise<Array<TrendData>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/history',
            query: {
                'device_id': deviceId,
                'parameter_id': parameterId,
                'start_time': startTime,
                'end_time': endTime,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
