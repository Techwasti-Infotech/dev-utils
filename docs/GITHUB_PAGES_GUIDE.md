# GitHub Pages Hosting Guide

DevUtils includes an open-source product documentation and download portal located in the [`docs/`](file:///c:/Users/mahes/Downloads/Personal Projects- WOrk/Techwasti/dev-utils/docs) directory.

This guide explains how to enable free automated hosting on GitHub Pages.

---

## 1. Automated Workflow Setup

A turnkey GitHub Actions workflow is provided in [`.github/workflows/pages.yml`](file:///c:/Users/mahes/Downloads/Personal Projects- WOrk/Techwasti/dev-utils/.github/workflows/pages.yml).

Every time a commit is pushed to the `main` branch modifying the `docs/` folder, GitHub Actions automatically deploys the latest version to GitHub Pages.

---

## 2. Enabling GitHub Pages on Your Repository

1. Open your repository on GitHub (`https://github.com/techwasti/dev-utils`).
2. Navigate to **Settings** -> **Pages** (under the "Code and automation" section).
3. Under **Build and deployment**:
   * **Source**: Select **GitHub Actions**.
4. That's it! GitHub will automatically trigger the workflow and provide a public HTTPS URL:
   ```
   https://techwasti.github.io/dev-utils/
   ```

---

## 3. Alternative: Deploying from Branch Folder

If you prefer not to use GitHub Actions for documentation deployment:
1. Go to **Settings** -> **Pages**.
2. **Source**: Select **Deploy from a branch**.
3. **Branch**: Select `main` and folder `/docs`.
4. Click **Save**.

---

## 4. Customizing the Documentation Page

The entry point for the documentation site is [`docs/index.html`](file:///c:/Users/mahes/Downloads/Personal Projects- WOrk/Techwasti/dev-utils/docs/index.html).

You can customize:
- Release download buttons to link to your exact GitHub tag.
- Screenshots, tutorials, and user feedback forms.
- Adding custom domains (e.g. `devutils.techwasti.com`).

