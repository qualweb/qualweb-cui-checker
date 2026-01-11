import { IChromeRequest, sendResponse } from '.';
import { ChatbotElementsFactory } from '../factories/ChatbotElementsFactory';
import { EvaluationRunnerFactory } from '../factories/EvaluationRunnerFactory';
import { SUCCESS_MESSAGES_CONTENT } from '../messages';
import { InvalidSelectorProvidedError } from '../../errors/content/errors.class.content';

export function actionStartEvaluation(data: IChromeRequest) {
  try {
    if (!data.request.selectors || Object.keys(data.request.selectors).length === 0) {
      throw new Error('Chatbot selectors are missing for evaluation start');
    }
    const selectors = data.request.selectors;
    if (!selectors)
      throw new InvalidSelectorProvidedError('No selectors provided for starting evaluation');

    const interfaceChatbot = ChatbotElementsFactory.init();

    interfaceChatbot.setSelectors(selectors);

    EvaluationRunnerFactory.init(interfaceChatbot);

    const response = EvaluationRunnerFactory.getInstance().startEvaluation();

    sendResponse(data, { ...SUCCESS_MESSAGES_CONTENT.EVALUATION_STARTED, data: response });
  } catch (error) {
    EvaluationRunnerFactory.destroy();
    ChatbotElementsFactory.destroy();
    throw error;
  }
}

export function actionEvaluateACT(data: IChromeRequest) {
  try {
    const actResult = EvaluationRunnerFactory.getInstance().startEvaluationACT();

    sendResponse(data, { ...SUCCESS_MESSAGES_CONTENT.ACT_EVALUATED, data: actResult });
  } catch (error) {
    EvaluationRunnerFactory.destroy();
    ChatbotElementsFactory.destroy();

    throw error;
  }
}

export function actionEvaluateWCAG(data: IChromeRequest) {
  try {
    const wcagResult = EvaluationRunnerFactory.getInstance().startEvaluationWCAG();
    sendResponse(data, { ...SUCCESS_MESSAGES_CONTENT.WCAG_EVALUATED, data: wcagResult });
  } catch (error) {
    EvaluationRunnerFactory.destroy();
    ChatbotElementsFactory.destroy();
    throw error;
  }
}

export async function actionEvaluateCUI(data: IChromeRequest): Promise<void> {
  try {
    const response = await EvaluationRunnerFactory.getInstance().startEvaluationCUI(
      data.request.settings,
    );
    sendResponse(data, { ...SUCCESS_MESSAGES_CONTENT.CUI_EVALUATED, data: response });
  } catch (error) {
    EvaluationRunnerFactory.destroy();
    ChatbotElementsFactory.destroy();
    throw error;
  }
}

export function actionEndEvaluation(data: IChromeRequest) {
  try {
    const response = EvaluationRunnerFactory.getInstance().endEvaluation();
    sendResponse(data, { ...SUCCESS_MESSAGES_CONTENT.EVALUATION_ENDED, data: response });
  } catch (error) {
    console.log('Error during ending evaluation:', error);
    throw error;
  } finally {
    EvaluationRunnerFactory.destroy();
    ChatbotElementsFactory.destroy();
  }
}
