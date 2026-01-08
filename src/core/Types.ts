export interface IChildListMutations {
  checkAddedNodes: (mutation: MutationRecord) => void;
  checkRemovedNodes: (mutation: MutationRecord) => void;
  checkTextContent: (mutation: MutationRecord) => void;
}

export interface ICharacterDataMutations {
  checkCharacterDataChange: (mutation: MutationRecord) => void;
}

export interface IAttributeMutations {
  checkAttributeChange: (mutation: MutationRecord) => void;
}

export type MutationTypes = IChildListMutations & ICharacterDataMutations & IAttributeMutations;

export type DetailedMutationEvent =
  | 'childList:added'
  | 'childList:removed'
  | 'characterData:change'
  | 'attributes:change';

export type MutationHandler = (mutation: MutationRecord) => void;

interface IMutationProcessor {
  process(
    mutation: MutationRecord,
    emitter: (event: string, mutation: MutationRecord) => void,
  ): void;
}

const ChildListProcessor: IMutationProcessor = {
  process(mutation, emit) {
    if (mutation.addedNodes.length > 0) {
      emit('childList:added', mutation);
    }
    if (mutation.removedNodes.length > 0) {
      emit('childList:removed', mutation);
    }
  },
};

const CharacterDataProcessor: IMutationProcessor = {
  process(mutation, emit) {
    emit('characterData:change', mutation);
  },
};

const AttributesProcessor: IMutationProcessor = {
  process(mutation, emit) {
    emit('attributes:change', mutation);
  },
};

export const MUTATION_PROCESSOR_REGISTRY: Record<string, IMutationProcessor> = {
  childList: ChildListProcessor,
  characterData: CharacterDataProcessor,
  attributes: AttributesProcessor,
};
