# Changelog

## Unreleased
- feat(fetch): switch to `repository(owner,name)` GraphQL query in `src/fetchers/repo.js` to support organization owners (e.g., `langchain-ai/langchain`).
- fix(pin): resolves "Could not resolve to a User" error for org logins by removing `user/organization` branching.
- test: update `tests/fetchRepo.test.js` mocks for new response shape and unify missing/private repo error to "Repository Not found".
