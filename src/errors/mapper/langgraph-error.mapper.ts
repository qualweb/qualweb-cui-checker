import  {ErrorClass} from "..";
/** Maps LangGraph errors to custom error classes.
 *  
 * @param err  The error object from LangGraph.
 * @returns  A specific Error subclass based on the lc_error_code.
 */
export function mapLangGraphError(err:Error & { lc_error_code?: string }): Error {
  const message = err.message || 'LangGraph error';

  switch (err.lc_error_code) {
    case 'GRAPH_RECURSION_LIMIT':
      return new ErrorClass.GraphRecursionLimitError(message);

    case 'INVALID_CHAT_HISTORY':
      return new ErrorClass.InvalidChatHistoryError(message);

    case 'INVALID_CONCURRENT_GRAPH_UPDATE':
      return new ErrorClass.InvalidConcurrentGraphUpdateError(message);

    case 'INVALID_GRAPH_NODE_RETURN_VALUE':
      return new ErrorClass.InvalidGraphNodeReturnValueError(message);

    case 'INVALID_PROMPT_INPUT':
      return new ErrorClass.InvalidPromptInputError(message);

    case 'INVALID_TOOL_RESULTS':
      return new ErrorClass.InvalidToolResultsError(message);

    case 'MESSAGE_COERCION_FAILURE':
      return new ErrorClass.MessageCoercionFailureError(message);

    case 'MISSING_CHECKPOINTER':
      return new ErrorClass.MissingCheckpointerError(message);

    case 'MODEL_AUTHENTICATION':
      return new ErrorClass.ModelAuthenticationError(message);

    case 'MODEL_NOT_FOUND':
      return new ErrorClass.ModelNotFoundError(message);

    case 'MODEL_RATE_LIMIT':
      return new ErrorClass.ModelRateLimitError(message);

    case 'MULTIPLE_SUBGRAPHS':
      return new ErrorClass.MultipleSubgraphsError(message);

    case 'OUTPUT_PARSING_FAILURE':
      return new ErrorClass.OutputParsingFailureError(message);

    default:
      return new ErrorClass.UnknownLangGraphError(message);
  }
}
