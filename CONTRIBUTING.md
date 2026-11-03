# Contributing to DevUtils

Thank you for your interest in contributing to **DevUtils**! We welcome bug reports, feature suggestions, documentation enhancements, and code contributions from both developers and QA engineers worldwide.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please treat all contributors with respect, empathy, and professional courtesy.

---

## Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/dev-utils.git
   cd dev-utils
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the application in development mode:**
   ```bash
   npm start
   ```
4. **Run existing unit tests:**
   ```bash
   npm test
   ```

---

## Contribution Workflow

1. Create a descriptive topic branch:
   ```bash
   git checkout -b feature/new-diff-viewer
   ```
2. Write clean, modular TypeScript code following standard practices.
3. **Write Unit Tests**: Every utility function added to `src/shared/utils/engine.ts` must have corresponding test coverage in `tests/unit/`.
4. Ensure tests and formatting pass:
   ```bash
   npm test
   ```
5. Commit your changes with clear semantic messages (`feat: ...`, `fix: ...`, `docs: ...`).
6. Push to your fork and submit a Pull Request.

---

## Guidelines for Adding a New Utility

When proposing or implementing a new developer or QA tool:
1. **100% Offline Requirement**: The utility must never perform external network queries, background tracking, or telemetry.
2. **Performance**: All text manipulations and cryptographic hashes should execute smoothly without blocking the UI thread.
3. **Testability**: Provide unit tests covering normal execution, empty states, and erroneous inputs.
4. **Clean UI**: Match the dark-mode aesthetic and maintain responsive layouts in `src/renderer/`.

---

## Questions and Support

Feel free to open an Issue or discussion thread on GitHub. Happy coding and testing!

