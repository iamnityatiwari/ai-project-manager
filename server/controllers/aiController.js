const OpenAI = require('openai');
const Task = require('../models/Task');
const User = require('../models/User');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// @desc    Get AI suggestions for task assignment
// @route   POST /api/ai/suggest
// @access  Private
const getTaskSuggestions = async (req, res) => {
    try {
        const tasks = await Task.find({ status: 'Todo' }); // Analyze unstarted tasks
        const users = await User.find({}).select('name skills role');

        if (tasks.length === 0) {
            return res.json({ message: 'No Todo tasks to analyze', suggestions: [] });
        }

        const prompt = `
      You are a project manager AI.
      Here are the teams skills: ${JSON.stringify(users)}
      Here are the unassigned tasks: ${JSON.stringify(tasks)}

      Please assign these tasks to the most suitable team members based on their skills.
      Also, suggest a priority (Low, Medium, High) and a realistic deadline (in YYYY-MM-DD format) considering today is ${new Date().toISOString().split('T')[0]}.
      
      Return the response ONLY as a JSON array with this format:
      [
        {
          "taskId": "id_of_task",
          "assignedTo": "id_of_user",
          "reason": "Why this person is a good fit",
          "suggestedPriority": "High",
          "suggestedDeadline": "2024-12-31"
        }
      ]
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'system', content: 'You are a helpful assistant that outputs JSON.' }, { role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
        });

        const suggestions = JSON.parse(completion.choices[0].message.content);

        res.json(suggestions);
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ message: 'AI Service Failed', error: error.message });
    }
};

module.exports = { getTaskSuggestions };
