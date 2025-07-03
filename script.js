// Get chatbot elements
const chatbotToggleBtn = document.getElementById('chatbotToggleBtn');
const chatbotPanel = document.getElementById('chatbotPanel');

if (chatbotToggleBtn && chatbotPanel) {
  // Toggle chat open/closed when clicking the button
  chatbotToggleBtn.addEventListener('click', () => {
    chatbotPanel.classList.toggle('open');
  });

  // Close chat when clicking anywhere except the chat panel or button
  document.addEventListener('click', (e) => {
    // If chat is open AND user clicked outside chat area, close it
    if (chatbotPanel.classList.contains('open') && 
        !chatbotPanel.contains(e.target) && 
        !chatbotToggleBtn.contains(e.target)) {
      chatbotPanel.classList.remove('open');
    }
  });
}

// Get chatbot input, send button, and messages area
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSendBtn = document.getElementById('chatbotSendBtn');
const chatbotMessages = document.getElementById('chatbotMessages');

// Store the conversation history
let messages = [];

// Function to send message to OpenAI and display response
async function sendChatMessage() {
  // Get user's message
  const userMessage = chatbotInput.value;
  if (!userMessage) return;

  // Show user's message in chat
  chatbotMessages.innerHTML += `<div class="user-message"><strong>You:</strong> ${userMessage}</div>`;
  chatbotInput.value = '';

  // Add user's message to conversation history
  messages.push({ role: 'user', content: userMessage });

  // Show 'Thinking...' animation
  const thinkingId = 'thinking-message';
  chatbotMessages.innerHTML += `<div class="assistant-message" id="${thinkingId}"><strong>WayChat:</strong> <span class="thinking-dots">Thinking<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span></div>`;
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  try {
    // Send request to OpenAI Chat Completions API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Use the gpt-4o model
        messages: messages // Send the full conversation
      })
    });
    const data = await response.json();
    // Get assistant's reply
    const assistantReply = data.choices[0].message.content;
    // Remove 'Thinking...' message
    const thinkingDiv = document.getElementById(thinkingId);
    if (thinkingDiv) thinkingDiv.remove();
    // Show assistant's reply in chat
    chatbotMessages.innerHTML += `<div class="assistant-message"><strong>WayChat:</strong> ${assistantReply}</div>`;
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    // Add assistant's reply to conversation history
    messages.push({ role: 'assistant', content: assistantReply });
  } catch (error) {
    // Remove 'Thinking...' message
    const thinkingDiv = document.getElementById(thinkingId);
    if (thinkingDiv) thinkingDiv.remove();
    chatbotMessages.innerHTML += `<div class="error-message">Sorry, something went wrong. Please try again.</div>`;
  }
}

// Send message on button click
if (chatbotSendBtn) {
  chatbotSendBtn.addEventListener('click', sendChatMessage);
}

// Send message on Enter key in input box
if (chatbotInput) {
  chatbotInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      sendChatMessage();
    }
  });
}
