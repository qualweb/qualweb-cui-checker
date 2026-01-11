import { hideMessage, showMessage } from '../../utils/helpers';
import { SUCCESS_MESSAGES_CONTENT } from '../messages';
import { IChromeRequest, sendResponse } from '.';

export function showMessageContentScript(data: IChromeRequest) {
  const message = data.request.message;
  const duration = data.request.duration || 2000;
  showMessage(message, duration);
  sendResponse(data, SUCCESS_MESSAGES_CONTENT.SHOW_MESSAGE_SUCCESS_NOTIFICATION);
}

export function hideMessageContentScript(data: IChromeRequest) {
  hideMessage();
  sendResponse(data, SUCCESS_MESSAGES_CONTENT.HIDE_MESSAGE_SUCCESS_NOTIFICATION);
}
