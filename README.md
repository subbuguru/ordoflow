

# Ordoflow

<p align="center">
  <img src="https://github.com/user-attachments/assets/017d0b19-a422-4b64-a997-8b3bd26a1c67" width="150" />
  <img src="https://github.com/user-attachments/assets/1262eb9e-faf3-4702-b85b-1294b4d78988" width="150" />
  <img src="https://github.com/user-attachments/assets/30f309a6-53f8-4b60-b6f2-11537a11b470" width="150" />
  <img src="https://github.com/user-attachments/assets/28fa356c-eea2-46cb-b543-0cefb03c1d2b" width="150" />
  <img src="https://github.com/user-attachments/assets/07d01ee1-dc88-47e4-a98f-4d9937b1a4d8" width="150" />
</p>



Ordoflow is a todo list application built with Expo and React-Native. I built it (with the assistance of GenAI) as I wanted a simple one-list task manager for myself to avoid context switching. 

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
