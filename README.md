# SaveWeb2Zip Bot 🤖

A powerful Puppeteer-based bot that automatically downloads and archives web pages using [saveweb2zip.com](https://saveweb2zip.com/en). Perfect for creating offline backups of websites with their complete structure and assets.

## ✨ Features

- 🚀 Batch download multiple URLs from a JSON file
- 📁 Automatic file organization with smart naming
- ⏱️ Timestamp-based versioning for duplicate pages
- 🔄 Preserves website structure and assets
- 🛡️ Built-in error handling and retry mechanisms
- 📊 Detailed progress logging

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/terminalDZ/saveweb2zip-bot.git
cd saveweb2zip-bot
```

2. Install dependencies:
```bash
npm install
```

## 📝 Configuration

1. Create or edit `urls.json` with your target URLs:
```json
[
    "https://example.com/page1.html",
    "https://example.com/page2.html"
]
```

## 🚀 Usage

Run the bot:
```bash
node bot.js
```

The bot will:
1. Process each URL in your `urls.json` file
2. Download the complete website structure
3. Save ZIP files in the `zip` directory
4. Automatically handle duplicate filenames by adding timestamps

## 📂 Output Structure

Downloaded files are saved in the `zip` directory with the following naming convention:
- First download: `pagename.zip`
- Subsequent downloads: `pagename_TIMESTAMP.zip`

Example:
```
zip/
  ├── about.zip
  ├── about_2025-01-11T06-34-41.zip
  └── contact.zip
```

## ⚙️ Features in Detail

- **Smart File Naming**: Automatically extracts page names from URLs
- **Duplicate Handling**: Uses timestamps to prevent overwriting
- **Progress Monitoring**: Detailed console logging of each step
- **Error Recovery**: Built-in retry mechanism for failed downloads
- **File Verification**: Ensures downloaded files are complete and valid

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 👤 Author

**Idriss Boukmouche**
- GitHub: [@terminalDZ](https://github.com/terminalDZ)

## 🙏 Acknowledgments

- [Puppeteer](https://pptr.dev/) - Headless Chrome Node.js API
- [SaveWeb2Zip](https://saveweb2zip.com) - Website archiving service

---
⭐️ If you find this project useful, please consider giving it a star on GitHub!
