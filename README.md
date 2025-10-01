
# CyberSwarm Dashboard 🛡️

A sophisticated real-time web dashboard for monitoring and controlling a multi-agent cybersecurity simulation system. This Next.js application provides comprehensive visualization and control capabilities for autonomous cybersecurity agents engaged in red team vs. blue team scenarios.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=flat-square&logo=tailwind-css)

## 🌟 Overview

CyberSwarm Dashboard is the command center for a multi-agent cybersecurity simulation platform. It enables security professionals, researchers, and educators to:

- **Monitor** autonomous agents in real-time as they execute offensive and defensive operations
- **Control** individual agents and inject custom tasks into the simulation
- **Visualize** complex agent interactions, decision-making processes, and attack/defense patterns
- **Analyze** security events, vulnerabilities, and defensive capabilities through interactive dashboards
- **Learn** from AI-powered chain-of-thought reasoning that explains each agent's decision-making process

The dashboard connects to a backend orchestrator that manages multiple specialized agents including reconnaissance, exploitation, defense, and strategy adaptation agents.

## 🎯 Key Features

### Real-Time Monitoring
- **Live Agent Status**: Track all active agents with their current status, tasks, and health metrics
- **Event Stream**: Server-Sent Events (SSE) for instant updates without polling
- **Performance Metrics**: Monitor agent response times, success rates, and resource utilization
- **Network Topology**: Visualize target networks and agent deployment

### Agent Control Panel
- **Individual Agent Control**: Start, stop, and configure specific agents
- **Task Injection**: Manually inject custom tasks to any agent type
- **Bulk Operations**: Control multiple agents simultaneously
- **Agent Configuration**: Adjust agent parameters and behavior in real-time

### Chain of Thought Visualization
- **Reasoning Transparency**: See exactly how agents make decisions
- **Step-by-Step Analysis**: Follow the logical progression of agent actions
- **Confidence Scores**: Understand agent certainty levels for each decision
- **Historical Playback**: Review past decision chains for learning and debugging

### Logic Pipe Execution
- **Event-Driven Workflows**: Visualize how events trigger automated responses
- **Rule Visualization**: See which rules are applied and why
- **Execution Timing**: Track performance of automated decision pipelines
- **Success/Failure Analysis**: Identify bottlenecks and optimization opportunities

### Knowledge Base Explorer
- **Vulnerability Database**: Browse CVEs, exploits, and security intelligence
- **Threat Intelligence**: Access categorized threat data and indicators
- **Defense Patterns**: Explore defensive strategies and countermeasures
- **Search & Filter**: Quickly find relevant security information

### Interactive Dashboards
- **Customizable Layouts**: Arrange panels to suit your workflow
- **Dark/Light Themes**: Comfortable viewing in any environment
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Export Capabilities**: Save data and visualizations for reporting

## 🏗️ Architecture

The dashboard is built with modern web technologies optimized for real-time data visualization:

```
┌─────────────────────────────────────────────────────────────┐
│                    CyberSwarm Dashboard                      │
│                      (Next.js 14 App)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Agent      │  │  Chain of    │  │   Logic      │      │
│  │   Control    │  │   Thought    │  │   Pipes      │      │
│  │   Panel      │  │   Viewer     │  │   Monitor    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Real-Time   │  │  Knowledge   │  │   Event      │      │
│  │  Monitor     │  │    Base      │  │   Stream     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    API Routes Layer                          │
│  /api/agents | /api/simulation | /api/knowledge-base        │
├─────────────────────────────────────────────────────────────┤
│                  Server-Sent Events (SSE)                    │
│              /api/simulation/stream (Real-time)              │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              Backend Orchestrator (Separate)                 │
│         Multi-Agent System with Docker Containers            │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend Framework**
- **Next.js 14**: React framework with App Router for optimal performance
- **React 18**: Modern React with concurrent features
- **TypeScript**: Type-safe development with full IDE support

**UI Components**
- **Radix UI**: Accessible, unstyled component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Lucide Icons**: Beautiful, consistent icon set

**Data Visualization**
- **Recharts**: Composable charting library
- **Chart.js**: Flexible charting with react-chartjs-2
- **Plotly.js**: Interactive scientific visualizations

**State Management**
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching
- **SWR**: Data fetching with automatic revalidation

**Real-Time Communication**
- **Server-Sent Events (SSE)**: Efficient one-way real-time updates
- **Custom Hooks**: useSimulationStream for event handling

## 📋 Prerequisites

Before installing the dashboard, ensure you have:

- **Node.js**: Version 18.x or higher
- **npm** or **yarn**: Package manager
- **Backend Orchestrator**: The multi-agent system must be running separately
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

### System Requirements

**Minimum**
- 4 GB RAM
- 2 CPU cores
- 1 GB free disk space

**Recommended**
- 8 GB RAM
- 4 CPU cores
- 5 GB free disk space
- SSD for better performance

## 🚀 Installation

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/starwreckntx/cyberswarm.git
cd cyberswarm
```

2. **Install dependencies**
```bash
cd app
npm install
# or
yarn install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Detailed Installation Steps

#### Step 1: Environment Configuration

Create a `.env` file in the `app/` directory:

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend API (adjust to your orchestrator location)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Database (if using Prisma)
DATABASE_URL="file:./dev.db"

# Authentication (optional)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
```

#### Step 2: Database Setup (Optional)

If using Prisma for data persistence:

```bash
cd app
npx prisma generate
npx prisma db push
npx prisma db seed  # Optional: seed with sample data
```

#### Step 3: Build for Production

```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## 🎮 Usage Guide

### Starting a Simulation

1. **Navigate to the Dashboard**: Open the application in your browser
2. **Check Agent Status**: Verify all agents are connected (green status indicators)
3. **Configure Target**: Set the target network or system to simulate
4. **Start Simulation**: Click the "Start Simulation" button
5. **Monitor Progress**: Watch real-time updates in all panels

### Controlling Agents

**Individual Agent Control**
```typescript
// Start a specific agent
controlAgent('recon-agent-001', 'start')

// Stop an agent
controlAgent('exploit-agent-002', 'stop')
```

**Injecting Custom Tasks**
```typescript
// Inject a reconnaissance task
injectTask('reconnaissance', 'port_scan', '192.168.1.0/24', {
  ports: [80, 443, 8080],
  timeout: 30
})

// Inject an exploitation task
injectTask('exploitation', 'exploit_vulnerability', '192.168.1.100', {
  cve: 'CVE-2024-1234',
  payload: 'reverse_shell'
})
```

### Viewing Chain of Thought

1. **Select an Agent**: Click on any active agent in the control panel
2. **View Reasoning**: The Chain of Thought panel shows the agent's decision process
3. **Analyze Steps**: Each step includes:
   - Step number and type
   - Description of the action
   - Reasoning behind the decision
   - Confidence score
   - Associated data

### Exploring the Knowledge Base

1. **Open Knowledge Base**: Click the "Knowledge Base" tab
2. **Browse Categories**: 
   - Vulnerabilities (CVEs)
   - Exploits
   - Defense Patterns
   - Threat Intelligence
3. **Search**: Use the search bar to find specific entries
4. **Filter**: Apply filters by severity, category, or tags
5. **View Details**: Click any entry for full information

### Monitoring Logic Pipes

Logic pipes show automated event-driven workflows:

1. **View Executions**: See all logic pipe executions in real-time
2. **Analyze Rules**: Understand which rules triggered
3. **Check Performance**: Monitor execution times
4. **Debug Failures**: Identify and fix failed executions

## 🔧 Configuration

### Dashboard Customization

Edit `app/lib/config.ts` to customize dashboard behavior:

```typescript
export const dashboardConfig = {
  // Refresh intervals (milliseconds)
  agentStatusRefresh: 5000,
  eventStreamReconnect: 3000,
  
  // Display limits
  maxRecentEvents: 50,
  maxChainOfThoughts: 100,
  maxLogicPipeExecutions: 30,
  
  // UI preferences
  defaultTheme: 'dark',
  enableAnimations: true,
  compactMode: false,
  
  // Performance
  enableVirtualization: true,
  batchUpdateInterval: 100
}
```

### Agent Configuration

Configure agent types and capabilities in `app/lib/agents/config.ts`:

```typescript
export const agentTypes = {
  reconnaissance: {
    displayName: 'Reconnaissance',
    color: '#3B82F6',
    icon: 'Search',
    capabilities: ['port_scan', 'service_detection', 'os_fingerprinting']
  },
  exploitation: {
    displayName: 'Exploitation',
    color: '#EF4444',
    icon: 'Zap',
    capabilities: ['exploit_vulnerability', 'privilege_escalation', 'lateral_movement']
  },
  // ... more agent types
}
```

### API Endpoints

The dashboard communicates with the backend through these endpoints:

**Agent Management**
- `POST /api/agents` - Control agent lifecycle
- `GET /api/agents` - Get agent status

**Simulation Control**
- `POST /api/simulation` - Start/stop simulation
- `POST /api/simulation/inject-task` - Inject custom tasks
- `GET /api/simulation/stream` - SSE stream for real-time updates

**Knowledge Base**
- `GET /api/knowledge-base` - Query knowledge base
- `POST /api/knowledge-base` - Add entries (if enabled)

## 📊 Dashboard Components

### Agent Control Panel
**Location**: `components/dashboard/agent-control-panel.tsx`

Features:
- Grid view of all agents
- Status indicators (idle, busy, error, offline)
- Quick actions (start, stop, restart)
- Task injection interface
- Agent configuration modal

### Chain of Thought Panel
**Location**: `components/dashboard/chain-of-thought-panel.tsx`

Features:
- Chronological display of reasoning steps
- Expandable step details
- Confidence score visualization
- Data inspection
- Export to JSON

### Real-Time Monitor
**Location**: `components/dashboard/real-time-monitor.tsx`

Features:
- Live event feed
- Event filtering by type and severity
- Event details modal
- Timeline visualization
- Export capabilities

### Logic Pipe Visualization
**Location**: `components/dashboard/logic-pipe-visualization.tsx`

Features:
- Execution timeline
- Rule application tracking
- Input/output data display
- Performance metrics
- Success/failure indicators

### Knowledge Base Explorer
**Location**: `components/dashboard/knowledge-base-explorer.tsx`

Features:
- Categorized browsing
- Full-text search
- Advanced filtering
- Detail view with metadata
- Related entries linking

## 🔌 API Integration

### Connecting to Backend

The dashboard expects a backend orchestrator running with the following API:

**Base URL**: Configure in `.env` as `NEXT_PUBLIC_API_URL`

**Authentication**: Currently supports:
- No authentication (development)
- API key authentication
- JWT tokens (configure in NextAuth)

### Custom Backend Integration

To integrate with a custom backend:

1. **Update API client**: Edit `app/lib/api-client.ts`
2. **Modify types**: Update `app/lib/types.ts` to match your data structures
3. **Adjust hooks**: Modify hooks in `app/hooks/` for your API patterns
4. **Update SSE handler**: Customize `app/api/simulation/stream/route.ts`

Example custom API client:

```typescript
// app/lib/api-client.ts
export class CustomAPIClient {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }
  
  async getAgents() {
    const response = await fetch(`${this.baseURL}/agents`);
    return response.json();
  }
  
  async controlAgent(agentId: string, action: string) {
    const response = await fetch(`${this.baseURL}/agents/${agentId}/${action}`, {
      method: 'POST'
    });
    return response.json();
  }
  
  // ... more methods
}
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Structure

```
app/
├── __tests__/
│   ├── components/
│   │   ├── agent-control-panel.test.tsx
│   │   ├── chain-of-thought-panel.test.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── use-simulation-stream.test.ts
│   │   └── ...
│   └── lib/
│       ├── api-client.test.ts
│       └── ...
```

### Writing Tests

Example component test:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentControlPanel } from '@/components/dashboard/agent-control-panel';

describe('AgentControlPanel', () => {
  it('renders agent list', () => {
    const agents = [
      { id: '1', name: 'Recon Agent', status: 'IDLE' }
    ];
    
    render(<AgentControlPanel agents={agents} />);
    expect(screen.getByText('Recon Agent')).toBeInTheDocument();
  });
  
  it('handles agent start action', async () => {
    const onStart = jest.fn();
    render(<AgentControlPanel onStartAgent={onStart} />);
    
    fireEvent.click(screen.getByText('Start'));
    expect(onStart).toHaveBeenCalled();
  });
});
```

## 🐛 Troubleshooting

### Common Issues

**Issue**: Dashboard shows "Connection Lost"
**Solution**: 
- Verify backend orchestrator is running
- Check `NEXT_PUBLIC_API_URL` in `.env`
- Ensure no firewall blocking connections
- Check browser console for CORS errors

**Issue**: Agents not appearing
**Solution**:
- Confirm agents are registered with orchestrator
- Check API endpoint `/api/agents` returns data
- Verify agent data structure matches TypeScript types
- Check browser network tab for failed requests

**Issue**: Real-time updates not working
**Solution**:
- Verify SSE endpoint `/api/simulation/stream` is accessible
- Check browser supports EventSource API
- Ensure no proxy/CDN blocking SSE
- Check server logs for connection errors

**Issue**: Build fails with TypeScript errors
**Solution**:
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Issue**: Slow performance with many agents
**Solution**:
- Enable virtualization in config
- Reduce refresh intervals
- Limit displayed events/thoughts
- Use production build instead of dev mode

### Debug Mode

Enable debug mode for detailed logging:

```env
NEXT_PUBLIC_ENABLE_DEBUG=true
```

Then check browser console for detailed logs:
- API requests/responses
- SSE events
- State updates
- Performance metrics

### Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/starwreckntx/cyberswarm/issues)
- **Documentation**: Check `ARCHITECTURE.md` and `AGENTS.md`
- **Logs**: Check browser console and server logs
- **Community**: Join discussions in GitHub Discussions

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**: Ensure code is in a GitHub repository
2. **Import to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
3. **Configure**:
   - Root directory: `app`
   - Build command: `npm run build`
   - Output directory: `.next`
4. **Environment Variables**: Add all `.env` variables in Vercel dashboard
5. **Deploy**: Click "Deploy"

### Docker

Build and run with Docker:

```bash
# Build image
docker build -t cyberswarm-dashboard ./app

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://your-backend:8000 \
  cyberswarm-dashboard
```

Docker Compose:

```yaml
version: '3.8'
services:
  dashboard:
    build: ./app
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://orchestrator:8000
    depends_on:
      - orchestrator
```

### Traditional Hosting

For VPS or traditional hosting:

```bash
# Build production bundle
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start npm --name "cyberswarm-dashboard" -- start
```

### Nginx Reverse Proxy

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name dashboard.example.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # SSE specific configuration
    location /api/simulation/stream {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
    }
}
```

## 🔒 Security Considerations

### Authentication

Implement authentication for production:

```typescript
// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
};
```

### API Security

- Use HTTPS in production
- Implement rate limiting
- Validate all inputs
- Sanitize user data
- Use CORS appropriately
- Implement API authentication

### Environment Variables

Never commit sensitive data:
- Use `.env.local` for secrets
- Add `.env*.local` to `.gitignore`
- Use environment variable management in production
- Rotate secrets regularly

## 📈 Performance Optimization

### Production Optimizations

1. **Enable compression**
```javascript
// next.config.js
module.exports = {
  compress: true,
  // ... other config
}
```

2. **Optimize images**
```typescript
import Image from 'next/image';

<Image 
  src="/logo.png" 
  width={200} 
  height={100}
  priority // for above-the-fold images
/>
```

3. **Code splitting**
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false // disable SSR if not needed
});
```

4. **Caching strategies**
```typescript
// Use SWR for data fetching
import useSWR from 'swr';

const { data, error } = useSWR('/api/agents', fetcher, {
  refreshInterval: 5000,
  revalidateOnFocus: false
});
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier (configured)
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing framework
- **Vercel**: For hosting and deployment platform
- **Radix UI**: For accessible component primitives
- **Tailwind CSS**: For the utility-first CSS framework
- **Open Source Community**: For countless libraries and tools

## 📞 Contact & Support

- **GitHub**: [starwreckntx/cyberswarm](https://github.com/starwreckntx/cyberswarm)
- **Issues**: [Report bugs](https://github.com/starwreckntx/cyberswarm/issues)
- **Discussions**: [Join the conversation](https://github.com/starwreckntx/cyberswarm/discussions)

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Multi-user support with role-based access
- [ ] Advanced analytics and reporting
- [ ] Machine learning insights
- [ ] Custom agent creation UI
- [ ] Scenario templates and playbooks
- [ ] Integration with SIEM systems
- [ ] Mobile app (React Native)

### Version 1.5 (In Progress)
- [ ] Enhanced visualization options
- [ ] Export/import simulation data
- [ ] Improved performance for large-scale simulations
- [ ] Plugin system for extensions

### Version 1.0 (Current)
- [x] Real-time agent monitoring
- [x] Chain of thought visualization
- [x] Knowledge base explorer
- [x] Logic pipe monitoring
- [x] Task injection
- [x] Dark/light themes

---

**Built with ❤️ for the cybersecurity community**

*Last updated: October 2025*
