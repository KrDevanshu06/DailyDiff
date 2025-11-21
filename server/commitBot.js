import { Octokit } from "@octokit/rest";

export async function pushDailyUpdate(userToken, repoName, contentMessage) {
  // Initialize Octokit with the USER'S token, not your app's generic token
  const octokit = new Octokit({ 
    auth: userToken,
    request: {
      timeout: 15000, // 15 second timeout
      retries: 2,     // Retry up to 2 times on failure
    }
  });
  
  const [owner, repo] = repoName.split('/'); // e.g., "krdevanshu06/daily-log"
  const path = 'README.md';

  try {
    console.log(`Attempting to update ${repoName}...`);

    // 1. Get the current README (we need the SHA to update it)
    // If file doesn't exist, this throws error, which we catch to create new file
    let fileSha;
    let originalContent = "";

    try {
      const { data: fileData } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      fileSha = fileData.sha;
      originalContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
    } catch (err) {
      console.log("README not found, creating new one.");
    }
    
    // 2. Append new log entry
    const timestamp = new Date().toISOString().split('T')[0];
    const newContent = `${originalContent}\n\n- **${timestamp}**: ${contentMessage}`;
    
    // 3. Push the update
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `DailyDiff: Log update for ${timestamp}`,
      content: Buffer.from(newContent).toString('base64'),
      sha: fileSha, // undefined if creating new file
    });

    console.log("✅ Commit pushed successfully!");
    return { success: true, message: "Commit pushed" };
  } catch (error) {
    console.error("❌ Failed to push commit:", error);
    
    // Provide more specific error messages
    if (error.status === 404) {
      return { success: false, error: "Repository not found. Check if the repository exists and you have access to it." };
    }
    if (error.status === 403) {
      return { success: false, error: "Permission denied. Check if your GitHub token has write access to this repository." };
    }
    if (error.status === 401) {
      return { success: false, error: "Authentication failed. Please re-login to GitHub." };
    }
    
    return { success: false, error: error.message || "Unknown error occurred" };
  }
}