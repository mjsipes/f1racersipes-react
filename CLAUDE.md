# F1 Racer Code Guidelines

## Commands
- `npm start` - Run development server
- `npm test` - Run tests (Jest + React Testing Library)
- `npm test -- --testPathPattern=ComponentName` - Run specific test
- `npm run build` - Build for production
- `npm run lint` - Run ESLint manually (integrated in CRA)

## Code Style
- **Imports**: Group React imports first, then external libraries, local components, styles last
- **Formatting**: Use 2-space indentation, no trailing semicolons
- **Components**: Functional components with hooks, PascalCase naming
- **File Structure**: Components in src/components/, pages in src/pages/
- **State Management**: Use React hooks, maintain state at appropriate level
- **Error Handling**: Use try/catch for async operations, especially for Supabase calls
- **Comments**: Minimal comments, only for complex logic
- **Testing**: Component tests with React Testing Library focusing on user interactions

## Supabase Integration
Always wrap Supabase calls in try/catch blocks and handle errors appropriately.