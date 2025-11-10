# bb-alfred-typescript

TypeScript utilities and schemas for Alfred workflows, providing type-safe menu item generation and validation.

## Features

- **Zod Schemas**: Type-safe validation for Alfred menu items and icons
- **Dynamic Menu Generation**: Utilities for creating Alfred workflow outputs
- **File System Integration**: Icon path validation with filesystem checks
- **Full Test Coverage**: Comprehensive test suite with Vitest

## Requirements

- Node.js 24.10+ (ES modules)
- Yarn

## Installation

```bash
yarn install
```

## Project Structure

```
src/
├── schemas/
│   ├── alfred-menu-item.ts      # Menu item schema and types
│   ├── alfred-menu-item.test.ts # Menu item tests
│   ├── alfred-icon.ts           # Icon schema and validation
│   └── alfred-icon.test.ts      # Icon tests
├── dynamicMenuItems.ts          # Menu generation utilities
└── utils/                       # Utility functions
```

## Usage

### Menu Item Schema

```typescript
import { alfredMenuItemSchema, type AlfredMenuItem } from './schemas/alfred-menu-item';

const menuItem: AlfredMenuItem = {
  uid: 'unique-id',
  title: 'Menu Title',
  arg: 'argument',
  autocomplete: 'autocomplete-text',
  subtitle: 'Optional subtitle',
  type: 'default',
};

// Validate with Zod
const result = alfredMenuItemSchema.safeParse(menuItem);
```

### Icon Validation

```typescript
import { alfredIconSchema } from './schemas/alfred-icon';

const icon = {
  type: 'fileicon',
  path: 'path/to/icon.png',
};

// Validates both schema and file existence
const result = alfredIconSchema.safeParse(icon);
```

## Scripts

### Testing
```bash
yarn test                     # Run all tests
yarn test:alfred-icons        # Test icon schemas
yarn test:alfred-menu-items   # Test menu item schemas
```

### Code Quality
```bash
yarn lint                     # Lint source files
yarn format                   # Format code with Biome
yarn check                    # Run both linting and formatting
```

## Development

This project uses:
- **TypeScript** for type safety
- **Zod** for runtime validation
- **Vitest** for testing
- **Biome** for linting and formatting

Code is formatted with:
- Single quotes
- 2-space indentation
- Trailing commas
- Semicolons

## License

MIT
