// ChatbotWidget.js
(function() {
    // Tạo một ID duy nhất để tránh xung đột
    const uniqueID = 'chatbot-widget-' + Math.floor(Math.random() * 10000);
    
    // Tạo style với CSS scoped bằng ID
    const style = document.createElement('style');
    style.textContent = `
      #${uniqueID} .chat-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #4a6bdf;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        z-index: 999;
        transition: all 0.3s ease;
      }
      
      #${uniqueID} .chat-button:hover {
        transform: scale(1.1);
        background-color: #3451b2;
      }
      
      #${uniqueID} .chat-icon {
        color: white;
        font-size: 24px;
      }
      
      #${uniqueID} .chat-container {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 350px;
        height: 450px;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        z-index: 998;
        transform-origin: bottom right;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        opacity: 0;
        transform: scale(0);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      #${uniqueID} .chat-container.active {
        opacity: 1;
        transform: scale(1);
      }
      
      #${uniqueID} .chat-header {
        padding: 15px 20px;
        background-color: #4a6bdf;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      #${uniqueID} .chat-title {
        font-weight: 600;
        font-size: 16px;
        margin: 0;
      }
      
      #${uniqueID} .close-chat {
        cursor: pointer;
        font-size: 18px;
      }
      
      #${uniqueID} .chat-messages {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        background-color: #f5f7fb;
      }
      
      #${uniqueID} .message {
        margin-bottom: 10px;
        max-width: 80%;
        padding: 10px 15px;
        border-radius: 18px;
        line-height: 1.4;
        position: relative;
        font-size: 14px;
      }
      
      #${uniqueID} .bot-message {
        background-color: #e6e9f0;
        color: #333;
        border-top-left-radius: 5px;
        margin-right: auto;
      }
      
      #${uniqueID} .user-message {
        background-color: #4a6bdf;
        color: white;
        border-top-right-radius: 5px;
        margin-left: auto;
      }
      
      #${uniqueID} .chat-input-container {
        padding: 15px;
        border-top: 1px solid #e6e9f0;
        display: flex;
        background-color: #fff;
      }
      
      #${uniqueID} .chat-input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 10px 15px;
        outline: none;
        font-size: 14px;
      }
      
      #${uniqueID} .send-button {
        background-color: #4a6bdf;
        color: white;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        margin-left: 10px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color 0.2s;
      }
      
      #${uniqueID} .send-button:hover {
        background-color: #3451b2;
      }
      
      #${uniqueID} .typing-indicator {
        display: none;
        padding: 10px 15px;
        background-color: #e6e9f0;
        border-radius: 18px;
        margin-bottom: 10px;
        width: fit-content;
        border-top-left-radius: 5px;
      }
      
      #${uniqueID} .typing-dots span, #${uniqueID} .typing-indicator span {
        height: 8px;
        width: 8px;
        background-color: #888;
        border-radius: 50%;
        display: inline-block;
        margin-right: 3px;
        animation: bounce-${uniqueID} 1.3s linear infinite;
      }
      
      #${uniqueID} .typing-dots span:nth-child(2), #${uniqueID} .typing-indicator span:nth-child(2) {
        animation-delay: 0.15s;
      }
      
      #${uniqueID} .typing-dots span:nth-child(3), #${uniqueID} .typing-indicator span:nth-child(3) {
        animation-delay: 0.3s;
        margin-right: 0;
      }
      
      @keyframes bounce-${uniqueID} {
        0%, 60%, 100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-4px);
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Tạo HTML cho widget
    const widgetHTML = `
      <div id="${uniqueID}">
        <!-- Nút chat -->
        <div class="chat-button" id="chatButton-${uniqueID}">
          <div class="chat-icon">💬</div>
        </div>
        
        <!-- Container của chatbox -->
        <div class="chat-container" id="chatContainer-${uniqueID}">
          <div class="chat-header">
            <p class="chat-title">Chat Hỗ Trợ</p>
            <div class="close-chat" id="closeChat-${uniqueID}">✕</div>
          </div>
          
          <div class="chat-messages" id="chatMessages-${uniqueID}">
            <div class="message bot-message">
              Xin chào! Tôi có thể giúp gì cho bạn hôm nay?
            </div>
            
            <div class="typing-indicator" id="typingIndicator-${uniqueID}">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          
          <div class="chat-input-container">
            <input type="text" class="chat-input" id="chatInput-${uniqueID}" placeholder="Nhập tin nhắn..." />
            <button class="send-button" id="sendButton-${uniqueID}">
              <span>➤</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Chèn HTML vào body
    const widgetContainer = document.createElement('div');
    widgetContainer.innerHTML = widgetHTML;
    document.body.appendChild(widgetContainer.firstElementChild);
    
    // Lấy các phần tử DOM với ID độc nhất
    const chatButton = document.getElementById(`chatButton-${uniqueID}`);
    const chatContainer = document.getElementById(`chatContainer-${uniqueID}`);
    const closeChat = document.getElementById(`closeChat-${uniqueID}`);
    const chatInput = document.getElementById(`chatInput-${uniqueID}`);
    const sendButton = document.getElementById(`sendButton-${uniqueID}`);
    const chatMessages = document.getElementById(`chatMessages-${uniqueID}`);
    const typingIndicator = document.getElementById(`typingIndicator-${uniqueID}`);
    
    // Mở/đóng chat box
    chatButton.addEventListener('click', () => {
      chatContainer.classList.toggle('active');
      if (chatContainer.classList.contains('active')) {
        chatInput.focus();
      }
    });
    
    closeChat.addEventListener('click', () => {
      chatContainer.classList.remove('active');
    });
    
    // Xử lý việc gửi tin nhắn
    async function sendMessage() {
      const message = chatInput.value.trim();
      if (message !== '') {
        // Thêm tin nhắn người dùng
        addMessage(message, 'user');
        chatInput.value = '';
        
        // Tạo phần tử phản hồi mới ngay sau tin nhắn người dùng
        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('message', 'bot-message');
        chatMessages.appendChild(botMessageDiv);
        
        // Tạo typing indicator bên trong tin nhắn bot
        const typingDots = document.createElement('div');
        typingDots.innerHTML = '<span></span><span></span><span></span>';
        typingDots.classList.add('typing-dots');
        botMessageDiv.appendChild(typingDots);
        
        // Cuộn xuống tin nhắn mới nhất
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
          // Gọi API tới Gemini API
          const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=AIzaSyBQ0UiYXzKytMdJOQt5NORhZCUjDO_kcZc', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: message
                    }
                  ]
                }
              ]
            })
          });
  
          if (!response.ok) {
            throw new Error('Lỗi kết nối với Gemini API');
          }
  
          // Xử lý phản hồi từ API
          const result = await response.json();
  
          let fullText = '';
          const candidates = result.candidates || [];
          
          if (candidates.length > 0) {
            fullText = candidates[0].content.parts[0].text;
            botMessageDiv.textContent = fullText;
            
            // Cuộn xuống để theo dõi văn bản mới
            chatMessages.scrollTop = chatMessages.scrollHeight;
          } else {
            botMessageDiv.textContent = "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.";
          }
          
        } catch (error) {
          console.error('Lỗi:', error);
          botMessageDiv.textContent = "Xin lỗi, đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng đảm bảo Gemini API hoạt động chính xác.";
        }
      }
    }
    
    sendButton.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    // Thêm tin nhắn vào khung chat
    function addMessage(text, sender) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message');
      messageDiv.classList.add(sender + '-message');
      messageDiv.textContent = text;
      
      chatMessages.appendChild(messageDiv);
      
      // Cuộn xuống tin nhắn mới nhất
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Export API cho widget (nếu cần)
    window.ChatbotWidget = window.ChatbotWidget || {};
    window.ChatbotWidget[uniqueID] = {
      open: function() {
        chatContainer.classList.add('active');
      },
      close: function() {
        chatContainer.classList.remove('active');
      },
      toggle: function() {
        chatContainer.classList.toggle('active');
      },
      sendMessage: function(text) {
        chatInput.value = text;
        sendMessage();
      }
    };
    
    return window.ChatbotWidget[uniqueID];
  })();