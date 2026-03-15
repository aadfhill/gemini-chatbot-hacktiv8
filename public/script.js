document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  /**
   * Appends a message to the chat box and scrolls to the latest message.
   * @param {string} text - The content of the message.
   * @param {string} sender - The sender of the message, 'user' or 'bot'.
   * @returns {HTMLElement} The newly created message element.
   */
  const addMessage = (text, sender) => {
    const messageElement = document.createElement('div');
    // Sanitize text by setting textContent to prevent XSS
    messageElement.textContent = text;
    messageElement.className = `message ${sender}-message`;
    chatBox.appendChild(messageElement);
    // Ensure the chat box scrolls to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
  };

  /**
   * Handles the chat form submission.
   * - Displays the user's message.
   * - Shows a "Thinking..." placeholder.
   * - Sends the message to the backend API.
   * - Replaces the placeholder with the AI's response or an error message.
   */
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = userInput.value.trim();

    if (userText === '') {
      return; // Do not send empty messages
    }

    // 1. Add the user's message to the chat box
    addMessage(userText, 'user');
    userInput.value = ''; // Clear the input field immediately

    // 2. Show a temporary "Thinking..." bot message
    const thinkingMessage = addMessage('Thinking...', 'bot');

    try {
      // 3. Send the user's message to the backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: [{ role: 'user', text: userText }],
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }

      const data = await response.json();

      // 4. Replace "Thinking..." with the AI's reply or a fallback message
      if (data && data.result) {
        thinkingMessage.textContent = data.result;
      } else {
        thinkingMessage.textContent = 'Sorry, no response received.';
      }
    } catch (error) {
      console.error('Failed to get response from server:', error);
      // 5. Show an error message if the fetch fails
      thinkingMessage.textContent = 'Failed to get response from server.';
    }
  });
});
