# Collab IDE LeetCode Extension

The **Collab IDE LeetCode Extension** is a powerful Chrome extension designed to enhance your coding experience on LeetCode. It integrates seamlessly with the Collab IDE platform, enabling you to save, manage, and collaborate on your LeetCode solutions effortlessly.

---

## Features

- **Save Solutions**: Extract and save your LeetCode solutions directly to Collab IDE.
- **Problem Metadata**: Automatically capture problem details such as title, description, difficulty, and URL.
- **Language Detection**: Accurately detect the programming language used in the LeetCode editor.
- **Collaborative Editing**: Share and collaborate on your saved solutions with teammates via Collab IDE.
- **Floating Action Button**: Access extension features quickly with a user-friendly floating button.
- **Authentication**: Securely log in to Collab IDE to manage your solutions.

---

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yashsuthar00/Collab-IDE-leetcode-extension.git
   ```

2. Open Chrome and navigate to `chrome://extensions`.

3. Enable **Developer Mode**.

4. Click **Load unpacked** and select the folder containing this repository.

---

## Usage

1. Navigate to a LeetCode problem page.
2. Click the floating action button in the bottom-right corner.
3. Log in to Collab IDE if prompted.
4. Use the **Save Current Solution** button to save your solution.
5. View and manage your saved solutions via the Collab IDE platform.

---

## Development

### Prerequisites

- Node.js and npm installed.
- Chrome browser.

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server for Collab IDE:
   ```bash
   npm run dev
   ```

3. Load the extension in Chrome as described in the **Installation** section.

### File Structure

```
Collab-IDE-leetcode-extension/
├── background.js          # Background script for handling extension events
├── content.js             # Content script for interacting with LeetCode pages
├── manifest.json          # Chrome extension manifest
├── popup.html             # HTML for the extension popup
├── popup.js               # JavaScript for the extension popup
├── popup.css              # Styles for the extension popup
├── README.md              # Documentation
```

---

## API Integration

The extension communicates with the Collab IDE backend via REST APIs. Ensure the Collab IDE server is running locally or deployed to a production environment.

### Endpoints Used

- **Authentication**: `/api/auth`
- **Save Solution**: `/api/leetcode/save`
- **Fetch Solutions**: `/api/leetcode`

---

## Contributing

We welcome contributions to improve this extension! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a detailed description of your changes.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Support

For issues or feature requests, please open an issue in the repository or contact us at [hello@yashsuthar.com](mailto:hello@yashsuthar.com).

---

## Acknowledgments

- [LeetCode](https://leetcode.com) for providing an excellent coding platform.
- [Collab IDE](https://colab-ide.vercel.app) for enabling collaborative coding experiences.