<script lang="ts">
  import { onMount } from 'svelte';

  // Initialize messages as an array with a welcome message
  let messages = [
    { role: "bot", content: "Hi I'm SherBoT! How can I help you today?" }
  ];
  let inputMessage = "";
  let isLoading = false;
  let isAppLoading = true; // New state for initial app loading

  // Simulate app loading and initialization
  onMount(() => {
    // Simulate loading time (you can replace this with actual initialization logic)
    setTimeout(() => {
      isAppLoading = false;
    }, 2500);
  });

  async function sendMessage() {
    if (!inputMessage.trim()) return;

    // Add user message to the chat
    const userMessage = inputMessage.trim();
    messages = [...messages, { role: "user", content: userMessage }];
    inputMessage = "";
    isLoading = true;

    try {
      // Send only the current message to the backend
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Use response.json() directly instead of text() then parse
      const data = await response.json();

      // Check if response exists
      if (!data || !data.response) {
        throw new Error("Invalid response format from server");
      }

      let extractedResponse = data.response;

      try {
        // Remove <Thinking>...</Thinking> content - fixed regex pattern
        extractedResponse = extractedResponse.replace(/<[Tt]hink(ing)?>[\s\S]*?<\/[Tt]hink(ing)?>/g, "");

        // Remove <p> tags but keep the text
        extractedResponse = extractedResponse.replace(/<p>([\s\S]*?)<\/p>/g, "$1").trim();

        // Convert Markdown bold → <strong>
        extractedResponse = extractedResponse.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

        // Convert Markdown italic → <em>
        extractedResponse = extractedResponse.replace(/\*(.+?)\*/g, "<em>$1</em>");

        // Convert Markdown underline → <u>
        extractedResponse = extractedResponse.replace(/__(.+?)__/g, "<u>$1</u>");

        // Remove excessive spaces and newlines
        extractedResponse = extractedResponse.replace(/\s+/g, " ").trim();
      } catch (formatError) {
        console.error("Error formatting response:", formatError);
        extractedResponse = data.response;
      }

      // Add the bot response to messages
      messages = [...messages, { role: "bot", content: extractedResponse }];
    } catch (error: any) {
      console.error("Error:", error);
      messages = [...messages, { role: "bot", content: `Failed to get a response: ${error.message}` }];
    } finally {
      isLoading = false;
      inputMessage = ""; // Reset inputMessage after sending a message
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  }
</script>

{#if isAppLoading}
  <!-- Loading Screen -->
  <div class="loading-screen">
    <div class="loading-content">
      <div class="loading-logo">SHERBOT</div>
      <div class="loading-animation">
        <div class="robot-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16" />
            <line x1="16" y1="16" x2="16" y2="16" />
          </svg>
        </div>
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
        <p class="loading-text">Initializing AI...</p>
      </div>
    </div>
  </div>
{:else}
  <!-- Main App Content -->
  <div class="chat-container">
    <div class="background-image"></div>
    <div class="content-wrapper">
      <div class="chat-header">
        <div class="logo">SHERBOT</div>
      </div>

      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-title-container">
            <h1 class="hero-title-bg">SHERBOT</h1>
            <h2 class="hero-title">
              Unleash the power of AI with <span class="gradient-text">SherBoT</span>
            </h2>
          </div>
          <p class="hero-subtitle">
            Enter SherBoT chat bot, your gateway to unleashing the unparalleled power of AI.
          </p>
          <button class="get-started-btn">
            <span class="arrow">↓</span>
            <span>GET STARTED</span>
          </button>
        </div>

        <div class="chat-interface">
          <div class="robot-container">
            <div class="chat-bubble">Hi I'm SherBoT!</div>
          </div>
          
          <div class="chat-window">
            {#each messages as message}
              <div class="message {message.role}">
                {#if message.role === "bot"}
                  <p>{@html message.content}</p>
                {:else}
                  <p>{message.content}</p>
                {/if}
              </div>
            {/each}

            {#if isLoading}
              <div class="message bot loading">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            {/if}
          </div>

          <div class="input-container">
            <input 
              type="text" 
              bind:value={inputMessage} 
              placeholder="Type your message..." 
              on:keypress={handleKeyPress}
            />
            <button on:click={sendMessage} class="send-btn" aria-label="Send message">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"></path>
                <path d="M22 2 11 13"></path>
              </svg>
            </button>            
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Loading Screen Styles */
  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a1a2e, #16213e, #1f3a63);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .loading-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .loading-logo {
    font-size: 4rem;
    font-weight: 800;
    background: linear-gradient(90deg, #ff6b6b, #a78bfa);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 0 20px rgba(168, 139, 250, 0.3);
    animation: pulse-text 2s infinite;
  }

  .loading-animation {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .robot-icon {
    color: white;
    animation: float 3s ease-in-out infinite;
  }

  .loading-bar {
    width: 250px;
    height: 6px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .loading-progress {
    height: 100%;
    width: 0;
    background: linear-gradient(90deg, #ff6b6b, #a78bfa);
    border-radius: 3px;
    animation: progress 2.5s ease-in-out forwards;
  }

  .loading-text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.2rem;
    margin: 0;
    animation: pulse-opacity 1.5s infinite;
  }

  @keyframes progress {
    0% { width: 0; }
    10% { width: 10%; }
    30% { width: 40%; }
    50% { width: 60%; }
    70% { width: 75%; }
    90% { width: 90%; }
    100% { width: 100%; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }

  @keyframes pulse-opacity {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  @keyframes pulse-text {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.3); }
  }

  /* Global Styles */
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: white;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Background Image */
  .background-image {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OQ50ni2F2gtrZFn6toybXSzXM2hbfD.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: -1;
    opacity: 0.9; /* Adjust opacity as needed */
  }

  /* Add an overlay to ensure text readability */
  .background-image::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(10, 10, 32, 0.7) 0%, rgba(26, 26, 64, 0.7) 50%, rgba(42, 26, 74, 0.7) 100%);
    z-index: -1;
  }

  /* Content wrapper */
  .content-wrapper {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    padding: 0 5%;
  }

  /* Layout */
  .chat-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* Header */
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 0;
  }

  .logo {
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 0 10px rgba(168, 139, 250, 0.8);
  }

  .contact-btn {
    background-color: rgba(67, 56, 202, 0.7);
    color: white;
    border: none;
    border-radius: 9999px;
    padding: 0.8rem 2rem;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .contact-btn:hover {
    background-color: rgba(79, 70, 229, 0.8);
    box-shadow: 0 0 15px rgba(168, 139, 250, 0.6);
  }

  /* Hero Section */
  .hero-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    padding: 4rem 0;
    align-items: center;
  }

  .hero-title-container {
    position: relative;
    margin-bottom: 2rem;
  }

  .hero-title-bg {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 7rem;
    font-weight: 800;
    opacity: 0.1;
    margin: 0;
    color: white;
  }

  .hero-title {
    position: relative;
    font-size: 4rem;
    font-weight: 700;
    line-height: 1.1;
    margin: 0;
    z-index: 1;
    text-shadow: 0 0 15px rgba(168, 139, 250, 0.5);
  }

  .gradient-text {
    background: linear-gradient(90deg, #ff6b6b, #a78bfa);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: none;
  }

  .hero-subtitle {
    font-size: 1.2rem;
    color: #d1d5db;
    max-width: 90%;
    margin-bottom: 2.5rem;
  }

  .get-started-btn {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    background: linear-gradient(90deg, rgba(67, 56, 202, 0.8), rgba(168, 139, 250, 0.8));
    color: white;
    border: none;
    border-radius: 9999px;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 20px rgba(168, 139, 250, 0.3);
  }

  .get-started-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 25px rgba(168, 139, 250, 0.5);
  }

  .arrow {
    transform: rotate(-90deg);
    display: inline-block;
    font-size: 1.5rem;
  }

  /* Chat Interface */
  .chat-interface {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 1200px;  /* Increased max-width for larger chat box */
    margin: 0 auto;
    z-index: 9999;
  }

  .chat-window {
    background-color: rgba(15, 15, 30, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    padding: 1rem;
    height: 600px; /* Adjusted height for better visibility */
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: -120px;
    box-shadow: 0 0 30px rgba(67, 56, 202, 0.3);
  }

  .message {
    padding: 1rem 1.5rem;
    border-radius: 1rem;
    max-width: 85%;
    animation: fadeIn 0.3s ease-out;
    font-size: 1rem;
  }

  /* Add styles for message positioning */
  .message.user {
    align-self: flex-end; /* Right for user */
    background-color: rgba(67, 56, 202, 0.7);
    color: white;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  .message.bot {
    align-self: flex-start; /* Left for bot */
    background-color: rgba(99, 102, 241, 0.7);
    color: white;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  /* Input Section */
  .input-container {
    display: flex;
    gap: 0.8rem;
    margin-top: 1.5rem;
  }

  input {
    flex: 1;
    background-color: rgba(30, 30, 60, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 1rem 1.2rem;
    border-radius: 9999px;
    outline: none;
    transition: all 0.2s;
    font-size: 1.1rem;
    backdrop-filter: blur(5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  input:focus {
    border-color: rgba(168, 139, 250, 0.5);
    box-shadow: 0 0 15px rgba(168, 139, 250, 0.3);
  }

  .send-btn {
    background: linear-gradient(90deg, rgba(67, 56, 202, 0.8), rgba(99, 102, 241, 0.8));
    color: white;
    border: none;
    border-radius: 50%;
    width: 3.5rem;
    height: 3.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  .send-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(168, 139, 250, 0.4);
  }

  /* Typing indicator */
  .typing-indicator {
    display: flex;
    gap: 0.3rem;
  }

  .typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: white;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.5);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    
    .hero-section {
      grid-template-columns: 1fr;
    }
    
    .hero-title {
      font-size: 3rem;
    }
    
    .hero-subtitle {
      max-width: 100%;
    }
    
    .chat-interface {
      margin: 0 auto;
    }
  }
</style>