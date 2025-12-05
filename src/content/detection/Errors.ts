export class IframeNotAccessibleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'IframeNotAccessibleError';
  }
}
