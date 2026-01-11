export const ACTION_GRAPH = {
  START_VOICE_INPUT: 'start_voice_input',
  STOP_VOICE_INPUT: 'stop_voice_input',
  INIT_INTERACTION: 'init_interaction',
  MESSAGE_LANGGRAPH: 'qw-message',
  END_INTERACTION: 'end_interaction',
  CANCEL_INTERACTION: 'cancel_interaction',
  SKIP_OJECTIVE_INTERACTION: 'skip_objective',
};

export const PORT_NAME = {
  CONTENT_SCRIPT: 'content-port',
  SIDEBAR: 'sidebar-port',
};

export const ACTION_PORT = {
  ERROR: 'error',
  READY: 'ready',
  START_INTERACTION: 'start_interaction',
  END_INTERACTION: 'end_interaction',
  CANCEL_INTERACTION: 'cancel_interaction',
  PROCESS_MESSAGE: 'process_message',
  SKIP_OBJECTIVE_INTERACTION: 'skip_objective_interaction',
  UPDATE_INTERACTION_STATE: 'update_interaction_state',
};
