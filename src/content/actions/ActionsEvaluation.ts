import { chatbotInterface } from "../Detection";
import { evaluateACT, evaluateWCAG, evaluateCUI, endEvaluation, startEvaluation } from "../Evaluation";
import { IChromeRequest } from "./MapperActions";




export function actionStartEvaluation(data: IChromeRequest) {
  startEvaluation(data.sendResponse);
}

export function actionEvaluateACT(data: IChromeRequest) {
  const actResult = evaluateACT(chatbotInterface!.windowElement);
  data.sendResponse(actResult);
}
export function actionEvaluateWCAG(data: IChromeRequest) {
  const wcagResult = evaluateWCAG(chatbotInterface!.windowElement);
  data.sendResponse(wcagResult);
}
export async function actionEvaluateCUI(data: IChromeRequest): Promise<Object> {
  return new Promise<Object>(async (resolve) => {
    const response = await evaluateCUI(chatbotInterface!.windowElement);
    resolve(response);
  });
}
export function actionEndEvaluation(data: IChromeRequest) {
  endEvaluation(data.sendResponse);
}


