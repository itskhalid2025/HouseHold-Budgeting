import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, TrendingUp, DollarSign, Target } from 'lucide-react';

const AdvisorChatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI financial advisor. I can help you save money, reach your goals faster, and make smarter spending decisions. What would you like help with today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { 
      icon: DollarSign, 
      text: "How can I save more money?",
      color: "green"
    },
    { 
      icon: TrendingUp, 
      text: "Analyze my spending trends",
      color: "blue"
    },
    { 
      icon: Target, 
      text: "Help me reach my goals faster",
      color: "purple"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowQuickActions(false);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: generateMockResponse(input),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
  };

  const handleQuickAction = (text) => {
    setInput(text);
    setShowQuickActions(false);
  };

  const generateMockResponse = (query) => {
    // Mock AI responses based on query
    if (query.toLowerCase().includes('save')) {
      return `Great question! Based on your spending data, I've identified 3 key opportunities:

**1. Reduce Dining Out by 30%** 💰
- Current: $400/month
- Target: $280/month
- Monthly Savings: **$120**
- Yearly Impact: **$1,440**
- Difficulty: Medium

This would help you reach your Emergency Fund goal **2 months earlier** by March 2026!

**2. Switch Streaming Services** 📺
- Current: $45/month (3 services)
- Recommended: Bundle for $30/month
- Monthly Savings: **$15**
- Difficulty: Easy

**3. Meal Prep Sundays** 🍱
- Prepare 5 lunches/week instead of eating out
- Estimated Savings: **$80/month**
- Difficulty: Medium

**Total Potential Savings: $215/month ($2,580/year)**

Would you like me to create a specific action plan for any of these?`;
    } else if (query.toLowerCase().includes('trend')) {
      return `I've analyzed your last 3 months of spending. Here's what stands out:

**Positive Trends** ✅
- Your savings rate increased from 12% to 18% - fantastic progress!
- Housing costs stayed flat at $800/month (very stable)
- You reduced dining expenses by 25% in the last month

**Areas to Watch** ⚠️
- Entertainment spending spiked 40% in December (likely holiday-related)
- Grocery costs increasing by ~$30/month (inflation impact)

**Pattern I Notice:**
You tend to spend more on weekends, averaging $120 vs $45 on weekdays. Consider setting a weekend budget alert.

Overall, you're trending in the **right direction**! Keep it up! 🎉`;
    } else if (query.toLowerCase().includes('goal')) {
      return `Let's accelerate your goal progress! You have 2 active goals:

**Emergency Fund** 🎯
- Target: $5,000
- Current: $2,400 (48%)
- At current pace: June 2026
- **How to finish 2 months earlier:**
  - Save additional $120/month by reducing dining
  - Projected completion: **April 2026**

**Vacation Fund** ✈️
- Target: $3,000
- Current: $800 (27%)
- At current pace: September 2026
- **Acceleration strategy:**
  - Allocate $150/month from reduced wants spending
  - Side income opportunity: Sell unused items
  - New completion: **July 2026**

**Quick Win**: Cancel that unused gym membership ($40/month) and put it toward your vacation fund!

Which goal would you like to prioritize?`;
    } else {
      return `I'm here to help! I can assist you with:

- 💰 Finding ways to save more money
- 📊 Analyzing your spending patterns
- 🎯 Reaching your financial goals faster
- 🔍 Identifying wasteful expenses
- 📈 Creating personalized budgets

What specific area would you like to focus on?`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl p-6 shadow-sm border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Financial Advisor</h1>
              <p className="text-gray-600">Get personalized savings recommendations</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white shadow-sm" style={{ height: '500px', overflowY: 'auto' }}>
          <div className="p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-700" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {showQuickActions && messages.length === 1 && (
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.text)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 border-${action.color}-200 bg-${action.color}-50 hover:bg-${action.color}-100 transition text-left`}
                  >
                    <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                    <span className="text-gray-900 font-medium">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="bg-white rounded-b-2xl p-4 shadow-sm border-t border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your finances..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvisorChatbot;