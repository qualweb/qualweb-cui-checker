import { evaluateACT, evaluateWCAG, evaluateCUI, endEvaluation, startEvaluation } from "../evaluation/Evaluation";
import { IChromeRequest } from "./MapperActions";




export function actionStartEvaluation(data: IChromeRequest) {
  startEvaluation(data.sendResponse);
}

export function actionEvaluateACT(data: IChromeRequest) {
  const actResult = evaluateACT();
  data.sendResponse(actResult);
}
export function actionEvaluateWCAG(data: IChromeRequest) {
  const wcagResult = evaluateWCAG();
  data.sendResponse(wcagResult);
}
export async function actionEvaluateCUI(data: IChromeRequest): Promise<Object> {
    
  return new Promise<Object>(async (resolve) => {

    const response = await evaluateCUI(data.request.settings);
    resolve(response);
  });
}
export function actionEndEvaluation(data: IChromeRequest) {
  endEvaluation(data.sendResponse);
}


