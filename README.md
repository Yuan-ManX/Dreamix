<div align="center">

# Dreamix

### An AI-Native Interactive Video Agent. 🎬
### From Ideas to Interactive Stories. 🎮

</div>

## 🌟 What is Dreamix?

Dreamix is an AI-native interactive video agent platform that transforms ideas into compelling video stories through natural language conversations. By combining a powerful AI agent infrastructure with advanced video creation capabilities, Dreamix democratizes high-quality video production, making it accessible to everyone from beginners to professionals.

Whether you're a content creator, marketer, educator, or storyteller, Dreamix empowers you to bring your vision to life with unprecedented ease and creativity.

## ✨ Key Features

### 🤖 Intelligent Agent Platform
- **Multi-LLM Support**: Works seamlessly with major LLM providers (Anthropic, OpenAI, and more)
- **Extensible Tool System**: Build and integrate custom tools for specialized workflows
- **Secure Execution**: Isolated environments for safe agent operations
- **Conversation Memory**: Context-aware interactions that remember your preferences

### 🎬 Smart Video Creation
- **Intelligent Script Generation**: Auto-generates storylines, narration, and visual suggestions based on your themes
- **Media Search & Organization**: Finds, downloads, and organizes relevant images and video clips automatically
- **Style Transfer**: Define your preferred tone (casual, professional, humorous, etc.) via reference examples
- **Smart Recommendations**: Suggests music, voiceovers, and fonts that match your content's mood and style

### 💬 Conversational Editing
- **Natural Language Control**: Edit your video entirely through conversation - no complex timelines to master
- **Real-Time Preview**: See changes instantly as you refine your creation
- **Precision Refinement**: Adjust colors, fonts, timing, and more with simple prompts
- **Iterative Improvement**: Refine and polish your video through multiple conversation rounds

### 🛠️ Skill-Based Workflows
- **Custom Skill Creation**: Save your complete editing workflow as reusable skills
- **Batch Processing**: Apply the same style and workflow to multiple media assets instantly
- **Built-in Skill Library**: Access pre-built skills for common video creation patterns
- **Share & Collaborate**: Export and share your skills with the community

## 🏗️ Architecture

Dreamix is built on a cohesive, modular architecture designed for scalability and extensibility:

### Core Components
- **Backend API**: Python/FastAPI service powering agent orchestration and video processing
- **Frontend Dashboard**: Next.js/React application providing intuitive user interface
- **Agent Runtime**: Isolated execution environments for secure agent operations
- **Data Layer**: PostgreSQL + Supabase for persistent storage and real-time updates

### Technology Stack
- **Backend**: Python 3.7+, FastAPI, LangChain
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Video Processing**: FFmpeg, MoviePy
- **Containerization**: Docker, Docker Compose
- **Database**: PostgreSQL, Supabase

## 🚀 Quick Start

### Prerequisites
- Python 3.7 or higher
- Node.js 18 or higher
- FFmpeg (for video processing)
- API keys for your preferred LLM provider(s) (OpenAI, Anthropic, etc.)

### Installation

1. **Clone or Download the Repository**
```bash
cd dreamix
```

2. **Set up Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. **Set up Frontend**
```bash
cd ../frontend
npm install
```

5. **Start Dreamix**
```bash
cd ..
python start.py
```

This will automatically start:
- Backend API on http://localhost:8000
- API Documentation on http://localhost:8000/docs
- Frontend Dashboard on http://localhost:3000

6. **Access the Dashboard**
Open your browser and navigate to `http://localhost:3000`

## 📖 Usage Guide

### Creating Your First Video

1. **Start a Conversation**: Tell Dreamix what kind of video you want to create
2. **Provide Input**: Upload your media or let Dreamix find relevant content for you
3. **Review the Script**: Dreamix will generate a complete script with scene descriptions
4. **Refine Through Chat**: Make adjustments using natural language
5. **Render & Export**: When you're satisfied, render your final video

### Example Prompts

```
"Create a 60-second product review video for a wireless headphone, focusing on sound quality and battery life."
```

```
"Make this video more upbeat, swap the background music to something energetic, and add a call-to-action at the end."
```

```
"Save this workflow as a 'Product Review' skill so I can apply it to other products."
```

### Exploring the Dashboard

- **Chat**: Main interface for creating and editing videos through conversation
- **Skills**: Browse and use pre-built video creation skills, or create your own
- **History**: View and manage your previously created videos
- **Settings**: Configure your profile, API keys, and preferences

## 🧪 Testing

Dreamix includes comprehensive test suites for both backend and frontend components:

### Backend Tests
```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v
```

### Running Individual Test Scripts
```bash
# Test conversational editing system
python test_conversational_editing.py

# Test skill system
python test_skill_system.py
```

## 🎯 Use Cases

- **Content Creators**: Produce engaging social media content at scale
- **Marketers**: Create compelling product demos and promotional videos
- **Educators**: Transform lessons into interactive educational content
- **Storytellers**: Bring your stories to life with AI-powered narration and visuals
- **Businesses**: Automate video production for training, onboarding, and communication

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## ⭐ Star History

If you like this project, please ⭐ star the repo. Your support helps us grow!

<p align="center">
  <a href="https://star-history.com/#Yuan-ManX/Dreamix&Date">
    <img src="https://api.star-history.com/svg?repos=Yuan-ManX/Dreamix&type=Date" />
  </a>
</p>


## 🙏 Acknowledgments

Dreamix stands on the shoulders of incredible open-source projects and the broader AI community. We're grateful for all the innovations that make this possible.

---

<div align="center">

**Made with ❤️ by the Dreamix Team**

</div>
