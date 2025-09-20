import { renderRepoCard } from "../src/cards/repo.js";
import { blacklist } from "../src/common/blacklist.js";
import { whitelist } from "../src/common/whitelist.js";
import {
  clampValue,
  CONSTANTS,
  parseBoolean,
  renderError,
} from "../src/common/utils.js";
import { fetchRepo } from "../src/fetchers/repo.js";
import { isLocaleAvailable } from "../src/translations.js";

export default async (req, res) => {
  const {
    username,
    repo,
    hide_border,
    hide_title,
    hide_text,
    stats_only,
    title_color,
    icon_color,
    text_color,
    bg_color,
    theme,
    show_owner,
    cache_seconds,
    locale,
    border_radius,
    border_color,
    description_lines_count,
    show_issues,
    show_prs,
    show_age,
    age_metric,
  } = req.query;

  res.setHeader("Content-Type", "image/svg+xml");

  if (whitelist && !whitelist.includes(username)) {
    return res.send(
      renderError(
        "This username is not whitelisted",
        "Please deploy your own instance",
        {
          title_color,
          text_color,
          bg_color,
          border_color,
          theme,
          show_repo_link: false,
        },
      ),
    );
  }

  if (whitelist === undefined && blacklist.includes(username)) {
    return res.send(
      renderError(
        "This username is blacklisted",
        "Please deploy your own instance",
        {
          title_color,
          text_color,
          bg_color,
          border_color,
          theme,
          show_repo_link: false,
        },
      ),
    );
  }

  if (locale && !isLocaleAvailable(locale)) {
    return res.send(
      renderError("Something went wrong", "Language not found", {
        title_color,
        text_color,
        bg_color,
        border_color,
        theme,
      }),
    );
  }

  try {
    const repoData = await fetchRepo(username, repo);

    let cacheSeconds = clampValue(
      parseInt(cache_seconds || CONSTANTS.TWELVE_HOURS, 10),
      CONSTANTS.FIVE_MINUTES,
      CONSTANTS.TWELVE_HOURS,
    );
    cacheSeconds = process.env.CACHE_SECONDS
      ? parseInt(process.env.CACHE_SECONDS, 10) || cacheSeconds
      : cacheSeconds;

    res.setHeader(
      "Cache-Control",
      `max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`,
    );

    const parsedStatsOnly = parseBoolean(stats_only);
    const statsOnly = parsedStatsOnly === true;

    return res.send(
      renderRepoCard(repoData, {
        hide_border: parseBoolean(hide_border),
        hide_title: statsOnly ? true : parseBoolean(hide_title),
        hide_text: statsOnly ? true : parseBoolean(hide_text),
        stats_only: statsOnly,
        title_color,
        icon_color,
        text_color,
        bg_color,
        theme,
        border_radius,
        border_color,
        show_owner: parseBoolean(show_owner),
        locale: locale ? locale.toLowerCase() : null,
        description_lines_count,
        show_issues: parseBoolean(show_issues),
        show_prs: parseBoolean(show_prs),
        show_age: parseBoolean(show_age),
        age_metric: age_metric || "first",
      }),
    );
  } catch (err) {
    res.setHeader(
      "Cache-Control",
      `max-age=${CONSTANTS.ERROR_CACHE_SECONDS / 2}, s-maxage=${
        CONSTANTS.ERROR_CACHE_SECONDS
      }, stale-while-revalidate=${CONSTANTS.ONE_DAY}`,
    ); // Use lower cache period for errors.
    return res.send(
      renderError(err.message, err.secondaryMessage, {
        title_color,
        text_color,
        bg_color,
        border_color,
        theme,
      }),
    );
  }
};
