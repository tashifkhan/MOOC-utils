# Data Flow Diagram

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Side Panel (UI Layer)                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ src/ui/index.js (Entry Point - DI Setup)                        │  │
│  │  ├─ Creates: StorageAdapter, RuntimeAdapter, Logger            │  │
│  │  ├─ Wires: StorageService, GeminiService                        │  │
│  │  └─ Initializes: SolveController, SettingsController            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Controllers (Business Logic)                                      │  │
│  │  ├─ SolveController (Main workflow)                              │  │
│  │  ├─ SettingsController (API key management)                      │  │
│  │  └─ ProgressController (Status updates)                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Elements & State Management                                       │  │
│  │  ├─ elements.js (DOM bindings)                                   │  │
│  │  └─ state.js (UI state)                                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                            ↕ (Messages)
┌─────────────────────────────────────────────────────────────────────────┐
│                       Background Service Worker                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ src/background/index.js (Entry Point - DI Setup)                │  │
│  │  ├─ Creates: TabsAdapter, ScriptingAdapter, RuntimeAdapter      │  │
│  │  ├─ Wires: ScreenshotService, GeminiService                     │  │
│  │  └─ Registers: Message Router with Handlers                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Message Router                                                    │  │
│  │  ├─ Maps MESSAGE_TYPES to Handlers                              │  │
│  │  └─ Dispatches messages to appropriate handlers                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Handlers (Message Processing)                                    │  │
│  │  ├─ ExtractionHandler → forwards to content script               │  │
│  │  ├─ ScreenshotHandler → calls ScreenshotService                 │  │
│  │  ├─ GeminiHandler → calls GeminiService.directAPICall()         │  │
│  │  └─ AnswerHandler → forwards to content script                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                            ↕ (Messages)
┌─────────────────────────────────────────────────────────────────────────┐
│                         Content Script (DOM Layer)                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ content.js (Internal Factories)                                  │  │
│  │  ├─ createLogger() → Logger with [NPTEL Solver] prefix           │  │
│  │  ├─ createExtractor() → HTML extraction logic                    │  │
│  │  └─ createApplicator() → Answer application logic                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Extraction → Returns: PageData                                   │  │
│  │  ├─ HTML content                                                 │  │
│  │  ├─ Embedded images (base64)                                     │  │
│  │  ├─ Page URL & title                                             │  │
│  │  └─ Button IDs                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Application → Modifies DOM                                        │  │
│  │  ├─ Fills radio buttons (single_choice)                          │  │
│  │  ├─ Checks checkboxes (multi_choice)                             │  │
│  │  └─ Types text (fill_blank)                                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                ↕
                          ┌──────────────┐
                          │ Gemini API   │
                          │ (Direct Call)│
                          └──────────────┘
```

## Complete Workflow: Solving an Assignment

```
1. USER ACTION
   └─ Click "Solve Assignment" button in side panel

2. SIDE PANEL (SolveController)
   └─ Step 1: Extract HTML
      ├─ Send EXTRACT_HTML message
      └─ Receive: PageData (html, images, button IDs)
   
   └─ Step 2: Capture Screenshots
      ├─ Send CAPTURE_FULL_PAGE message
      └─ Receive: Screenshot[] (base64 encoded)
   
   └─ Step 3: Analyze with Gemini
      ├─ Call GeminiService.extractAndAnswer()
      ├─ Inject: PageData + Screenshots + Images
      └─ Receive: ExtractionResult (questions with answers)
   
   └─ Step 4: Fill Answers
      ├─ For each question:
      │  ├─ Send APPLY_ANSWERS message
      │  └─ Content script fills the field
      └─ Show progress updates
   
   └─ Step 5: Submit (if auto-submit enabled)
      ├─ Send SUBMIT_ASSIGNMENT message
      └─ Content script clicks submit button

3. CONTENT SCRIPT (Processing)
   ├─ EXTRACT_HTML: Extracts page HTML and images
   ├─ APPLY_ANSWERS: Fills answers in form fields
   └─ SUBMIT_ASSIGNMENT: Clicks submit button

4. BACKGROUND (Message Handling)
   ├─ Routes messages to appropriate handlers
   ├─ EXTRACT_HTML → Injects content script, forwards message
   ├─ CAPTURE_FULL_PAGE → Calls ScreenshotService
   ├─ GEMINI_REQUEST → Calls GeminiService.directAPICall()
   └─ APPLY_ANSWERS/SUBMIT → Forwards to content script

5. GEMINI API (External Service)
   └─ Analyzes HTML + images/screenshots
      └─ Returns: JSON with extracted questions and answers

6. RESULT
   └─ Display results in side panel
      ├─ Question count
      ├─ Confidence levels
      ├─ Answer text
      └─ Reasoning (if provided)
```

## Service Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                        Services Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐       ┌──────────────────────┐       │
│  │   GeminiService      │       │  StorageService      │       │
│  │  ┌────────────────┐  │       │  ┌────────────────┐  │       │
│  │  │ extractAndAnswer   │       │  │ saveApiKey     │  │       │
│  │  │ directAPICall      │       │  │ getApiKey      │  │       │
│  │  └────────────────┘  │       │  │ saveExtraction │  │       │
│  └──────┬───────────────┘       │  │ getExtraction  │  │       │
│         │                       │  └────┬───────────┘  │       │
│         │                       │       │              │       │
│         └───────────────────────┘       └──────────────┘       │
│                 ↓                              ↓                │
├─────────────────────────────────────────────────────────────────┤
│                      Platform Adapters Layer                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────┐  ┌────────────────────┐               │
│  │  RuntimeAdapter    │  │  StorageAdapter    │               │
│  │  ├─ sendMessage    │  │  ├─ get            │               │
│  │  └─ onMessage      │  │  ├─ set            │               │
│  └──────────┬─────────┘  │  └─ remove         │               │
│             │            └────────────────────┘               │
│             │                                                  │
│  ┌────────────────────┐  ┌────────────────────┐               │
│  │   TabsAdapter      │  │ ScriptingAdapter   │               │
│  │  ├─ query          │  │  └─ executeScript  │               │
│  │  ├─ sendMessage    │  └────────────────────┘               │
│  │  └─ captureVisible │                                       │
│  └────────────────────┘                                       │
│             ↓                                                   │
├─────────────────────────────────────────────────────────────────┤
│                    Chrome APIs (Real Implementation)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  chrome.runtime      chrome.storage.local                      │
│  chrome.tabs         chrome.scripting                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Message Types and Flow

```
SIDE PANEL                  BACKGROUND                CONTENT SCRIPT
    ↓                            ↓                          ↓

User clicks "Solve"        (message router)          (msg handler)
    │                            │                         │
    ├─→ EXTRACT_HTML ──────────→ ExtractionHandler ─────→ Extract HTML
    │                            │                         │
    │                            └─→ content script ping    │
    │                                                       │
    ←──────────── PageData ←─────────────────────────────────┤
    │
    ├─→ CAPTURE_FULL_PAGE ──────→ ScreenshotHandler  ──→ ScreenshotService
    │                             (calls ScreenshotService  │
    │                             with TabsAdapter &        │
    │                             ScriptingAdapter)         │
    │                                                       │
    ←──────────── Screenshots ←────────────────────────────┤
    │
    ├─→ GEMINI_REQUEST ────────→ GeminiHandler
    │                            (calls GeminiService.directAPICall)
    │                                        │
    │                                        ├─→ Fetch to Gemini API
    │                                        │
    ←──────── ExtractionResult ←────────────┤
    │
    ├─→ APPLY_ANSWERS (multiple) ──→ AnswerHandler ──→ Apply answers
    │                                 (forwards to   │ to form fields
    │                                  content)       │
    │                                                 ├─→ Click radio/checkbox
    │                                                 │
    ←────────────────────────────────────────────────┤
    │
    ├─→ SUBMIT_ASSIGNMENT ─────────→ AnswerHandler ──→ Click submit button
    │                                (forwards to   │
    │                                 content)       │
    │                                                │
    ←────────────────────────────────────────────────┤
    │
    Display Results
    (questions, answers, confidence)
```

## Dependency Flow for Services

```
SolveController
│
├─ storage (StorageService)
│  └─ storage adapter (StorageAdapter)
│     └─ chrome.storage.local
│
├─ gemini (GeminiService)
│  └─ runtime adapter (RuntimeAdapter)
│     └─ chrome.runtime.sendMessage
│
├─ runtime (RuntimeAdapter)
│  └─ chrome.runtime.sendMessage
│
└─ progress (ProgressController)
   └─ DOM elements
```

## State Management Flow

```
UI State (StateManager)
│
├─ isProcessing (boolean)
│  └─ Updated during solve workflow
│
├─ extraction (ExtractionResult | null)
│  └─ Stored result from Gemini
│
└─ currentStep (string | null)
   └─ Track progress (extract, answer, fill, submit)

Side Effects:
├─ Storage updates via StorageService
├─ DOM updates via Controller methods
└─ Message sending via RuntimeAdapter
```
