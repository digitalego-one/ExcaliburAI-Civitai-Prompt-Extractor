# ExcaliburAI - Civitai Prompt Extractor

![ExcaliburAI Logo](./icons/icon128.png)

**ExcaliburAI - Civitai Prompt Extractor** is a powerful Chrome extension designed for AI enthusiasts, digital artists, and creators. It effortlessly extracts and organizes essential prompt data directly from AI-generated images' EXIF metadata, allowing you to manage and utilize your prompts with ease.

## 📄 Table of Contents

- [📖 Features](#-features)
- [🚀 Installation](#-installation)
- [🖥️ Usage](#️-usage)
- [⚙️ Configuration](#️-configuration)
- [📸 Screenshots](#-screenshots)
- [🔧 Development](#-development)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [📞 Support](#-support)

## 📖 Features

- **🖼️ Context Menu Integration**: Right-click on any AI-generated image and select **"Copy Prompt If Any"** to instantly extract prompt data.
- **🖥️ Interactive Popup Interface**:
  - **🔍 Organized Sections**: View **Prompt**, **Negative Prompt**, and **Other Metadata** in clearly labeled sections.
  - **📋 Individual Copy Buttons**: Copy each section separately with dedicated **Copy** buttons.
  - **💡 Responsive Design**: Clean layout that adapts to various screen sizes without horizontal scrolling.
  - **🔒 Secure Handling**: All data is processed locally within your browser, ensuring privacy and security.
  - **⚡ Quick Access**: Instantly access the latest copied information directly from the popup.
- **✂️ Intelligent Parsing**: Automatically parses and formats EXIF data to accurately separate prompts and metadata.
- **⚙️ Customizable Settings**:
  - **Enable/Disable Notifications**: Choose whether to receive alerts upon successful or failed copy actions.
  - **Specify Allowed Domains**: Restrict the extension's functionality to specific websites for enhanced security.
- **🚀 In-Memory Caching**: Optimizes performance by caching EXIF data during your browsing session.
- **🔒 Privacy-Focused**: Operates entirely within your browser without transmitting any data externally.

## 🚀 Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/digitalego-one/ExcaliburAI-Civitai-Prompt-Extractor
   ```
2. **Navigate to the Directory**:
   ```bash
   cd ExcaliburAI-Civitai-Prompt-Extractor
   ```
3. **Load the Extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** by toggling the switch in the top right corner.
   - Click on **Load unpacked** and select the cloned repository folder.

## 🖥️ Usage

1. **Extracting Prompts**:
   - Navigate to any AI-generated image on supported websites.
   - **Right-click** on the image and select **"Copy Prompt If Any"** from the context menu.
   
2. **Viewing Extracted Data**:
   - Click on the **ExcaliburAI** toolbar icon to open the popup.
   - The popup displays the **Prompt**, **Negative Prompt**, and **Other Metadata** in separate sections.
   
3. **Copying Data**:
   - Use the **Copy** buttons next to each section to copy the respective data to your clipboard.

## ⚙️ Configuration

Access the extension's settings to customize its behavior:

1. **Open Options Page**:
   - Click on the **ExcaliburAI** toolbar icon.
   - Click on the **Settings** or **Options** button within the popup, or navigate to `chrome://extensions/`, find **ExcaliburAI**, and click **Details** > **Extension options**.

2. **Configure Settings**:
   - **Enable/Disable Notifications**: Toggle to receive or suppress notifications.
   - **Specify Allowed Domains**: Enter domains where the extension is permitted to extract prompt data.

## 📸 Screenshots

![Popup Interface](./screenshots/popup.png)
*Clean and organized popup displaying Prompt, Negative Prompt, and Other Metadata.*

![Options Page](./screenshots/options.png)
*Settings page allowing customization of notifications and allowed domains.*

## 🔧 Development

### Prerequisites

- **Node.js & npm**: Ensure you have Node.js and npm installed for managing dependencies (if any).

### Project Structure

```
ExcaliburAI-Prompt-Extractor/
│
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── screenshots/
│   ├── popup.png
│   └── options.png
│
├── src/
│   ├── background.js
│   ├── content.js
│   ├── exif.js
│   ├── popup.html
│   ├── popup.js
│   ├── options.html
│   └── options.js
│
├── manifest.json
├── README.md
└── LICENSE
```

### Building the Extension

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Development Server** (if applicable):
   ```bash
   npm start
   ```
3. **Package the Extension**:
   - Navigate to `chrome://extensions/`.
   - Click on **Pack extension**.
   - Select the extension directory and follow the prompts.

## 🤝 Contributing

Contributions are welcome! Follow these steps to contribute to **ExcaliburAI - Civitai Prompt Extractor**:

1. **Fork the Repository**:
   - Click the **Fork** button at the top right of this page.
   
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/YourFeatureName
   ```
   
3. **Commit Your Changes**:
   ```bash
   git commit -m "Add your feature"
   ```
   
4. **Push to the Branch**:
   ```bash
   git push origin feature/YourFeatureName
   ```
   
5. **Open a Pull Request**:
   - Navigate to the original repository.
   - Click on **Compare & pull request**.
   - Provide a clear description of your changes and submit.

### Guidelines

- **Code Quality**: Ensure your code follows best practices and is well-documented.
- **Testing**: Test your changes thoroughly before submitting.
- **Respect the Community**: Be respectful and constructive in your interactions.

## 📜 License

Distributed under the [Proprietary License](./LICENSE)

## 📞 Support

Have questions or need assistance? Reach out to us:

- **Email**: [hello@digitalego.one](mailto:hello@digitalego.one)
- **Issues**: [GitHub Issues](https://github.com/digitalego-one/ExcaliburAI-Civitai-Prompt-Extractor/issues)
- **Website**: [https://www.excaliburai.top](https://excaliburai.top/)

---

*Thank you for using **ExcaliburAI - Civitai Prompt Extractor**! We strive to continuously improve and provide the best experience for our users.*


---

  ![License](https://img.shields.io/badge/license-PROPRIETARY-blue.svg)
  ![Version](https://img.shields.io/badge/version-1.2.0-brightgreen.svg)


