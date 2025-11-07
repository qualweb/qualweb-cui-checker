import {
  EvaluationRunner,
} from '../evaluation/EvaluationRunner';

import { IChromeRequest } from './MapperActions';

export function actionStartEvaluation(data: IChromeRequest) {
  EvaluationRunner.getInstance().startEvaluation(data.sendResponse);
}

export function actionEvaluateACT(data: IChromeRequest) {
  const actResult = EvaluationRunner.getInstance().startEvaluationACT();
  data.sendResponse(actResult);
}

export function actionEvaluateWCAG(data: IChromeRequest) {
  const wcagResult = EvaluationRunner.getInstance().startEvaluationWCAG();
  data.sendResponse(wcagResult);
}

export async function actionEvaluateCUI(data: IChromeRequest): Promise<Object> {
  return new Promise<Object>(async (resolve) => {
    const response = await EvaluationRunner.getInstance().startEvaluationCUI(data.request.settings);
    resolve(response);
  });
}

export function actionEndEvaluation(data: IChromeRequest) {
  EvaluationRunner.getInstance().endEvaluation(data.sendResponse);
}
