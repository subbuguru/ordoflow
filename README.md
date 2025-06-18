# Ordoflow

Ordoflow is a todo list application built with Expo and React-Native. It was built as an experiment "vibe-coding" with Google Gemini 2.5 Pro. Even this readme.md is AI generated...

## ✨ Features

* **Full Task Management:** Add, edit, complete, and delete tasks with titles, descriptions, and priorities.
* **Task Priorities:** Assign one of four priority levels (P1-P4) to each task, visualized with distinct colors.
* **Persistent Storage:** Your tasks are saved locally on your device using a built-in SQLite database.
* **Dynamic Theming:** Automatically adapts to your device's system-wide Light and Dark modes for a native feel.
* **Manual Reordering:** Long-press and drag active tasks to arrange them in any order you prefer.
* **Modern Gestures:** Swipe any task to the left to quickly delete it.
* **Dedicated Search:** A separate tab allows you to instantly search the title and description of all your tasks, both active and completed.

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine for development and testing.

### 1. Install Dependencies

In your project's terminal, run the following command to install all the necessary packages.

```bash
npm install
```

### 2. Start the Development Server

Start the Expo development server:

```bash
npx expo start
```


## 📁 Project Structure

```
app/
├── (tabs)/              # Tab-based navigation
│   ├── index.tsx        # Main todo list
│   ├── completed.tsx    # Completed tasks
│   └── search.tsx       # Search functionality
└── _layout.tsx          # Root layout

components/
├── todos/               # Todo-related components
│   ├── AddTodoButton.tsx
│   ├── EditTodoModal.tsx
│   ├── TodoList.tsx
│   └── TodoListItem.tsx
└── ui/                  # Reusable UI components

hooks/
├── TodosContext.tsx     # Global state management
├── useColorScheme.ts    # Theme detection
└── useTheme.ts          # Theme utilities

constants/
└── Colors.ts            # Color definitions
```

## 🎯 Usage

### Adding Tasks
1. Tap the "+" button to create a new task
2. Enter a title (required) and optional description
3. Select a priority level (P1-P4)
4. Tap "Add Task" to save

### Managing Tasks
- **Complete**: Tap the checkbox to mark as complete
- **Edit**: Tap on a task to edit its details
- **Reorder**: Long-press and drag tasks to rearrange
- **Delete**: Swipe left on any task to delete

### Search
- Use the Search tab to find tasks by title or description
- Search works across both active and completed tasks

## 🎨 Priority System

Tasks can be assigned one of four priority levels:

- **P1** (Highest): Red indicator
- **P2** (High): Orange indicator  
- **P3** (Medium): Yellow indicator
- **P4** (Low): Blue indicator

## 💾 Data Storage

Ordoflow uses Expo SQLite for local data persistence. Your tasks are stored directly on your device and don't require an internet connection.

## 🌙 Theming

The app automatically adapts to your device's system theme:
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Comfortable dark interface

## 🤝 Contributing

This project was built as an experimental "vibe-coding" session with AI assistance. Feel free to fork and modify for your own use!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/) and React Native
- Created through AI-assisted development with Google Gemini 2.5 Pro
- Icons provided by [Expo Vector Icons](https://icons.expo.fyi/)