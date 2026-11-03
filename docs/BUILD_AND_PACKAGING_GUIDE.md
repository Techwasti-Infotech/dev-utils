# Cross-Platform Build & Packaging Guide

This guide details how to clone, install, test, and package standalone native binaries for **Windows (`.exe`)**, **macOS (`.dmg`, `.zip`)**, and **Linux (`.AppImage`, `.deb`, `.rpm`)**.

---

## 1. System Requirements

* **Node.js**: Version 18.x or 20.x LTS ([Download Node.js](https://nodejs.org/))
* **Package Manager**: npm (bundled with Node.js)
* **Git**: Installed and available in your system PATH

---

## 2. Clone the Repository

```bash
git clone https://github.com/techwasti/dev-utils.git
cd dev-utils
```

---

## 3. Install Dependencies & Run Tests

```bash
# Install required dependencies
npm install

# Run complete unit test suite
npm test

# Run tests with code coverage report
npm run test:coverage
```

---

## 4. Launching in Development Mode

```bash
# Starts the application with live TypeScript compilation and hot reload
npm start
```

---

## 5. Building Native Executables Locally

DevUtils uses `electron-builder` to package stand-alone executables that run out of the box with zero runtime dependencies.

### On Windows (`.exe` Installer & Portable)
```bash
npm run dist:win
```
* **Output directory**: `release/`
* **Generated files**:
  - `DevUtils Desktop-Setup-1.0.0.exe` (NSIS Installer with Start Menu / Desktop shortcuts)
  - `DevUtils Desktop-1.0.0.exe` (Standalone portable single-file executable)

### On macOS (`.dmg` & `.zip`)
> *Note: macOS packaging should be run on a macOS machine.*
```bash
npm run dist:mac
```
* **Output directory**: `release/`
* **Generated files**:
  - `DevUtils Desktop-1.0.0-mac.dmg` (Apple Disk Image installer)
  - `DevUtils Desktop-1.0.0-mac.zip`

### On Linux (`.AppImage`, `.deb`, `.rpm`)
> *Note: Linux builds require standard packaging dependencies (e.g. `libarchive-tools`, `libfuse2`).*
```bash
npm run dist:linux
```
* **Output directory**: `release/`
* **Generated files**:
  - `DevUtils Desktop-1.0.0-linux.AppImage` (Self-contained runnable bundle on any Linux distro)
  - `DevUtils Desktop-1.0.0-linux.deb` (Debian / Ubuntu package)
  - `DevUtils Desktop-1.0.0-linux.rpm` (Fedora / Red Hat package)

---

## 6. Automated Multi-OS Builds with GitHub Actions

You don't need access to every physical operating system to build multi-platform binaries. 

Our pre-configured workflow [`.github/workflows/build-and-release.yml`](file:///c:/Users/mahes/Downloads/Personal Projects- WOrk/Techwasti/dev-utils/.github/workflows/build-and-release.yml) automatically runs on:
- `windows-latest`
- `macos-latest`
- `ubuntu-latest`

Whenever you push a tag (e.g. `git tag v1.0.0 && git push origin v1.0.0`), GitHub Actions will:
1. Run all unit tests to ensure stability.
2. Build `.exe`, `.dmg`, and `.AppImage` binaries concurrently across all 3 platforms.
3. Automatically publish a draft/final **GitHub Release** with the binary downloads attached.

