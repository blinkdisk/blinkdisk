const GITHUB_REPO = "blinkdisk/blinkdisk";

export async function getLatestReleaseVersion(): Promise<string> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
      },
    );

    if (!response.ok)
      throw new Error(
        `GitHub API returned ${response.status} ${response.statusText}`,
      );

    const data = (await response.json()) as { tag_name: string };
    return data.tag_name;
  } catch (error) {
    console.warn("Failed to fetch latest GitHub release version:", error);
    return "v1.0";
  }
}
