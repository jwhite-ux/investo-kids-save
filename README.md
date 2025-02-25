
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/1fc0622a-5269-4d01-937e-b4f3505fd0b2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1fc0622a-5269-4d01-937e-b4f3505fd0b2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Framer Motion for animations

## How can I deploy this project?

### Using Lovable's built-in publishing

1. Open [Lovable](https://lovable.dev/projects/1fc0622a-5269-4d01-937e-b4f3505fd0b2) and click on Share -> Publish.
2. If you encounter any issues with the Lovable deployment, try:
   - Making sure all dependencies are correctly installed
   - Verifying there are no build errors in the console
   - Checking that all assets are correctly referenced

### Alternative Deployment Methods

If you're experiencing issues with Lovable's built-in publishing, you can deploy to Netlify, Vercel, or GitHub Pages:

**Deploy to Netlify:**
1. Create a Netlify account if you don't have one
2. Connect your GitHub repository
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

**Deploy to Vercel:**
1. Create a Vercel account if you don't have one
2. Import your GitHub repository
3. The defaults should work, but verify:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

## I want to use a custom domain - is that possible?

We don't support custom domains (yet) directly in Lovable. If you want to deploy your project under your own domain then we recommend using Netlify or Vercel as described above.

Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
