
# Contributing to CyberSwarm Dashboard

Thank you for your interest in contributing to the CyberSwarm Dashboard! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Documentation](#documentation)
7. [Pull Request Process](#pull-request-process)
8. [Issue Reporting](#issue-reporting)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Node.js 18+** installed
2. **Git** configured with your GitHub account
3. **Code editor** (VS Code recommended)
4. **Basic knowledge** of:
   - TypeScript
   - React/Next.js
   - Cybersecurity concepts (helpful but not required)

### Setting Up Development Environment

1. **Fork the repository**:
   - Visit [https://github.com/starwreckntx/cyberswarm](https://github.com/starwreckntx/cyberswarm)
   - Click "Fork" button

2. **Clone your fork**:
```bash
git clone https://github.com/YOUR_USERNAME/cyberswarm.git
cd cyberswarm/app
```

3. **Add upstream remote**:
```bash
git remote add upstream https://github.com/starwreckntx/cyberswarm.git
```

4. **Install dependencies**:
```bash
npm install
```

5. **Create environment file**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

6. **Start development server**:
```bash
npm run dev
```

7. **Verify setup**:
   - Open [http://localhost:3000](http://localhost:3000)
   - Ensure the dashboard loads correctly

## Development Workflow

### Branch Strategy

We use a simplified Git Flow:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Creating a Feature Branch

```bash
# Update your local repository
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feature/your-feature-name
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format**: `<type>(<scope>): <subject>`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(agents): add new reconnaissance capabilities
fix(dashboard): resolve agent status update issue
docs(readme): update installation instructions
style(components): format code with prettier
refactor(api): simplify agent control logic
perf(stream): optimize SSE connection handling
test(hooks): add tests for useSimulationStream
chore(deps): update dependencies
```

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your branch
git checkout develop
git merge upstream/develop

# Update your fork
git push origin develop
```

## Coding Standards

### TypeScript Guidelines

1. **Use TypeScript strictly**:
```typescript
// ✅ Good
interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
}

// ❌ Bad
interface Agent {
  id: any;
  name: any;
  status: any;
}
```

2. **Define proper types**:
```typescript
// ✅ Good
type AgentStatus = 'IDLE' | 'BUSY' | 'ERROR' | 'OFFLINE';

// ❌ Bad
type AgentStatus = string;
```

3. **Use interfaces for objects**:
```typescript
// ✅ Good
interface AgentProps {
  agent: Agent;
  onStart: (id: string) => void;
}

// ❌ Bad
function AgentCard(props: any) { }
```

### React/Next.js Best Practices

1. **Use functional components**:
```typescript
// ✅ Good
export function AgentCard({ agent }: AgentCardProps) {
  return <div>{agent.name}</div>;
}

// ❌ Bad
export class AgentCard extends React.Component { }
```

2. **Use proper hooks**:
```typescript
// ✅ Good
const [agents, setAgents] = useState<Agent[]>([]);
const { data, error } = useSWR('/api/agents', fetcher);

// ❌ Bad
let agents = [];
```

3. **Memoize expensive computations**:
```typescript
// ✅ Good
const sortedAgents = useMemo(() => 
  agents.sort((a, b) => a.name.localeCompare(b.name)),
  [agents]
);

// ❌ Bad
const sortedAgents = agents.sort((a, b) => a.name.localeCompare(b.name));
```

4. **Use proper component structure**:
```typescript
// ✅ Good
'use client';

import { useState } from 'react';
import { Agent } from '@/lib/types';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="p-4 border rounded">
      <h3>{agent.name}</h3>
      {/* ... */}
    </div>
  );
}
```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

**Key style rules**:
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Max line length: 100 characters
- Use trailing commas
- Use arrow functions

### File Organization

```
app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── dashboard/         # Feature components
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and business logic
│   ├── agents/           # Agent implementations
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
└── styles/               # Global styles
```

### Naming Conventions

**Files**:
- Components: `PascalCase.tsx` (e.g., `AgentCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `api-client.ts`)
- Hooks: `use-kebab-case.ts` (e.g., `use-simulation-stream.ts`)

**Variables**:
- Constants: `UPPER_SNAKE_CASE`
- Variables: `camelCase`
- Components: `PascalCase`
- Types/Interfaces: `PascalCase`

**Functions**:
- Regular functions: `camelCase`
- React components: `PascalCase`
- Event handlers: `handleEventName`

## Testing Guidelines

### Writing Tests

1. **Unit Tests** for utilities and hooks:
```typescript
// hooks/__tests__/use-simulation-stream.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useSimulationStream } from '../use-simulation-stream';

describe('useSimulationStream', () => {
  it('should connect to stream on mount', async () => {
    const { result } = renderHook(() => useSimulationStream());
    
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });
  
  it('should update agents on status event', async () => {
    const { result } = renderHook(() => useSimulationStream());
    
    // Simulate event
    // ...
    
    await waitFor(() => {
      expect(result.current.agents).toHaveLength(1);
    });
  });
});
```

2. **Component Tests**:
```typescript
// components/__tests__/AgentCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentCard } from '../AgentCard';

describe('AgentCard', () => {
  const mockAgent = {
    id: '1',
    name: 'Test Agent',
    status: 'IDLE'
  };
  
  it('renders agent name', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });
  
  it('calls onStart when start button clicked', () => {
    const onStart = jest.fn();
    render(<AgentCard agent={mockAgent} onStart={onStart} />);
    
    fireEvent.click(screen.getByText('Start'));
    expect(onStart).toHaveBeenCalledWith('1');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- AgentCard.test.tsx
```

### Test Coverage

Aim for:
- **80%+ overall coverage**
- **90%+ for critical paths**
- **100% for utility functions**

## Documentation

### Code Documentation

1. **Add JSDoc comments** for complex functions:
```typescript
/**
 * Analyzes defensive capabilities and recommends attack strategies
 * @param scope - The scope of analysis (network, system, application)
 * @returns Defense analysis with capabilities, weaknesses, and recommendations
 */
async function performDefenseAnalysis(scope: string): Promise<DefenseAnalysis> {
  // Implementation
}
```

2. **Document complex logic**:
```typescript
// Calculate detection risk based on stealth level
// Higher stealth = lower detection risk
// Formula: risk = 1 - (stealth_level / 10)
const detectionRisk = 1 - (stealthLevel / 10);
```

3. **Add README for new features**:
   - Create `FEATURE_NAME.md` in relevant directory
   - Explain purpose, usage, and examples

### Updating Documentation

When making changes:

1. **Update README.md** if adding features
2. **Update ARCHITECTURE.md** if changing structure
3. **Update AGENTS.md** if modifying agents
4. **Update DEPLOYMENT.md** if changing deployment
5. **Add inline comments** for complex code

## Pull Request Process

### Before Submitting

1. **Ensure code quality**:
```bash
npm run lint
npm test
npm run build
```

2. **Update documentation**
3. **Add tests** for new features
4. **Rebase on latest develop**:
```bash
git fetch upstream
git rebase upstream/develop
```

### Creating Pull Request

1. **Push to your fork**:
```bash
git push origin feature/your-feature-name
```

2. **Create PR on GitHub**:
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select `develop` as base branch
   - Select your feature branch

3. **Fill PR template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### PR Review Process

1. **Automated checks** must pass:
   - Linting
   - Tests
   - Build

2. **Code review** by maintainers:
   - At least one approval required
   - Address all comments

3. **Merge**:
   - Squash and merge (default)
   - Delete branch after merge

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Ubuntu 22.04]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]
- Dashboard version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of desired solution

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Mockups, examples, or other context
```

### Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email security concerns to the maintainers
2. Include detailed description
3. Wait for response before disclosure

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## Questions?

- **GitHub Discussions**: For general questions
- **GitHub Issues**: For bugs and features
- **Pull Requests**: For code contributions

---

Thank you for contributing to CyberSwarm Dashboard! 🎉
