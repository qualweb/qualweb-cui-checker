
export const INTERRUPT_NODE_NAMES = ['human_skip_interrupt_question', 'human_skip_interrupt_strategy'];

export const NODE_STATUS_MAP: Record<string, string> = {
  domain_obtainer: 'Obtaining Initial Context',
  strategy_formulator: 'Formulating Strategy',
  question_formulator: 'Formulating Question',
  qw_browser_test: 'Running in Browser Test',
};

export const NODE_COMPLETE_MAP: Record<string, string> = {
  domain_obtainer: 'Context Ready',
  objective_assigner: 'Current Objective',
  strategy_formulator: 'Strategy Ready',
  question_formulator: 'Question Ready',
  qw_browser_test: 'Browser Test Complete',
};

type TypeCommunication = 'REQUEST' | 'RESPONSE';
type StatusCommunication = 'PENDING' | 'SUCCESS' | 'ERROR';

export interface PortResponse {
  type: TypeCommunication;       
  action: string;        
  tabId?: number;      
  payload?: any;
  status: StatusCommunication;       
  error?: { message: string };
}