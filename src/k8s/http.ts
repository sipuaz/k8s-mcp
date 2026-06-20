type SuccessResult<T> = {
    ok: true,
    statusCode: number,
    code: string,
    message: string,
    data: T,
}

type FailureResult = {
    ok: false,
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
}

/**
 * Represents the HTTP response from a Kubernetes API request, which can be either a success or a failure.
 * On success, the response includes the data returned by the API. On failure, it includes error details.
 * This type is used to standardize the handling of Kubernetes API responses across the application.
 */
type HttpResponse<T> = SuccessResult<T> | FailureResult

const UNKNOWN_ERROR_CODE = 'UnknownError'

const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null
}

const readNested = (value: unknown, path: string[]): unknown => {
    let current: unknown = value
    for (const segment of path) {
        if (!isObject(current)) {
            return undefined
        }
        current = current[segment]
    }
    return current
}

const readString = (value: unknown, path: string[]): string | undefined => {
    const candidate = readNested(value, path)
    return typeof candidate === 'string' ? candidate : undefined
}

const readNumber = (value: unknown, path: string[]): number | undefined => {
    const candidate = readNested(value, path)
    return typeof candidate === 'number' ? candidate : undefined
}

function convertK8sErrorToHttpResponse(error: unknown): FailureResult {
    const statusCode =
        readNumber(error, ['statusCode'])
        ?? readNumber(error, ['response', 'statusCode'])
        ?? readNumber(error, ['response', 'status'])
        ?? readNumber(error, ['body', 'code'])
        ?? 500

    const code =
        readString(error, ['body', 'reason'])
        ?? readString(error, ['code'])
        ?? UNKNOWN_ERROR_CODE

    const message =
        readString(error, ['body', 'message'])
        ?? readString(error, ['message'])
        ?? 'Kubernetes API request failed'

    return {
        ok: false,
        statusCode,
        code,
        message,
        details: error,
    }
}

function toSuccessResponse<T>(data: T, statusCode = 200, code = 'OK', message = 'Request succeeded'): SuccessResult<T> {
    return {
        ok: true,
        statusCode,
        code,
        message,
        data,
    }
}

export { convertK8sErrorToHttpResponse, toSuccessResponse }
export type { HttpResponse, SuccessResult, FailureResult }