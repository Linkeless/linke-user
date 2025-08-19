# Linke User

A modern, responsive React application built with TypeScript, featuring authentication, dashboard management, and a comprehensive component system.

## Features

- **Authentication System**
  - Secure login with form validation
  - Protected routes with authentication checks
  - OAuth integration capabilities
  - Remember me functionality
  - Token-based authentication

- **Dashboard Interface**
  - Personalized welcome card
  - Quick stats overview
  - Recent activity tracking
  - Action cards for common tasks
  - Responsive grid layout

- **Modern UI Components**
  - Shadcn/ui component library
  - Dark/light theme support
  - Form validation with Zod
  - Toast notifications
  - Loading states and error boundaries

- **Developer Experience**
  - TypeScript for type safety
  - ESLint and Prettier for code quality
  - Vitest for testing
  - Hot module replacement
  - Code splitting with lazy loading

## Technology Stack

### Core Technologies

- **React 18.3** - UI framework with modern hooks
- **TypeScript 5.6** - Type-safe JavaScript
- **Vite 5.4** - Fast build tool and dev server
- **React Router 7.8** - Client-side routing

### State Management & Data

- **Zustand 5.0** - Lightweight state management
- **TanStack Query 5.85** - Server state management
- **React Hook Form 7.62** - Form handling
- **Zod 4.0** - Schema validation

### Styling & UI

- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Lucide React** - Icon library
- **Next Themes** - Theme management

### Development Tools

- **Vitest 3.2** - Unit testing framework
- **Testing Library** - React testing utilities
- **ESLint 9.13** - Code linting
- **Prettier 3.6** - Code formatting
- **Husky 9.1** - Git hooks

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher)
- **Git** (for version control)

You can check your versions with:

```bash
node --version
npm --version
git --version
```

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd linke-user
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Git hooks** (optional but recommended)
   ```bash
   npm run prepare
   ```

## Development Setup

### Environment Configuration

1. Create environment files (if needed):

   ```bash
   # Create .env.local for local development
   touch .env.local
   ```

2. Add necessary environment variables:

   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:3000/api

   # OAuth Configuration (if using)
   VITE_OAUTH_CLIENT_ID=your_oauth_client_id
   VITE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

### Available Scripts

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Lint code
npm run lint

# Lint and fix issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check
```

### Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build and Deployment

### Production Build

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Preview the build locally**
   ```bash
   npm run preview
   ```

The build artifacts will be stored in the `dist/` directory.

### Performance

The application is optimized for production with:

- Code splitting and lazy loading
- Tree shaking to eliminate dead code
- Gzip compression (total gzipped size: ~172KB)
- Modern build tools (Vite) for optimal bundling

For detailed performance analysis, see [PERFORMANCE_AUDIT.md](PERFORMANCE_AUDIT.md).

### Deployment Options

The application can be deployed to various platforms:

- **Vercel**: Import the repository and deploy automatically
- **Netlify**: Connect your repository and deploy
- **GitHub Pages**: Use GitHub Actions for automated deployment
- **Traditional hosting**: Upload the `dist/` folder contents

## Testing

### Running Tests

```bash
# Run all tests in watch mode
npm run test

# Run tests with interactive UI
npm run test:ui

# Run tests once (for CI)
npm run test:run
```

### Test Structure

Tests are organized alongside their respective components:

```
src/
├── features/
│   └── auth/
│       ├── components/
│       │   └── LoginForm.tsx
│       └── __tests__/
│           └── LoginForm.test.tsx
├── app/
│   └── router/
│       ├── ProtectedRoute.tsx
│       └── __tests__/
│           └── ProtectedRoute.test.tsx
└── test/
    └── setup.ts
```

### Writing Tests

Example test structure:

```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## Project Structure

```
linke-user/
├── public/                     # Static assets
├── src/
│   ├── app/                   # Application setup
│   │   ├── providers/         # Context providers
│   │   ├── router/           # Routing configuration
│   │   └── hooks/            # App-level hooks
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Common components
│   │   ├── forms/           # Form components
│   │   └── ui/              # Base UI components
│   ├── features/            # Feature-based modules
│   │   ├── auth/           # Authentication feature
│   │   ├── dashboard/      # Dashboard feature
│   │   ├── payment/        # Payment feature
│   │   ├── subscription/   # Subscription feature
│   │   ├── tickets/        # Tickets feature
│   │   └── user/           # User management feature
│   ├── lib/                # Shared utilities
│   │   ├── api/           # API configuration
│   │   ├── constants/     # Application constants
│   │   ├── query/         # React Query setup
│   │   └── utils/         # Utility functions
│   ├── hooks/             # Shared hooks
│   ├── stores/            # Global state stores
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript type definitions
│   └── test/              # Test configuration
├── dist/                  # Build output (generated)
├── node_modules/          # Dependencies (generated)
└── Configuration files
```

### Feature-Based Architecture

Each feature follows a consistent structure:

```
features/[feature-name]/
├── components/           # Feature-specific components
├── hooks/               # Feature-specific hooks
├── pages/               # Feature pages
├── services/            # API services
├── stores/              # Feature state management
├── types/               # Feature type definitions
├── utils/               # Feature utilities
└── __tests__/           # Feature tests
```

## Code Quality

### Linting and Formatting

The project uses ESLint and Prettier for code quality:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Format code
npm run format
```

### Git Hooks

Pre-commit hooks are configured to run:

- ESLint on staged files
- Prettier formatting
- Type checking

### Code Style Guidelines

- Use TypeScript for all new files
- Follow component naming conventions (PascalCase)
- Use functional components with hooks
- Implement proper error boundaries
- Add appropriate comments for complex logic
- Write tests for new features

## Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Kill process using port 5173
   lsof -ti:5173 | xargs kill -9
   ```

2. **Module resolution errors**

   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build failures**

   ```bash
   # Check TypeScript compilation
   npx tsc --noEmit

   # Check for linting errors
   npm run lint
   ```

4. **Test failures**
   ```bash
   # Clear test cache
   npx vitest run --reporter=verbose
   ```

### Getting Help

- Check the [Issues](../../issues) section for known problems
- Review the commit history for recent changes
- Consult the documentation for specific libraries used

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the code style guidelines
4. Add tests for new functionality
5. Ensure all tests pass (`npm run test:run`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Commit Message Guidelines

Use conventional commit format:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Headless components
