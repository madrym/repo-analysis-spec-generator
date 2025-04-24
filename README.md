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

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/repo-analysis-spec-generator.git
cd repo-analysis-spec-generator
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
\`\`\`
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4000

# Google AI Configuration (optional)
GOOGLE_API_KEY=your_google_api_key
GOOGLE_MODEL=gemini-1.5-pro
GOOGLE_MAX_TOKENS=4000
\`\`\`

4. Start the development server:
\`\`\`bash
pnpm run dev
\`\`\`

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
   - Supports models like GPT-4o, GPT-4 Turbo, and GPT-3.5 Turbo

2. **Google AI**
   - Configure your API key, model, and other settings in the Settings page
   - Supports models like Gemini 1.5 Pro, Gemini 1.5 Flash, and more

You can configure these providers through:
- Environment variables (recommended for production)
- The Settings page in the application (settings are stored in localStorage)

## Project Structure

```
/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API routes
│   │   │   ├── llm/             # LLM-related endpoints
│   │   │   │   ├── generate/
│   │   │   │   │   └── route.ts
│   │   │   │   └── test/
│   │   │   │       └── route.ts
│   │   │   ├── repo/            # Repository analysis endpoints
│   │   │   │   ├── analyze/
│   │   │   │   │   └── route.ts
│   │   │   │   └── context/
│   │   │   │       └── route.ts
│   │   │   └── spec/            # Specification generation endpoints
│   │   │       ├── chat/
│   │   │       │   └── route.ts
│   │   │       ├── generate/
│   │   │       │   └── route.ts
│   │   │       └── questions/
│   │   │           └── route.ts
│   │   ├── settings/            # Settings page
│   │   │   └── page.tsx
│   │   ├── globals.css          # Global styles (Note: Moved to /styles in some conventions)
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/              # React components
│   │   ├── llm-config/          # LLM configuration components
│   │   │   ├── advanced-settings.tsx
│   │   │   ├── llm-config-panel.tsx
│   │   │   ├── llm-config-provider.tsx
│   │   │   └── llm-status-indicator.tsx
│   │   ├── repo-analysis/       # Repository analysis components
│   │   │   ├── cicd-workflow.tsx
│   │   │   ├── language-breakdown.tsx
│   │   │   ├── pr-process.tsx
│   │   │   ├── repository-analysis-results.tsx
│   │   │   ├── repository-analysis.tsx
│   │   │   ├── repository-overview.tsx
│   │   │   └── repository-structure.tsx
│   │   ├── spec-generator/      # Specification generator components
│   │   │   ├── spec-chat.tsx
│   │   │   ├── spec-generator-form.tsx
│   │   │   ├── spec-generator-results.tsx
│   │   │   └── spec-generator.tsx
│   │   ├── ui/                  # UI components (shadcn/ui - partial list)
│   │   │   ├── alert.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── tooltip.tsx
│   │   ├── llm-config-wrapper.tsx
│   │   ├── navbar.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-switcher.tsx
│   ├── lib/                     # Utility functions and services
│   │   ├── llm-adapters/        # LLM provider adapters
│   │   │   ├── google-adapter.ts
│   │   │   └── openai-adapter.ts
│   │   ├── llm-config-provider.tsx # Note: Consider if this belongs in components/ or lib/
│   │   ├── llm-service.ts       # LLM service
│   │   ├── repo-analyzer.ts     # Repository analyzer
│   │   ├── repomix.ts           # Repository context generator
│   │   ├── spec-generator.ts    # Specification generator
│   │   ├── types.ts             # TypeScript types
│   │   └── utils.ts             # Utility functions
│   └── styles/                  # Styles
│       └── globals.css
├── .env.local                   # Environment variables (local)
├── .gitignore
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

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
  - OpenAI API (GPT-4o, GPT-4, etc.)
  - Google AI API (Gemini models)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
