# Case Pulse

A modern, real-time monitoring tool for Amazon cases across 1P, 2P, and 3P accounts. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Real-time Dashboard**: Monitor active cases, response times, and satisfaction rates
- **Workspace Management**: Organize and track multiple Amazon accounts and brands
- **Pulse-inspired Design**: Smooth animations and heartbeat-like visual motifs
- **Responsive Interface**: Modern, clean design that works on all devices
- **Dark/Light Mode**: Built-in theme switching with next-themes
- **Professional Login**: Secure authentication with social login options

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode
- **Fonts**: Geist Sans & Geist Mono

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard page
│   ├── login/            # Authentication page
│   ├── workspaces/       # Workspace management
│   ├── layout.tsx        # Root layout with navbar/footer
│   └── page.tsx          # Home page (redirects to dashboard)
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Button, Card, etc.)
│   ├── navbar.tsx       # Navigation component
│   ├── footer.tsx       # Footer component
│   └── pulse-animation.tsx # Pulse/heartbeat animations
└── lib/                 # Utility functions
    └── utils.ts         # Tailwind class utilities
```

## Key Components

### Dashboard
- Real-time case metrics and KPIs
- Recent activity feed
- Quick action buttons
- Responsive grid layout

### Workspaces
- Account/brand management cards
- Case statistics per workspace
- Status indicators with pulse animations
- Filter and search functionality

### Login Page
- Professional authentication form
- Social login options (Google, Twitter)
- Responsive design with pulse animations
- Secure form validation

## Design System

The application uses a consistent design system with:

- **Color Palette**: Primary, secondary, and semantic colors
- **Typography**: Geist font family for modern readability
- **Spacing**: Consistent spacing scale using Tailwind
- **Animations**: Pulse and heartbeat effects for real-time feel
- **Components**: Reusable UI components with consistent styling

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Pages

1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. The route will be automatically available

### Styling Guidelines

- Use Tailwind CSS classes for styling
- Follow the established color scheme
- Include pulse animations for real-time elements
- Ensure responsive design for all screen sizes

## Deployment

The application is ready for deployment on Vercel, Netlify, or any other Next.js-compatible platform.

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
