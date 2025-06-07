import { GoogleGenerativeAI } from '@google/generative-ai';
import { useEffect, useState } from 'react'

function App() {
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi there, how can I help you today?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      console.log(import.meta.env.VITE_GEMINI_API_KEY)

      const chat = model.startChat({
        history: messages.map(msg => ({
          role: "user",
          parts: [{ text: msg.content }],
        })),
      });

      const result = await chat.sendMessage(input);
      const response = await result.response;
      const text = response.text();

      const assistantMessage = {
        role: "assistant",
        content: text
      };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 h-screen flex flex-col dark:bg-gray-800 dark:text-gray-50">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'assistant' ? 'justify-end' : 'justify-start'} mt-2`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-sm ${message.role === 'assistant'
                ? 'bg-green-500 text-white mr-2'
                : 'bg-gray-300 text-black ml-2'
                }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end mt-2 mr-2">
            <div className="bg-green-500 rounded-lg px-4 py-2 text-white">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className='flex items-center'>
          <input type="text"
            className='w-full border rounded-lg py-2 px-4 dark:bg-gray-700 dark:text-gray-200'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type a message'
          />
          <button type='submit' className='bg-green-500 hover:ng-green-600 rounded-lg px-4 text-white ml-2'>Send</button>
        </div>
      </form>
    </div>
  );
}

export default App
