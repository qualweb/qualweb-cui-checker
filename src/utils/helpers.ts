export function showMessage(message: string, timeOut: number = 5000): void {
  hideMessage();
  const messageElement = document.createElement('div');
  messageElement.id = 'QW_selection-message';
  messageElement.style.pointerEvents = 'none'; // Make it non-interactable

  messageElement.style.position = 'fixed';
  messageElement.style.top = '10%';
  messageElement.style.left = '50%';
  messageElement.style.transform = 'translate(-50%, -50%)';
  messageElement.style.backgroundColor = 'rgba(225, 85, 0, 0.7)';
  messageElement.style.color = 'white';
  messageElement.style.padding = '10px';
  messageElement.style.fontSize = '1.2em';
  messageElement.style.fontWeight = '900';
  messageElement.style.textAlign = 'center';
  messageElement.style.borderRadius = '5px';
  messageElement.style.boxShadow = '0 0 10px rgba(133, 89, 89, 0.1)';
  messageElement.style.zIndex = '10000';

  messageElement.textContent = message;
  document.body.appendChild(messageElement);

  setTimeout(() => {
    if (messageElement) {
      hideMessage();
    }
  }, timeOut);
}

export function hideMessage() {
  const existingMessageElement = document.getElementById('QW_selection-message');
  if (existingMessageElement) {
    existingMessageElement.remove();
  }
}
