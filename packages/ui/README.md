# @deepcrawl/ui

**Shared UI component library** built with shadcn/ui, Tailwind CSS, and React for the DeepCrawl ecosystem.

## Features

- ✅ **shadcn/ui Components** - High-quality, accessible components
- ✅ **Tailwind CSS** - Utility-first styling with consistent design system
- ✅ **Dark Mode Support** - Built-in theme switching capabilities
- ✅ **TypeScript-First** - Full type safety and IntelliSense
- ✅ **Mobile-Responsive** - Mobile-first responsive design patterns
- ✅ **Accessibility** - WCAG compliant with proper ARIA support

## Package Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx         # Button variants and styles
│   │   ├── card.tsx           # Card layouts
│   │   ├── dialog.tsx         # Modal dialogs
│   │   ├── input.tsx          # Form inputs
│   │   ├── table.tsx          # Data tables
│   │   └── ...                # 30+ components
│   ├── icons/                 # Custom icon components
│   │   ├── github-icon.tsx
│   │   ├── google-icon.tsx
│   │   └── provider-icons.tsx
│   ├── theme/                 # Theme components
│   │   ├── toggle.tsx         # Dark/light mode toggle
│   │   └── tailwind-indicator.tsx
│   └── mdx/                   # MDX components
├── hooks/                     # Shared React hooks
│   ├── use-mobile.ts          # Mobile detection
│   ├── use-is-mac.ts          # Platform detection
│   └── use-inset-resize.ts    # Responsive utilities
├── lib/
│   └── utils.ts               # Utility functions (cn, etc.)
└── styles/
    └── globals.css            # Global CSS styles
```

## Usage

### Component Import

```tsx
import { Button } from "@deepcrawl/ui/components/ui/button";
import { Card, CardContent, CardHeader } from "@deepcrawl/ui/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@deepcrawl/ui/components/ui/dialog";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <h2>DeepCrawl Dashboard</h2>
      </CardHeader>
      <CardContent>
        <Button variant="default" size="lg">
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Styling Utilities

```tsx
import { cn } from "@deepcrawl/ui/lib/utils";

export function StyledComponent({ className, ...props }) {
  return (
    <div 
      className={cn("base-styles", className)}
      {...props}
    />
  );
}
```

### Theme Integration

```tsx
import { ThemeToggle } from "@deepcrawl/ui/components/theme/toggle";

export function Header() {
  return (
    <header>
      <h1>DeepCrawl</h1>
      <ThemeToggle />
    </header>
  );
}
```

### Custom Icons

```tsx
import { GithubIcon, GoogleIcon } from "@deepcrawl/ui/components/icons/provider-icons";

export function AuthButtons() {
  return (
    <div>
      <Button><GithubIcon /> Sign in with GitHub</Button>
      <Button><GoogleIcon /> Sign in with Google</Button>
    </div>
  );
}
```

## Available Components

### **Layout & Structure**
- `Card` - Content containers with variants
- `Sheet` - Slide-out panels and drawers  
- `Dialog` - Modal dialogs and popups
- `Accordion` - Collapsible content sections
- `Tabs` - Tabbed navigation interface
- `Separator` - Visual content dividers

### **Forms & Input**
- `Button` - Action buttons with variants
- `Input` - Text input fields
- `Label` - Form field labels
- `Select` - Dropdown selections
- `Checkbox` - Boolean input controls
- `Form` - Form wrapper with validation

### **Navigation**
- `Breadcrumb` - Hierarchical navigation
- `Dropdown Menu` - Action menus
- `Sidebar` - Navigation sidebars
- `Command` - Command palette interface

### **Data Display**
- `Table` - Data tables with sorting
- `Badge` - Status indicators
- `Avatar` - User profile images
- `Chart` - Data visualization components
- `Skeleton` - Loading placeholders

### **Feedback**
- `Alert` - Notification messages
- `Sonner` - Toast notifications
- `Tooltip` - Contextual help text
- `Progress` - Loading indicators

## Development

### Adding New Components

```bash
# From the apps/app directory (not directly in packages/ui)
cd apps/app
pnpm ui add <component-name>
```

This automatically adds components to the shared UI package.

### Styling Guidelines

- **Utility-First** - Use Tailwind CSS utilities
- **Consistent Spacing** - Follow 4px grid system
- **Color System** - Use CSS custom properties for theming
- **Responsive Design** - Mobile-first approach
- **Accessibility** - Always include proper ARIA attributes

### Theme Configuration

The package includes:
- **CSS Variables** - For dynamic theming
- **Dark/Light Modes** - Automatic theme switching
- **Custom Properties** - Consistent color palette
- **Typography Scale** - Harmonious text sizing