# Assignment Solver - Browser Extension

A browser extension that uses Google's Gemini AI to extract, analyze, and solve online assignment questions. Built for educational platforms like NPTEL, Coursera, and similar MOOC platforms. Supports both Chrome and Firefox.

## Features

- **AI-Powered Question Extraction**: Uses Gemini to parse page HTML and extract structured question data
- **Multi-Format Support**: Handles single-choice (radio), multi-choice (checkbox), and fill-in-the-blank questions
- **Image Support**: Handles image-based questions by sending the screenshot for entire assignment as well extracting the image from the questions and sending it to Gemini as well.
- **Study Hints Mode**: Get explanations, elimination tips, and learning guidance without direct answers
- **Auto-Solve Mode**: Automatically solve all questions, fill answers, and submit
- **BYOK (Bring Your Own Key)**: Uses your own Gemini API key - no server, fully client-side
- **Export Functionality**: Export extracted data to JSON for backup or analysis
- **Cross-Browser**: Works on both Chrome and Firefox

## Todo

- [x] Modularise the codebase a bit (this was just for testing and this works better than I expected)
- [x] Firefox Support
- [x] Modular Build System
- [x] Add Gemini Model Selector
- [ ] Better UI maybe (this gemini generated one works fine ig but lets see)

## Prerequisites

- [Bun](https://bun.sh/) package manager
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- Chrome (version 116+) or Firefox (version 121+)

## Installation

### 1. Clone and Setup

```bash
git clone <repository-url>
cd assignment-solver
bun install  # Install dependencies
```

### 2. Build the Extension

```bash
# Build for both browsers
bun run build

# Or build individually
bun run build:chrome    # Build Chrome extension
bun run build:firefox   # Build Firefox extension
```

### 3. Load in Browser

**Chrome:**

- Open Chrome and navigate to `chrome://extensions/`
- Enable **Developer mode** (toggle in top-right corner)
- Click **Load unpacked**
- Select the `dist/chrome/` folder

**Firefox:**

- Open Firefox and navigate to `about:debugging`
- Click **This Firefox**
- Click **Load Temporary Add-on**
- Select any file from the `dist/firefox/` folder (e.g., `manifest.json`)

### 4. Configure API Key

- Click the extension icon to open the side panel
- Click **Settings** button
- Enter your Gemini API key
- Click **Save Key**

## Development

### Watch Mode (Auto-rebuild on changes)

```bash
# For Chrome
bun run dev:chrome

# For Firefox
bun run dev:firefox
```

### Lint & Format

```bash
bun run lint      # Run ESLint
bun run format    # Run Prettier
```

## Usage

### Basic Workflow

1. **Navigate** to an assignment page on your educational platform
2. **Open** the extension by clicking its icon (opens side panel)
3. **Click** "Solve Assignment" to automatically extract, analyze, and solve
4. Review results and confirm auto-submit (if enabled)

### Manual Control

1. **Extract** questions by clicking "Extract Questions (via Gemini)"
2. **Choose** your mode:
   - **Manual Mode**: Click individual questions, get hints, select answers, apply one by one
   - **Auto Mode**: Click "Solve All + Submit" to automatically solve and submit everything

### Manual Mode (Recommended for Learning)

1. Click **Extract Questions** to scan the page
2. Click on any question in the list to view details
3. Click **Get Study Hints** to receive:
   - Key concepts being tested
   - Elimination tips for wrong answers
   - Common traps to avoid
   - What to verify before answering
4. Select your answer in the side panel
5. Click **Apply Answer to Page** to fill it on the actual page
6. Click **Back to List** and repeat for other questions
7. When done, click **Submit Assignment Only**

### Auto Mode (Full Automation)

1. Click **Extract Questions** to scan the page
2. Click **Solve All + Submit**
3. Confirm the action when prompted
4. Wait for the process to complete:
   - AI analyzes each question
   - Answers are filled on the page
   - Submit button is clicked automatically
5. Review the summary and check the page

## Supported Question Types

| Type              | Description              | How It's Handled                                |
| ----------------- | ------------------------ | ----------------------------------------------- |
| Single Choice     | Radio button questions   | Clicks the correct radio option                 |
| Multi Choice      | Checkbox questions       | Checks all correct options, unchecks wrong ones |
| Fill-in-the-Blank | Text/number input fields | Types the answer and triggers input events      |

## Project Structure

```
assignment-solver/
├── src/
│   ├── core/              # Shared types, messages, utilities
│   ├── platform/          # Browser API adapters (cross-browser)
│   ├── services/          # Business logic (Gemini, storage)
│   ├── background/        # Service worker handlers
│   ├── content/           # Content script (DOM interaction)
│   └── ui/                # Side panel UI
├── public/                # Static assets (HTML, CSS, icons)
├── dist/                  # Build output
│   ├── chrome/            # Chrome build
│   └── firefox/           # Firefox build
├── manifest.config.js     # Dynamic manifest generation
├── vite.config.js         # Vite build configuration
└── package.json           # Dependencies and scripts
```

## Technical Details

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Side Panel    │────▶│  Content Script  │────▶│   Assignment    │
│  (src/ui/)      │     │   (src/content/) │     │      Page       │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│   Gemini API    │
│ (gemini-2.5-pro)|
└─────────────────┘
```

### Build System

- **Vite**: Modern build tool with ES modules support
- **webextension-polyfill**: Cross-browser API compatibility
- **Dynamic Manifests**: Separate manifests for Chrome (`sidePanel`) and Firefox (`sidebar_action`)

### Data Flow

1. **Extraction Phase**
   - Content script extracts raw HTML from the page
   - HTML is sent to Gemini with extraction schema
   - Gemini returns structured JSON with questions, IDs, and options

2. **Solving Phase**
   - Each question is sent to Gemini with answer schema
   - Gemini returns the correct option IDs or fill-in text
   - Answers are stored in extension state

3. **Application Phase**
   - Content script receives answer data
   - DOM elements are located by ID
   - Clicks/inputs are simulated with proper events

### JSON Schemas

#### Extraction Schema

```json
{
	"submit_button_id": "submitbutton",
	"confirm_submit_button_ids": {
		"not_all_attempt_submit": "...",
		"not_all_attempt_cancel": "...",
		"no_attempt_ok": "..."
	},
	"questions": [
		{
			"question_id": "unique-id",
			"question_type": "single_choice|multi_choice|fill_blank",
			"question": "Question text...",
			"choices": [{ "option_id": "opt-1", "text": "Option A" }],
			"inputs": [{ "input_id": "input-1", "input_type": "text" }]
		}
	]
}
```

#### Answer Schema

```json
{
	"question_id": "unique-id",
	"question_type": "single_choice",
	"selected_option_ids": ["opt-2"],
	"fill_blank_answer": "",
	"confidence": "high|medium|low",
	"reasoning": "Brief explanation..."
}
```

## Configuration

### API Key Storage

- Stored locally in `browser.storage.local` (via polyfill)
- Never sent to any server except Google's Gemini API
- Persists across browser sessions

### Model Selection

- Default: `gemini-2.5-pro`
- Can be changed in `src/services/gemini/index.js`

### Rate Limiting

- 500ms delay between API calls for answers
- 200ms delay between DOM operations
- Prevents API throttling and ensures reliable page updates

## Troubleshooting

### "Could not get page HTML"

- Ensure you're on an actual assignment page
- The page must be fully loaded
- Try refreshing the page and re-extracting

### "Question container not found"

- The extracted IDs don't match the page
- Try re-extracting questions
- Check console for detailed error info

### "API Key invalid"

- Verify your key at [Google AI Studio](https://aistudio.google.com/)
- Ensure the key has Gemini API access enabled
- Check for extra spaces when pasting

### Answers not being applied

- Some platforms use custom input components
- Check browser console for errors
- Try applying answers one at a time to identify issues

### Rate limit errors

- Wait a few minutes before retrying
- Consider upgrading your API quota
- Reduce the number of questions per session

## Permissions Explained

| Permission                                       | Why It's Needed                              |
| ------------------------------------------------ | -------------------------------------------- |
| `activeTab`                                      | Access current tab to extract/modify content |
| `scripting`                                      | Inject content script for page interaction   |
| `storage`                                        | Store API key locally                        |
| `sidePanel` (Chrome) / `sidebarAction` (Firefox) | Display the extension UI                     |
| `host_permissions` (googleapis.com)              | Make API calls to Gemini                     |

## Limitations

- **Rate limits**: Free Gemini API has usage limits
- **Accuracy**: AI answers are not guaranteed to be correct

## Security Considerations

- API key is stored locally only
- No data is sent to third-party servers
- All processing happens client-side or via official Gemini API
- Review the code - it's open source for a reason

## Development

### Modifying Selectors

If the extension doesn't work on your platform, you may need to adjust selectors in `src/content/extractor.js`:

```javascript
// Update these selectors for your platform
const selectors = [
	".assessment-contents",
	".qt-assessment",
	".gcb-assessment-contents",
	// Add your platform's selectors here
];
```

### Adding New Question Types

1. Update extraction schema in `src/services/gemini/schema.js`
2. Add handling in `src/content/applicator.js`
3. Update UI controllers in `src/ui/controllers/`

## Note

Me not responsible for any academic consequences resulting from the use of this tool.
(if you fail blame gemini swwetie)
