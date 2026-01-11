import TestRegistry from '../domain/QWTests/TestRegistry';
import { GraphState } from '../state';
import { STATUS_GRAPH, STATUS_TEST } from '../domain/types';
import QWRecognitionTest from '../domain/QWTests/QWRecognitionTest';
import { ACTION_TYPE } from '../domain/GraphOutput';

export const getNextObjective = async (state: typeof GraphState.State) => {
  // load next objective not completed
  const objectives = state.objectives;
  const graphOutput = state.graphOutput || {};

  const nextObjective = Object.values(objectives).find(
    (objective) =>
      objective.status !== STATUS_TEST.COMPLETED && objective.status !== STATUS_TEST.FAILED,
  );
  if (!nextObjective) {
    return { status: STATUS_GRAPH.COMPLETED };
  }
  const qwTest = TestRegistry.deserialize(nextObjective);
  if (qwTest instanceof QWRecognitionTest) {
    const graphOutputUpdate = {
      status: STATUS_GRAPH.IN_PROGRESS,
      actions: [
        ...(graphOutput?.actions || []),
        {
          _type: ACTION_TYPE.PLAY_SOUND_ACTION,
          audioFilename: qwTest.getTest().getAudioFilename(),
        },
      ],
    };

    return { currentObjective: nextObjective, graphOutput: graphOutputUpdate };
  }
  if (nextObjective) {
    return { currentObjective: nextObjective };
  }
};
