import { Octokit } from '@octokit/rest';

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;

function getOctokit(): Octokit {
    return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

export async function readFile(filePath: string): Promise<{ content: string; sha: string }> {
    const octokit = getOctokit();
    const response = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: filePath });
    const data = response.data;
    if (Array.isArray(data) || data.type !== 'file') {
        throw new Error(`${filePath} is not a file`);
    }
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return { content, sha: data.sha };
}

export async function writeFile(
    filePath: string,
    content: string,
    message: string,
    sha?: string
): Promise<void> {
    const octokit = getOctokit();
    const base64Content = Buffer.from(content, 'utf8').toString('base64');
    await octokit.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path: filePath,
        message,
        content: base64Content,
        ...(sha ? { sha } : {}),
    });
}

export async function uploadImage(
    filePath: string,
    base64Content: string,
    message: string,
    sha?: string
): Promise<void> {
    const octokit = getOctokit();
    await octokit.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path: filePath,
        message,
        content: base64Content,
        ...(sha ? { sha } : {}),
    });
}
