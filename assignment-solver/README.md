# Assignment Solver - Chrome Extension

A Chrome extension that uses Google's Gemini AI to extract, analyze, and solve online assignment questions. Built for educational platforms like NPTEL, Coursera, and similar MOOC platforms.

## Features

- **AI-Powered Question Extraction**: Uses Gemini to parse page HTML and extract structured question data
- **Multi-Format Support**: Handles single-choice (radio), multi-choice (checkbox), and fill-in-the-blank questions
- **Study Hints Mode**: Get explanations, elimination tips, and learning guidance without direct answers
- **Auto-Solve Mode**: Automatically solve all questions, fill answers, and submit
- **BYOK (Bring Your Own Key)**: Uses your own Gemini API key - no server, fully client-side
- **Export Functionality**: Export extracted data to JSON for backup or analysis

## Installation

### Prerequisites
- Google Chrome browser (version 116+)
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Steps

1. **Download/Clone the extension**
   ```bash
   git clone <repository-url>
   cd assignment-solver
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the `assignment-solver` folder

3. **Configure API Key**
   - Click the extension icon to open the side panel
   - Click **Settings** button
   - Enter your Gemini API key
   - Click **Save Key**

## Usage

### Basic Workflow

1. **Navigate** to an assignment page on your educational platform
2. **Open** the extension by clicking its icon (opens side panel)
3. **Extract** questions by clicking "Extract Questions (via Gemini)"
4. **Choose** your mode:
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

| Type | Description | How It's Handled |
|------|-------------|------------------|
| Single Choice | Radio button questions | Clicks the correct radio option |
| Multi Choice | Checkbox questions | Checks all correct options, unchecks wrong ones |
| Fill-in-the-Blank | Text/number input fields | Types the answer and triggers input events |

## File Structure

```
assignment-solver/
├── manifest.json      # Extension configuration
├── background.js      # Service worker for side panel
├── content.js         # Page interaction script
├── sidepanel.html     # Side panel UI
├── sidepanel.js       # Main logic and Gemini integration
├── icons/
│   ├── icon16.png     # Toolbar icon
│   └── icon48.png     # Extension icon
└── README.md          # This file
```

## Technical Details

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Side Panel    │────▶│  Content Script  │────▶│   Assignment    │
│  (sidepanel.js) │     │   (content.js)   │     │      Page       │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│   Gemini API    │
│ (gemini-2.5-flash)
└─────────────────┘
```

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
      "choices": [
        { "option_id": "opt-1", "text": "Option A" }
      ],
      "inputs": [
        { "input_id": "input-1", "input_type": "text" }
      ]
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

#### Export Format
```json
{
  "submut_button_id": "submitbutton",
  "data": [
    {
      "question_id": "Q1",
      "question": "Question text...",
      "answer_text": "for fill blanks",
      "anwser_option_id": "opt-1 or ['opt-1', 'opt-2'] for multi"
    }
  ]
}
```

## Configuration

### API Key Storage
- Stored locally in `chrome.storage.local`
- Never sent to any server except Google's Gemini API
- Persists across browser sessions

### Model Selection
- Default: `gemini-2.5-pro`
- Can be changed in `sidepanel.js` (line 8):
  ```javascript
  const GEMINI_MODEL = "gemini-2.5-pro";
  ```

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

| Permission | Why It's Needed |
|------------|-----------------|
| `activeTab` | Access current tab to extract/modify content |
| `scripting` | Inject content script for page interaction |
| `storage` | Store API key locally |
| `sidePanel` | Display the extension UI |
| `host_permissions` (googleapis.com) | Make API calls to Gemini |

## Limitations

- **Image-based questions**: Cannot analyze images in questions (notes this in hints)
- **Complex interactions**: May not work with heavily dynamic/SPA pages
- **Platform-specific**: Optimized for NPTEL-style pages, may need adjustment for others
- **Rate limits**: Free Gemini API has usage limits
- **Accuracy**: AI answers are not guaranteed to be correct

## Security Considerations

- API key is stored locally only
- No data is sent to third-party servers
- All processing happens client-side or via official Gemini API
- Review the code before use in sensitive environments

## Development

### Modifying Selectors
If the extension doesn't work on your platform, you may need to adjust selectors in `content.js`:

```javascript
// Update these selectors for your platform
const selectors = [
  '.gcb-assessment-content',
  '.qt-assessment',
  '#assessment-main',
  // Add your platform's selectors here
];
```

### Adding New Question Types
1. Update `EXTRACTION_SCHEMA` in `sidepanel.js`
2. Add handling in `showDetail()` function
3. Add apply logic in `content.js` `applyAnswer()` function

## License

MIT License - Use at your own risk. This tool is for educational purposes.

## Disclaimer

This extension is provided as-is for educational and research purposes. Users are responsible for:
- Complying with their institution's academic integrity policies
- Understanding that AI-generated answers may be incorrect
- Using the tool ethically and responsibly

The developers are not responsible for any academic consequences resulting from the use of this tool.
