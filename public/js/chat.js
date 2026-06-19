/**
 * AI Assistant Chat Bubble logic
 * Handles floating bubble toggle state, message histories, typing indicators, and requests.
 */

class IncubatorChat {
  constructor() {
    this.bubble = document.getElementById("ai-chat-bubble");
    this.trigger = this.bubble.querySelector(".chat-bubble-trigger");
    this.closeBtn = document.getElementById("close-chat-btn");
    this.messagesContainer = document.getElementById("chat-messages");
    this.inputForm = document.getElementById("chat-input-form");
    this.messageInput = document.getElementById("chat-message-input");
    this.unreadBadge = this.bubble.querySelector(".chat-unread-badge");
    
    this.chatHistory = [];
    this.startupContext = null; // Will be set by main app when analysis finishes

    this.initEvents();
    this.initGreetingDelay();
  }

  initEvents() {
    // Open chat
    this.trigger.addEventListener("click", () => this.expandChat());
    
    // Close chat
    this.closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.collapseChat();
    });

    // Submit message
    this.inputForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleUserSubmit();
    });
  }

  initGreetingDelay() {
    // Show unread notification badge 2.5 seconds after page load to alert user
    setTimeout(() => {
      if (!this.bubble.classList.contains("chat-bubble-expanded")) {
        this.unreadBadge.style.display = "flex";
      }
    }, 2500);
  }

  expandChat() {
    this.bubble.classList.remove("chat-bubble-collapsed");
    this.bubble.classList.add("chat-bubble-expanded");
    this.unreadBadge.style.display = "none";
    this.scrollToBottom();
    this.messageInput.focus();
  }

  collapseChat() {
    this.bubble.classList.remove("chat-bubble-expanded");
    this.bubble.classList.add("chat-bubble-collapsed");
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  setStartupContext(context) {
    this.startupContext = context;
    // System message notify chat that context is synchronized
    this.addMessage("model", `Excellent! I see you analyzed the startup concept: "${context.idea.substring(0, 35)}...". I am fully synchronized. You can ask me how to mitigate risks, improve success metrics, or draft customer surveys!`);
  }

  addMessage(sender, text) {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const msgElement = document.createElement("div");
    msgElement.className = `chat-message ${sender}`;
    
    msgElement.innerHTML = `
      <div class="message-content">${this.escapeHTML(text)}</div>
      <span class="message-time">${timeString}</span>
    `;

    this.messagesContainer.appendChild(msgElement);
    this.scrollToBottom();
    
    // Add to history
    this.chatHistory.push({ sender, text });
  }

  showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "chat-message model typing-indicator-wrapper";
    indicator.id = "chat-typing-indicator";
    indicator.innerHTML = `
      <div class="typing-bubble">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    this.messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    const indicator = document.getElementById("chat-typing-indicator");
    if (indicator) {
      indicator.remove();
    }
  }

  async handleUserSubmit() {
    const text = this.messageInput.value.trim();
    if (!text) return;

    // Clear input field
    this.messageInput.value = "";
    
    // Add user message
    this.addMessage("user", text);
    
    // Show typing state
    this.showTypingIndicator();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: this.chatHistory.slice(0, -1), // Send history up to before this message
          context: this.startupContext
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with advisor backend.");
      }

      const data = await response.json();
      this.removeTypingIndicator();
      this.addMessage("model", data.reply);

    } catch (error) {
      console.error("Chat submission error:", error);
      this.removeTypingIndicator();
      this.addMessage("model", "Apologies, I encountered a temporary connection bottleneck. Please try sending your prompt again.");
    }
  }

  escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Instantiate globally when document scripts load
window.chatBubbleInstance = new IncubatorChat();
