import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import { Octokit } from 'octokit';

type LatestReleaseResponse = RestEndpointMethodTypes['repos']['getLatestRelease']['response'];

type LatestReleaseData = RestEndpointMethodTypes['repos']['getLatestRelease']['response']['data'];

import { config } from '../../utils/workflowUtils';
const owner = 'Onebrief';
const repo = 'bc';

const octokit = new Octokit({
  auth: config.GITHUB_TOKEN,
});

async function getMergedPRs(per_page = 5): Promise<string> {
  // doTokenCheck();
  try {
    const query = 'repo:Onebrief/bc is:pr is:merged author:gnirbnelliw';
    const res = await octokit.rest.search.issuesAndPullRequests({
      q: query,
      sort: 'updated',
      order: 'desc',
      per_page,
    });

    const prs = res.data.items.map((pr: (typeof res.data.items)[number]) => ({
      title: pr.title,
      number: pr.number,
      url: pr.pull_request?.html_url,
      merge_commit_sha: pr.pull_request?.merge_commit_sha,
      labels: pr.labels?.map((l: { name: string }) => l.name),
      body: pr.body,
    }));
    // return a joined string of PR titles
    return prs.map((pr) => `#${pr.number}: ${pr.title} (${pr.url})`).join('\n');
  } catch (error) {
    console.error('Error fetching PRs:', error);
    return `❌ Error: ${(error as Error).message}`;
  }
}

export const getLatestReleaseTag = async (): Promise<LatestReleaseResponse | undefined> => {
  try {
    const response: LatestReleaseResponse = await octokit.rest.repos.getLatestRelease({
      owner,
      repo,
    });
    return response;
  } catch (error) {
    console.error('Error fetching latest release:', error);
    return undefined;
  }
};

export const getLatestReleaseInfo = async (): Promise<string> => {
  try {
    const release = await getLatestReleaseTag();
    if (undefined === release) {
      return '❌ Error: Unable to fetch latest release info.';
    }
    const tagName = release.data.tag_name;
    const releaseName = release.data.name || 'No name';
    const publishedAt = release.data.published_at;
    return `Latest Release: ${releaseName} (${tagName}) published at ${publishedAt}`;
  } catch (error) {
    console.error('Error fetching latest release info:', error);
    return `❌ Error: ${(error as Error).message}`;
  }
};

export const getLastNPRs = async (n: number): Promise<string> => {
  const prs = await getMergedPRs(n > 5 ? 5 : n);
  return prs;
};
