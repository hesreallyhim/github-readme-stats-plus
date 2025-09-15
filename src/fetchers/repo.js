// @ts-check
import { retryer } from "../common/retryer.js";
import { MissingParamError, request } from "../common/utils.js";

/**
 * @typedef {import('axios').AxiosRequestHeaders} AxiosRequestHeaders Axios request headers.
 * @typedef {import('axios').AxiosResponse} AxiosResponse Axios response.
 */

/**
 * Repo data fetcher.
 *
 * @param {AxiosRequestHeaders} variables Fetcher variables.
 * @param {string} token GitHub token.
 * @returns {Promise<AxiosResponse>} The response.
 */
const fetcher = (variables, token) => {
  return request(
    {
      query: `
      fragment RepoInfo on Repository {
        name
        nameWithOwner
        isPrivate
        isArchived
        isTemplate
        createdAt
        pushedAt
        stargazers {
          totalCount
        }
        issues(states: OPEN) {
          totalCount
        }
        pullRequests(states: OPEN) {
          totalCount
        }
        description
        primaryLanguage {
          color
          id
          name
        }
        forkCount
      }
      query getRepo($login: String!, $repo: String!) {
        user(login: $login) {
          repository(name: $repo) {
            ...RepoInfo
          }
        }
        organization(login: $login) {
          repository(name: $repo) {
            ...RepoInfo
          }
        }
      }
    `,
      variables,
    },
    {
      Authorization: `bearer ${token}`,
    },
  );
};

const urlExample = "/api/pin?username=USERNAME&amp;repo=REPO_NAME";

/**
 * @typedef {import("./types").RepositoryData} RepositoryData Repository data.
 */

/**
 * Fetch repository data.
 *
 * @param {string} username GitHub username.
 * @param {string} reponame GitHub repository name.
 * @returns {Promise<RepositoryData>} Repository data.
 */
const fetchRepo = async (username, reponame) => {
  if (!username && !reponame) {
    throw new MissingParamError(["username", "repo"], urlExample);
  }
  if (!username) {
    throw new MissingParamError(["username"], urlExample);
  }
  if (!reponame) {
    throw new MissingParamError(["repo"], urlExample);
  }

  let res = await retryer(fetcher, { login: username, repo: reponame });

  const data = res && res.data ? res.data.data : null;
  const userNode = data?.user ?? null;
  const orgNode = data?.organization ?? null;

  // GitHub may return an error for the organization field when the login is a user.
  // If at least one of user/organization is present, ignore org NOT_FOUND errors.
  const rawErrors = (res && res.data && res.data.errors) || [];
  const filteredErrors = rawErrors.filter((e) => {
    const msg = (e?.message || "").toLowerCase();
    const path = Array.isArray(e?.path) ? e.path.join(".") : "";
    const isOrgNotFound =
      msg.includes("could not resolve to an organization") ||
      path.startsWith("organization");
    if ((userNode || orgNode) && isOrgNotFound) {
      return false;
    }
    return true;
  });
  if (filteredErrors.length) {
    throw new Error(filteredErrors[0].message || "GitHub GraphQL error");
  }

  if (!data) {
    throw new Error("Invalid response from GitHub API");
  }

  if (!data.user && !data.organization) {
    throw new Error("Not found");
  }

  const isUser = data.organization === null && data.user;
  const isOrg = data.user === null && data.organization;

  if (isUser) {
    if (!data.user.repository || data.user.repository.isPrivate) {
      throw new Error("User Repository Not found");
    }
    const repo = data.user.repository;
    return {
      ...repo,
      starCount: repo.stargazers.totalCount,
      ...(repo.issues ? { openIssuesCount: repo.issues.totalCount } : {}),
      ...(repo.pullRequests
        ? { openPrsCount: repo.pullRequests.totalCount }
        : {}),
      ...(repo.createdAt ? { createdAt: repo.createdAt } : {}),
      ...(repo.pushedAt ? { pushedAt: repo.pushedAt } : {}),
      firstCommitDate: repo.createdAt || null,
    };
  }

  if (isOrg) {
    if (
      !data.organization.repository ||
      data.organization.repository.isPrivate
    ) {
      throw new Error("Organization Repository Not found");
    }
    const repo = data.organization.repository;
    return {
      ...repo,
      starCount: repo.stargazers.totalCount,
      ...(repo.issues ? { openIssuesCount: repo.issues.totalCount } : {}),
      ...(repo.pullRequests
        ? { openPrsCount: repo.pullRequests.totalCount }
        : {}),
      ...(repo.createdAt ? { createdAt: repo.createdAt } : {}),
      ...(repo.pushedAt ? { pushedAt: repo.pushedAt } : {}),
      firstCommitDate: repo.createdAt || null,
    };
  }

  throw new Error("Unexpected behavior");
};

export { fetchRepo };
export default fetchRepo;
