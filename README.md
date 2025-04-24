# Repository Analysis & Feature Spec Generator

A powerful tool that leverages AI to analyze GitHub repositories and generate comprehensive feature specifications for software development projects.

![Repository Analysis & Feature Spec Generator](https://placeholder.svg?height=400&width=800&query=Repository+Analysis+and+Feature+Specification+Generator+Dashboard)

## Features

### Repository Analysis
- **GitHub Repository Analysis**: Clone and analyze any public GitHub repository
- **Language Breakdown**: Visualize programming languages used in the repository
- **Framework Detection**: Identify frameworks and libraries used in the project
- **CI/CD Workflow Analysis**: Understand the continuous integration and deployment processes
- **PR Process Visualization**: See how pull requests are handled in the repository
- **Repository Structure**: Explore the directory structure and organization

### Feature Specification Generator
- **AI-Powered Specifications**: Generate detailed feature specifications based on your requirements
- **Repository Context**: Use an analyzed repository as context for more relevant specifications
- **Follow-up Questions**: Answer targeted questions to refine your feature requirements
- **Comprehensive Documentation**: Get three detailed documents:
  - **PLANNING.md**: Technical planning document with architectural approach
  - **TASK.md**: Implementation task breakdown with priorities
  - **SPECS.md**: Behavior-driven specifications with user stories
- **Interactive Chat**: Ask questions about your generated specifications

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- pnpm

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```dotenv
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL= # Optional: Use if you need a proxy or non-standard endpoint
OPENAI_MODEL=claude-3.7-sonnet # Optional: Defaults to claude-3.7-sonnet
OPENAI_MAX_TOKENS= # Optional: Max tokens specifically for OpenAI (overrides MAX_TOKENS)
```

4. Start the development server:
```bash
pnpm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Repository Analysis

1. Navigate to the "Repository Analysis" tab
2. Enter a GitHub repository URL (e.g., https://github.com/owner/repo)
3. Click "Analyze Repository"
4. View the analysis results with language breakdown, frameworks, CI/CD workflows, and more

### Feature Specification Generator

1. Navigate to the "Feature Spec Generator" tab
2. Describe your feature request in detail
3. Optionally:
   - Use a previously analyzed repository as context, or
   - Provide a GitHub repository URL to use as context
4. Click "Generate Questions"
5. Answer the follow-up questions to refine your requirements
6. Click "Generate Specifications"
7. View and download your comprehensive feature specifications
8. Use the chat feature to ask questions about your specifications

## Configuration

### LLM Providers

The application supports two LLM providers:

1. **OpenAI**
   - Configure your API key, model, and other settings in the Settings page

2. **Google AI**
   - Configure your API key, model, and other settings in the Settings page

You can configure these providers through:
- Environment variables (recommended for production)
- The Settings page in the application (settings are stored in localStorage)

## Technologies Used

- **Frontend**:
  - Next.js 14 (App Router)
  - React 18
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components

- **Backend**:
  - Next.js API Routes
  - simple-git for repository cloning
  - AI SDK for LLM integration

- **AI Integration**:
  - OpenAI API
  - Google AI API
