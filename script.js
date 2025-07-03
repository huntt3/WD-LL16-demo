// Get chatbot elements
const chatbotToggleBtn = document.getElementById('chatbotToggleBtn');
const chatbotPanel = document.getElementById('chatbotPanel');
const chatbotSendBtn = document.getElementById('chatbotSendBtn');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotMessages = document.getElementById('chatbotMessages');

// Store the conversation history
let messages = [];

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

// Function to add a message to the chat window
function addMessageToChat(role, text) {
  // Create a new div for the message
  const messageDiv = document.createElement('div');
  // Add a class for styling (optional)
  messageDiv.className = role === 'user' ? 'user-message' : 'assistant-message';
  // If assistant, format text with line breaks for readability
  if (role === 'assistant') {
    // Replace double line breaks with two <br> for section spacing, and single with one <br>
    const formatted = text
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
    messageDiv.innerHTML = formatted;
  } else {
    messageDiv.textContent = text;
  }
  // Add the message to the chat window
  chatbotMessages.appendChild(messageDiv);
  // Scroll to the bottom
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Function to send user input to OpenAI and get a response
async function sendMessageToOpenAI(userInput) {
  // Add the user's message to the chat window
  addMessageToChat('user', userInput);

  // Add the user's message to the messages array
  messages.push({ role: 'user', content: userInput });

  // Add 'Thinking...' animation
  const thinkingDiv = document.createElement('div');
  thinkingDiv.className = 'assistant-message';
  thinkingDiv.id = 'thinking-message';
  thinkingDiv.innerHTML = '<strong>WayChat:</strong> <span class="thinking-dots">Thinking<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>';
  chatbotMessages.appendChild(thinkingDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  // Prepare the API request
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}` // Use your API key from secrets.js
  };
  const body = {
    model: 'gpt-4o',
    messages: messages, // Send the full conversation history
    temperature: 0.8, // Make the assistant more creative
    max_tokens: 300   // Keep responses short and focused
  };

  try {
    // Send the request to OpenAI
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });
    // Parse the response as JSON
    const data = await response.json();
    // Remove 'Thinking...' animation
    const thinkingMsg = document.getElementById('thinking-message');
    if (thinkingMsg) thinkingMsg.remove();
    // Get the assistant's reply
    const assistantReply = data.choices && data.choices[0].message.content;
    // Add the assistant's reply to the chat window
    addMessageToChat('assistant', assistantReply);
    // Add the assistant's reply to the messages array
    messages.push({ role: 'assistant', content: assistantReply });
  } catch (error) {
    // Remove 'Thinking...' animation
    const thinkingMsg = document.getElementById('thinking-message');
    if (thinkingMsg) thinkingMsg.remove();
    // Show an error message if something goes wrong
    addMessageToChat('assistant', 'Sorry, there was an error.');
    console.error(error);
  }
}

// Listen for the send button click
if (chatbotSendBtn && chatbotInput) {
  chatbotSendBtn.addEventListener('click', () => {
    const userInput = chatbotInput.value.trim();
    if (userInput) {
      sendMessageToOpenAI(userInput);
      chatbotInput.value = '';
    }
  });
}

// Send message on Enter key in input box
if (chatbotInput) {
  chatbotInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      const userInput = chatbotInput.value.trim();
      if (userInput) {
        sendMessageToOpenAI(userInput);
        chatbotInput.value = '';
      }
    }
  });
}