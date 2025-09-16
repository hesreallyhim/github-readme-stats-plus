import { jest } from "@jest/globals";
import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import pin from "../api/pin.js";
import { renderRepoCard } from "../src/cards/repo.js";
import { CONSTANTS, renderError } from "../src/common/utils.js";
import { expect, it, describe, afterEach } from "@jest/globals";

const data_repo = {
  repository: {
    username: "anuraghazra",
    name: "convoychat",
    stargazers: {
      totalCount: 38000,
    },
    description: "Help us take over the world! React + TS + GraphQL Chat App",
    primaryLanguage: {
      color: "#2b7489",
      id: "MDg6TGFuZ3VhZ2UyODc=",
      name: "TypeScript",
    },
    forkCount: 100,
    isTemplate: false,
  },
};

const data_repository = {
  data: {
    repository: data_repo.repository,
  },
};

const mock = new MockAdapter(axios);

afterEach(() => {
  mock.reset();
});

describe("Test /api/pin", () => {
  it("should test the request", async () => {
    const req = {
      query: {
        username: "anuraghazra",
        repo: "convoychat",
      },
    };
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, data_repository);

    await pin(req, res);

    expect(res.setHeader).toBeCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toBeCalledWith(
      renderRepoCard({
        ...data_repo.repository,
        starCount: data_repo.repository.stargazers.totalCount,
      }),
    );
  });

  it("should get the query options", async () => {
    const req = {
      query: {
        username: "anuraghazra",
        repo: "convoychat",
        title_color: "fff",
        icon_color: "fff",
        text_color: "fff",
        bg_color: "fff",
        full_name: "1",
      },
    };
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, data_repository);

    await pin(req, res);

    expect(res.setHeader).toBeCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toBeCalledWith(
      renderRepoCard(
        {
          ...data_repo.repository,
          starCount: data_repo.repository.stargazers.totalCount,
        },
        { ...req.query },
      ),
    );
  });

  it("should render error card if repo not found", async () => {
    const req = {
      query: {
        username: "anuraghazra",
        repo: "convoychat",
      },
    };
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, {
      data: { repository: null },
    });

    await pin(req, res);

    expect(res.setHeader).toBeCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toBeCalledWith(renderError("Repository Not found"));
  });

  it("should render error card if username in blacklist", async () => {
    const req = {
      query: {
        username: "renovate-bot",
        repo: "convoychat",
      },
    };
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, data_repository);

    await pin(req, res);

    expect(res.setHeader).toBeCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toBeCalledWith(
      renderError(
        "This username is blacklisted",
        "Please deploy your own instance",
        { show_repo_link: false },
      ),
    );
  });

  it("should render error card if wrong locale provided", async () => {
    const req = {
      query: {
        username: "anuraghazra",
        repo: "convoychat",
        locale: "asdf",
      },
    };
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, data_repository);

    await pin(req, res);

    expect(res.setHeader).toBeCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toBeCalledWith(
      renderError("Something went wrong", "Language not found"),
    );
  });

  it("should render error card if missing required parameters", async () => {
    const req = {
      query: {},
    };
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    await pin(req, res);

    expect(res.setHeader).toBeCalledWith("Content-Type", "image/svg+xml");
    expect(res.send).toBeCalledWith(
      renderError(
        'Missing params "username", "repo" make sure you pass the parameters in URL',
        "/api/pin?username=USERNAME&amp;repo=REPO_NAME",
      ),
    );
  });

  it("should have proper cache", async () => {
    const req = {
      query: {
        username: "anuraghazra",
        repo: "convoychat",
      },
    };
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    mock.onPost("https://api.github.com/graphql").reply(200, data_repository);

    await pin(req, res);

    expect(res.setHeader).toBeCalledWith("Content-Type", "image/svg+xml");
    expect(res.setHeader).toBeCalledWith(
      "Cache-Control",
      `max-age=${CONSTANTS.TWELVE_HOURS}, s-maxage=${CONSTANTS.TWELVE_HOURS}`,
    );
  });
});
