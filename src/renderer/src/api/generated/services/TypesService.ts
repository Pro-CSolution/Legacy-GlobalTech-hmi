/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceUpdatePayload } from '../models/DeviceUpdatePayload';
import type { ParameterSubscriptionPayload } from '../models/ParameterSubscriptionPayload';
import type { SubscriptionPayload } from '../models/SubscriptionPayload';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TypesService {
    /**
     *  Type Device Update
     * @returns DeviceUpdatePayload Successful Response
     * @throws ApiError
     */
    public static typeDeviceUpdateTypesSocketDeviceUpdatePost(): CancelablePromise<DeviceUpdatePayload> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/_types/socket/device_update',
        });
    }
    /**
     *  Type Subscription
     * @returns SubscriptionPayload Successful Response
     * @throws ApiError
     */
    public static typeSubscriptionTypesSocketSubscriptionPost(): CancelablePromise<SubscriptionPayload> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/_types/socket/subscription',
        });
    }
    /**
     *  Type Param Subscription
     * @returns ParameterSubscriptionPayload Successful Response
     * @throws ApiError
     */
    public static typeParamSubscriptionTypesSocketParamSubscriptionPost(): CancelablePromise<ParameterSubscriptionPayload> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/_types/socket/param_subscription',
        });
    }
}
