import { MessageResponse, STATUS } from '../../messaging/message-types';
import { ERROR_CLASS_NAME_BACKGROUND } from './errors.class.background';

const errorGenerator = (code: BackgroundErrorNames, message: string): MessageResponse => ({
  status: STATUS.ERROR,
  code,
  message,
});

const systemErrorGenerator = (code800: number): MessageResponse => ({
  status: STATUS.ERROR,
  code: ERROR_CLASS_NAME_BACKGROUND.UNKNOWN_ERROR,
  message: `Unexpected Error. Please report to Qualweb Team - Code ${code800}`,
});
type BackgroundErrorNames =
  (typeof ERROR_CLASS_NAME_BACKGROUND)[keyof typeof ERROR_CLASS_NAME_BACKGROUND];

export const ERROR_MESSAGES_BACKGROUND: Partial<Record<BackgroundErrorNames, MessageResponse>> = {
  [ERROR_CLASS_NAME_BACKGROUND.ACTION_DOES_NOT_EXIST_ERROR]: errorGenerator(
    ERROR_CLASS_NAME_BACKGROUND.ACTION_DOES_NOT_EXIST_ERROR,
    'The requested action does not exist.',
  ),
  [ERROR_CLASS_NAME_BACKGROUND.TAB_NOT_ACTIVE_ERROR]: errorGenerator(
    ERROR_CLASS_NAME_BACKGROUND.TAB_NOT_ACTIVE_ERROR,
    'Tab is not active. Cannot forward the message.',
  ),
  [ERROR_CLASS_NAME_BACKGROUND.UNKNOWN_ERROR]: errorGenerator(
    ERROR_CLASS_NAME_BACKGROUND.UNKNOWN_ERROR,
    'An unexpected error occurred. Please try again.',
  ),
  [ERROR_CLASS_NAME_BACKGROUND.INTERACTION_IN_PROGRESS_ERROR]: errorGenerator(
    ERROR_CLASS_NAME_BACKGROUND.INTERACTION_IN_PROGRESS_ERROR,
    'An interaction is already in progress. Please wait for it to complete.',
  ),
  [ERROR_CLASS_NAME_BACKGROUND.MUTEX_LOCKED_ERROR]: errorGenerator(
    ERROR_CLASS_NAME_BACKGROUND.MUTEX_LOCKED_ERROR,
    'An interaction is already in progress. Please wait for it to complete.',
  ),

  [ERROR_CLASS_NAME_BACKGROUND.CONTENT_INJECTION_ERROR]: errorGenerator(
    ERROR_CLASS_NAME_BACKGROUND.CONTENT_INJECTION_ERROR,
    'Content script failed to reinject.',
  ),
  [ERROR_CLASS_NAME_BACKGROUND.LANGGRAPH_BUILD_ERROR]: errorGenerator(
    ERROR_CLASS_NAME_BACKGROUND.LANGGRAPH_BUILD_ERROR,
    'Failed to build Langgraph. Please review your configuration.',
  ),

  [ERROR_CLASS_NAME_BACKGROUND.MODEL_AUTHENTICATION_ERROR]: errorGenerator(
    ERROR_CLASS_NAME_BACKGROUND.MODEL_AUTHENTICATION_ERROR,
    'LLM authentication failed. Verify your API key and permissions.',
  ),
  [ERROR_CLASS_NAME_BACKGROUND.API_LIMIT_EXCEEDED_ERROR]: errorGenerator(
    ERROR_CLASS_NAME_BACKGROUND.API_LIMIT_EXCEEDED_ERROR,
    'Access limited due to usage. Check your quota or billing status.',
  ),
  [ERROR_CLASS_NAME_BACKGROUND.GRAPH_RECURSION_LIMIT_ERROR]: systemErrorGenerator(800),
  [ERROR_CLASS_NAME_BACKGROUND.INVALID_CHAT_HISTORY_ERROR]: systemErrorGenerator(801),
  [ERROR_CLASS_NAME_BACKGROUND.INVALID_CONCURRENT_GRAPH_UPDATE_ERROR]: systemErrorGenerator(802),
  [ERROR_CLASS_NAME_BACKGROUND.INVALID_GRAPH_NODE_RETURN_VALUE_ERROR]: systemErrorGenerator(803),
  [ERROR_CLASS_NAME_BACKGROUND.INVALID_PROMPT_INPUT_ERROR]: systemErrorGenerator(804),
  [ERROR_CLASS_NAME_BACKGROUND.INVALID_TOOL_RESULTS_ERROR]: systemErrorGenerator(805),
  [ERROR_CLASS_NAME_BACKGROUND.MESSAGE_COERCION_FAILURE_ERROR]: systemErrorGenerator(806),
  [ERROR_CLASS_NAME_BACKGROUND.MISSING_CHECKPOINTER_ERROR]: systemErrorGenerator(807),
  [ERROR_CLASS_NAME_BACKGROUND.MODEL_NOT_FOUND_ERROR]: systemErrorGenerator(808),
  [ERROR_CLASS_NAME_BACKGROUND.MULTIPLE_SUBGRAPHS_ERROR]: systemErrorGenerator(809),
  [ERROR_CLASS_NAME_BACKGROUND.OUTPUT_PARSING_FAILURE_ERROR]: errorGenerator(
    ERROR_CLASS_NAME_BACKGROUND.OUTPUT_PARSING_FAILURE_ERROR,
    'Unexpected Error. Please report to Qualweb Team - Code 810',
  ),
};
