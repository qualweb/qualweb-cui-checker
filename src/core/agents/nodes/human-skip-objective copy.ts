import { GraphState } from "../state";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { NodeInterrupt } from "../langgraph_lib";
import TestRegistry, { QWTestType } from "../domain/QWTests/TestRegistry";
import { ObjectiveSerialized, STATUS_TEST } from "../domain";


export const humanSkipInterrupt = (state: typeof GraphState.State) => {
  const { isSkipObjectivePressed } = state;
  console.log("humanSkipInterrupt: isSkipObjectivePressed =", isSkipObjectivePressed);
  if (!isSkipObjectivePressed) {
    throw new NodeInterrupt(``);
  } else {
    const { currentObjective, objectives } = state;
  const qwTest:QWTestType = TestRegistry.deserialize(
    currentObjective!
  );
  qwTest.setStatus(STATUS_TEST.FAILED);

  const updatedObjectives: Record<string, ObjectiveSerialized> = {
    ...objectives,
    [qwTest.getSelector()]: qwTest.toJSON() as ObjectiveSerialized,
  };

    return {
      currentObjectiveMessages: [],
      currentObjective: null,
      objectives: updatedObjectives,
      currentEvaluationObjective: null,
      isSkipObjectivePressed: false,
    };
  }
};

