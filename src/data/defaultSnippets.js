// Default snippets with different field types: text, password, rich (multiline)
export const defaultSnippets = [
  {
    id: '1',
    title: 'Social Media Post',
    fields: [
      { label: 'Post', value: `🚀 Excited to share my latest project!

Built a clipboard helper app with:
✨ One-click copy
📝 Code formatting
🌙 Dark mode support

Check it out and let me know what you think!

#coding #webdev #javascript #react`, type: 'rich' }
    ]
  },
  {
    id: '2',
    title: 'React Form Template',
    fields: [
      { label: 'Code', value: `const ContactForm = () => {
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
      <button type="submit">Send</button>
    </form>
  );
};`, type: 'rich' }
    ]
  },
  {
    id: '3',
    title: 'AI Prompt - Code Review',
    fields: [
      { label: 'Prompt', value: `Please review this code and provide feedback on:

1. Code quality and best practices
2. Potential bugs or edge cases
3. Performance optimizations
4. Security considerations
5. Suggestions for improvement

Be specific with line numbers and provide code examples for suggested changes.`, type: 'rich' }
    ]
  },
  {
    id: '4',
    title: 'Database Login',
    fields: [
      { label: 'Host', value: 'db.example.com:5432', type: 'text' },
      { label: 'Username', value: 'admin', type: 'text' },
      { label: 'Password', value: 'super_secret_123', type: 'password' }
    ]
  },
  {
    id: '5',
    title: 'API Endpoint',
    fields: [
      { label: 'URL', value: 'https://api.example.com/users', type: 'text' },
      { label: 'Method', value: 'POST', type: 'text' },
      { label: 'Headers', value: 'Content-Type: application/json\nAuthorization: Bearer token', type: 'rich' }
    ]
  }
];

export default defaultSnippets;
