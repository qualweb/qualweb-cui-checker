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
