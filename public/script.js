document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  // Set options for Marked.js to ensure it renders HTML safely
  // and adds breaks for newlines.
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  /**
   * Appends a message to the chat box.
   * @param {string} content - The message content (can be text or HTML).
   * @param {string} sender - The sender ('user' or 'bot').
   * @param {boolean} isHtml - Flag to treat content as HTML.
   * @returns {HTMLElement} The created message element.
   */
  const addMessage = (content, sender, isHtml = false) => {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;

    if (isHtml) {
      // Use the 'marked' library to parse markdown and sanitize it
      messageElement.innerHTML = marked.parse(content);
    } else {
      // For user messages, just set textContent to prevent XSS
      messageElement.textContent = content;
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
  };

  /**
   * Handles the chat form submission.
   */
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = userInput.value.trim();

    if (userText === '') {
      return;
    }

    // 1. Add user's message (as plain text)
    addMessage(userText, 'user');
    userInput.value = '';

    // 2. Show a temporary loading animation
    const loadingHtml = `
      <div class="loading-spinner">
        <span class="bounce1"></span>
        <span class="bounce2"></span>
        <span class="bounce3"></span>
      </div>
    `;
    const thinkingMessage = addMessage(loadingHtml, 'bot', true);
    thinkingMessage.style.backgroundColor = 'transparent'; // Make loader background invisible

    try {
      // 3. Send message to the backend
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
      
      // 4. Replace loader with AI's reply or an error message
      thinkingMessage.style.backgroundColor = ''; // Restore default background

      if (data && data.result) {
        // Render the markdown response as HTML
        thinkingMessage.innerHTML = marked.parse(data.result);
      } else {
        thinkingMessage.textContent = 'Sorry, no response received.';
      }
    } catch (error) {
      console.error('Failed to get response from server:', error);
      thinkingMessage.style.backgroundColor = ''; // Restore default background
      thinkingMessage.textContent = 'Failed to get response from server.';
    }
  });
});
