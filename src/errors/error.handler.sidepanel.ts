import {  STATUS } from "../messaging/message-types";
import { CRITICAL_ERRORS_RESET_SELECTORS, IErrorApiHandlerArgs, IErrorHandlerArgs, IErrorResponseHandlerArgs, SIDEPANEL_EXCEPTION_HANDLERS } from "./sidepanel/error.registry.sidepanel";
import { APIError, APIErrorsWithDetails } from "./sidepanel/errors.class.sidepanel";
import { UI_MESSAGE_FRIENDLY_ERRORS } from "./sidepanel/errors.definitions.sidepanel";




function defaultErrorHandler(args: IErrorHandlerArgs): void {
    const name = args.error.name;
    // if is type of Error, get error number
    const errorNumber = args.error instanceof APIErrorsWithDetails ? args.error.error_number : undefined;
    const errorSuffix = errorNumber ? `\nError - ${errorNumber}` : '';
    const message =  UI_MESSAGE_FRIENDLY_ERRORS[name] + errorSuffix  || "An unexpected error occurred.";

    if(args.callback) args.callback();
    args.router.push({ name: 'error', query: { error: message  } });
}


export  function  interceptErrors(result,router){
       if (!result || result.status === STATUS.ERROR) {
       handleErrorResponseSidepanel({ error: result, router: router });
        return true ;
      }
      return false;
}

export async function handleErrorSidepanel(errorArgs: IErrorHandlerArgs): Promise<void> {
    const name =  errorArgs.error.name;  
    const handler = SIDEPANEL_EXCEPTION_HANDLERS[name];
    if(handler) {
        handler(errorArgs);
    } else {
        defaultErrorHandler(errorArgs);
    }
} 

export async function handleApiErrorSidepanel(errorArgs: IErrorApiHandlerArgs): Promise<void> {
    const error = errorArgs.apiError;
    if (error instanceof APIError) {
        if(errorArgs.callback) errorArgs.callback();
        if (errorArgs.router) {
            errorArgs.router.push({ name: 'error', query: { error: errorArgs.apiError.message } }); 
        }
    }
}


export async function handleErrorResponseSidepanel(errorArgs: IErrorResponseHandlerArgs): Promise<void> {
    const { error, storeDispatchCallback, callback, router } = errorArgs;
    const name =  error.code;
    if(CRITICAL_ERRORS_RESET_SELECTORS.has(name)) {
    if(storeDispatchCallback)
        await storeDispatchCallback();
    }
    const messageFriendly = UI_MESSAGE_FRIENDLY_ERRORS[name] ;
    const baseMessage = error.message || "An unexpected error occurred.";
    const message = messageFriendly || baseMessage ;
    
    if(callback) await callback();

    router.push({ name: 'error', query: { error: message  } });

}