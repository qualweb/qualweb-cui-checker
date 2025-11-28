import {
  EvaluationRunner,
} from '../evaluation/EvaluationRunner';

import { IChromeRequest, sendResponse } from './MapperActions';

export function actionStartEvaluation(data: IChromeRequest) {
  const response = EvaluationRunner.getInstance().startEvaluation();
  sendResponse(data, {status: "success", message: "Evaluation started", data: response});
}

export function actionEvaluateACT(data: IChromeRequest) {
  const actResult = EvaluationRunner.getInstance().startEvaluationACT();
  sendResponse(data, {status: "success", message: "ACT evaluation completed", data: actResult});
}

export function actionEvaluateWCAG(data: IChromeRequest) {
  const wcagResult = EvaluationRunner.getInstance().startEvaluationWCAG();
  sendResponse(data, {status: "success", message: "WCAG evaluation completed", data: wcagResult});
}

export async function actionEvaluateCUI(data: IChromeRequest): Promise<void> {
    const response = await EvaluationRunner.getInstance().startEvaluationCUI(data.request.settings);
    sendResponse(data,{status: "success", message: "CUI evaluation completed", data: response});
}

export function actionEndEvaluation(data: IChromeRequest) {
  const response = EvaluationRunner.getInstance().endEvaluation();
  sendResponse(data, {status: "success", message: "Evaluation ended", data: response});
}
