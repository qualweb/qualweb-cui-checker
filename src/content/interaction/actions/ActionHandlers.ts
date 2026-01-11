import { ACTION_PORT } from '../../../background/action-type';
import { IGraphBaseInput } from '../../../core/agents/domain/GraphInput';
import GraphBaseInput from '../../../core/agents/domain/GraphInput/GraphBaseInput';
import GraphRecognitionInput from '../../../core/agents/domain/GraphInput/GraphRecognitionInput';
import {
  ACTION_TYPE,
  GraphOutputAction,
  IMarkElementAction,
  IPlaySoundAction,
  IQuestionAction,
  ISetBrowserTestOutcomeAction,
} from '../../../core/agents/domain/GraphOutput';
import MutationInteractionDetect from '../../../core/mutations/interaction/MutationInteractionDetect';
import { extractAssistantMessage, markQuestion, markResponses } from '../../lib/utils';
import ActionHandlerRegistry, { ActionHandlerArgs } from './ActionHandlerRegistry';
import { sendMessageToBackgroundPort } from '../InteractionWorkflow';
import { sleep } from '../../lib/DomTools';
import { EvaluationRunnerFactory } from '../../factories/EvaluationRunnerFactory';
import MessagesManager from '../../../core/elements/trackers/MessagesManager';
import TimeoutManager from '../../../core/timeouts/TimeoutManager';
import * as ErrorClass from '../../../errors/content/errors.class.content';

const ASSISTANT_INTERACTION_MESSAGES: HTMLElement[][] = [];

export function resetAssistantInteractionMessages() {
  ASSISTANT_INTERACTION_MESSAGES.length = 0;
}
// Register Handlers to deal with actions received from LangGraph Output

export function registerActionHandlers() {
  ActionHandlerRegistry.register(
    ACTION_TYPE.MARK_ELEMENT_ACTION,
    async (data: GraphOutputAction, args: ActionHandlerArgs): Promise<void> => {
      console.log('Handling MarkElementAction');
      checkIfAbortedAndThrowCancellationError(args.signal);

      // need of elements to mark
      // get last assistant message elements
      const lastElements = ASSISTANT_INTERACTION_MESSAGES.at(-1);
      const typedData = data as IMarkElementAction;
      lastElements?.forEach((element) => element.setAttribute(typedData.selector, ''));
      // mark them
    },
  );

  /**
   *  Handler for PlaySoundAction
   */
  ActionHandlerRegistry.register(
    ACTION_TYPE.PLAY_SOUND_ACTION,
    async (data: GraphOutputAction, args: ActionHandlerArgs): Promise<void> => {
      const typedData = data as IPlaySoundAction;
      const chatbotActions = args.interfaceActions;
      const audioUrl = chrome.runtime.getURL(
        APP_CONFIG.SPEECH_AUDIO_FOLDER + typedData.audioFilename,
      );
      const maxDetects = APP_CONFIG.MAX_NO_MESSAGE_FOUND_RETRIES;
      let detectCount = 0;

      while (detectCount <= maxDetects) {
        checkIfAbortedAndThrowCancellationError(args.signal);

        const audio = new Audio(audioUrl);
        let recording = false;
        try {
          chatbotActions.toggleMicrophone();
          recording = true;
          await sleep(1000);

          await playAudioWithSignal(audio, args.signal);

          await sleep(500);

          checkIfAbortedAndThrowCancellationError(args.signal);

          chatbotActions.toggleMicrophone();
          recording = false;

          const inputText = chatbotActions.getTextFromInputField();

          await chatbotActions.sendCurrentInputMessage();

          const mutationManager = new MutationInteractionDetect(
            chatbotActions,
            new MessagesManager(),
            args.signal,
          );
          //TODO : remove hardcoded timeout
          mutationManager.setup(
            chatbotActions.getChabotElements().getWindowElement(),
            new TimeoutManager<HTMLElement[]>(5000),
          );
          mutationManager.setLastUserMessage(inputText);

          const newElements = await mutationManager.init();

          if (newElements.length === 0) {
            detectCount++;
            if (detectCount > maxDetects) {
              sendMessageToBackgroundPort(args.backgroundPort, {
                action: ACTION_PORT.SKIP_OBJECTIVE_INTERACTION,
                data: undefined,
                config: args.threadConfig,
              });
              return;
            }
            continue;
          }

          ASSISTANT_INTERACTION_MESSAGES.push(newElements);

          // Mark question and response
          markQuestion(
            chatbotActions.getChabotElements().getOwnerDocument(),
            inputText,
            args.interactionCount,
          );
          markResponses(newElements, args.interactionCount);

          // prepare input for graph
          const response: string = extractAssistantMessage(newElements);
          const questionInput = new GraphRecognitionInput(response, inputText);
          checkIfAbortedAndThrowCancellationError(args.signal);

          sendMessageToBackgroundPort(args.backgroundPort, {
            action: ACTION_PORT.PROCESS_MESSAGE,
            data: questionInput.toJSON() as IGraphBaseInput,
            config: args.threadConfig,
          });
          break;
        } catch (error) {
          throw error;
        } finally {
          if (recording) {
            chatbotActions.toggleMicrophone();
            // and clear input if needed
            chatbotActions.clearInputFieldOrDiv();
          }
          audio.pause();
          audio.src = '';
          audio.load();
          audio.remove();
        }
      }
    },
  );

  ActionHandlerRegistry.register(
    ACTION_TYPE.QUESTION_ACTION,
    async (data: GraphOutputAction, args: ActionHandlerArgs): Promise<void> => {
      console.log('Handling QuestionAction');
      const chatbotActions = args.interfaceActions;
      const typedData = data as IQuestionAction;
      let detectCount = 0;
      const maxDetects = APP_CONFIG.MAX_NO_MESSAGE_FOUND_RETRIES;
      // TODO: Torna dificil testar, preciso de depender em abstractions
      while (detectCount <= maxDetects) {
        // if voice interaction, use voice input
        if (args.isVoiceInteraction) {
          checkIfAbortedAndThrowCancellationError(args.signal);

          // logic to input voice message
          await chatbotActions.inputVoiceMessage(typedData.question);
        } else {
          await chatbotActions.insertMessageIntoInput(typedData.question);
        }
        await chatbotActions.sendCurrentInputMessage();
        // Capture Logic
        checkIfAbortedAndThrowCancellationError(args.signal);
        const signal = new AbortController().signal;
        const mutationManager = new MutationInteractionDetect(
          chatbotActions,
          new MessagesManager(),
          signal,
        );
        //TODO : remove hardcoded timeout
        mutationManager.setup(
          chatbotActions.getChabotElements().getWindowElement(),
          new TimeoutManager<HTMLElement[]>(5000),
        );
        mutationManager.setLastUserMessage(typedData.question);
        const newElements = await mutationManager.init();
        checkIfAbortedAndThrowCancellationError(args.signal);

        if (newElements.length === 0) {
          detectCount += 1;
          if (detectCount > maxDetects) {
            sendMessageToBackgroundPort(args.backgroundPort, {
              action: ACTION_PORT.END_INTERACTION,
              data: undefined,
              config: args.threadConfig,
            });
            throw new ErrorClass.ObserverFoundNoMessagesAfterRetryError(
              'Chatbot stopped responding.',
            );
          }
          continue;
        }
        ASSISTANT_INTERACTION_MESSAGES.push(newElements);

        // Mark question and response
        markQuestion(
          chatbotActions.getChabotElements().getOwnerDocument(),
          typedData.question,
          args.interactionCount,
        );
        markResponses(newElements, args.interactionCount);

        // prepare input for graph
        const response: string = extractAssistantMessage(newElements);
        const questionInput = new GraphBaseInput(response);

        sendMessageToBackgroundPort(args.backgroundPort, {
          action: ACTION_PORT.PROCESS_MESSAGE,
          data: questionInput.toJSON() as IGraphBaseInput,
          config: args.threadConfig,
        });
        break;
      }
    },
  );

  ActionHandlerRegistry.register(
    ACTION_TYPE.SET_BROWSER_TEST_OUTCOME_ACTION,
    async (data: GraphOutputAction, args: ActionHandlerArgs): Promise<void> => {
      checkIfAbortedAndThrowCancellationError(args.signal);
      console.log('Handling SetBrowserTestOutcomeAction');

      const typedData = data as ISetBrowserTestOutcomeAction;
      EvaluationRunnerFactory.init(args.interfaceActions.getChabotElements());
      // Logic Handler
      const test: RuleTest = {
        code: typedData.check,
        selector: `[${typedData.selector}]`,
        result: typedData.outcome,
      };
      EvaluationRunnerFactory.getInstance().addRuleTested(test);
    },
  );
}

function checkIfAbortedAndThrowCancellationError(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new ErrorClass.CancellationError();
  }
}
/**
 * Function to play audio with abort signal support
 * @param audio HTMLAudioElement to be played
 * @param signal AbortSignal to handle cancellation
 * @returns Promise that resolves when audio ends or rejects on error/abort
 */
function playAudioWithSignal(audio: HTMLAudioElement, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new ErrorClass.CancellationError());

    const onAbort = () => {
      audio.pause();
      cleanup();
      reject(new ErrorClass.CancellationError());
    };

    const onEnded = () => {
      cleanup();
      resolve();
    };

    const onError = (e: ErrorEvent) => {
      cleanup();
      reject(new Error(`Audio playback failed: ${e.message}`));
    };

    const cleanup = () => {
      signal.removeEventListener('abort', onAbort);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError as any);
    };

    signal.addEventListener('abort', onAbort, { once: true });
    audio.addEventListener('ended', onEnded, { once: true });
    audio.addEventListener('error', onError as any, { once: true });

    audio.play().catch(onError as any);
  });
}
