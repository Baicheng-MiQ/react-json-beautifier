# React JSON Beautifier

A beautiful React component for visualizing JSON data with smart type detection and icons.
<img width="1155" alt="image" src="https://github.com/user-attachments/assets/2fc21211-137e-44ab-93b4-0660b9d503f0" />

## Features

- 🎨 Beautiful UI with Tailwind CSS
- 🔍 Smart type detection (dates, emails, colors, etc.)
- 🎯 Automatic icon mapping based on field names
- 📊 Progress bar for percentage values
- 🎵 Special formatting for music/song fields
- 📍 Geo-location formatting
- 👤 Gender field detection
- 🎨 Color code visualization

## Installation

```bash
npm install react-json-beautifier
# or
yarn add react-json-beautifier
```

## Usage

```jsx
import { JsonVisualizer } from 'react-json-beautifier';

const data = {
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  location: "40.7128,-74.0060",
  progress: 0.75,
  isActive: true,
  favoriteColor: "#FF5733",
  favoriteSong: "Summer Song",
  lastLogin: "2024-03-20T10:30:00Z"
};

function App() {
  return (
    <JsonVisualizer data={data} />
  );
}
```

## Props

### JsonVisualizer

| Prop | Type | Description |
|------|------|-------------|
| data | `Record<string, unknown> \| unknown[] \| string \| number \| boolean \| null` | The data to visualize |

### ValueRenderer

| Prop | Type | Description |
|------|------|-------------|
| label | `string` (optional) | The label for the value |
| value | `Record<string, unknown> \| unknown[] \| string \| number \| boolean \| null` | The value to render |

## License

MIT 
