// Default snippets with JS, post text, form code, and prompts as requested
export const defaultSnippets = [
  {
    id: '1',
    title: 'Array Map Example',
    content: `const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(num => num * 2);
console.log(doubled);
// Output: [2, 4, 6, 8, 10]`
  },
  {
    id: '2',
    title: 'Async/Await Fetch',
    content: `const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};`
  },
  {
    id: '3',
    title: 'Social Media Post',
    content: `🚀 Excited to share my latest project!

Built a clipboard helper app with:
✨ One-click copy
📝 Code formatting
🌙 Dark mode support

Check it out and let me know what you think!

#coding #webdev #javascript #react`
  },
  {
    id: '4',
    title: 'React Form Template',
    content: `const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({
          ...formData, 
          name: e.target.value
        })}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({
          ...formData, 
          email: e.target.value
        })}
      />
      <textarea
        placeholder="Message"
        value={formData.message}
        onChange={(e) => setFormData({
          ...formData, 
          message: e.target.value
        })}
      />
      <button type="submit">Send</button>
    </form>
  );
};`
  },
  {
    id: '5',
    title: 'AI Prompt - Code Review',
    content: `Please review this code and provide feedback on:

1. Code quality and best practices
2. Potential bugs or edge cases
3. Performance optimizations
4. Security considerations
5. Suggestions for improvement

Be specific with line numbers and provide code examples for suggested changes.`
  },
  {
    id: '6',
    title: 'useEffect Cleanup',
    content: `useEffect(() => {
  const controller = new AbortController();
  
  const fetchData = async () => {
    try {
      const res = await fetch('/api/data', {
        signal: controller.signal
      });
      const data = await res.json();
      setData(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    }
  };

  fetchData();

  // Cleanup function
  return () => controller.abort();
}, [dependency]);`
  }
];

export default defaultSnippets;
