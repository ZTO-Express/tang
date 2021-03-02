export declare const stderr: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};
export declare function handleError(err: TangError): void;
