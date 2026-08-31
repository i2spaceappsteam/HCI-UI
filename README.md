# HCI-UI

A modern Vite React application with pages-based routing, authentication provider, and shadcn/ui components.

## Features

- ⚡ **Vite** - Lightning-fast build tool
- ⚛️ **React 18** - Latest React with hooks
- 🛣️ **Pages-Based Routing** - React Router for navigation
- 🔐 **Authentication** - Built-in AuthProvider for user management
- 🎨 **shadcn/ui** - Reusable component library
- 🌈 **Tailwind CSS** - Utility-first CSS framework
- 📱 **Responsive Design** - Mobile-first components

## Project Structure

```
hci-ui/
├── src/
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication context
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── Dashboard.jsx
│   ├── App.jsx           # Main app with routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Getting Started

### Installation

```bash
cd hci-ui
npm install
```

### Development

```bash
npm run dev
```

Starts the development server at http://localhost:5173

### Build

```bash
npm run build
```

Creates a production build in the `dist/` folder.

### Preview

```bash
npm run preview
```

Preview the production build locally.

## Available Pages

- **Home** (`/`) - Welcome page
- **Login** (`/login`) - Authentication page
- **Dashboard** (`/dashboard`) - Protected dashboard (requires authentication)

## Using the Authentication System

```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <>
      {isAuthenticated && <p>Welcome, {user.name}!</p>}
    </>
  );
}
```

## Using shadcn/ui Components

```jsx
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text..." />
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## Learn More

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
