// @ts-check

import { Card } from "../common/Card.js";
import { getCardColors } from "../common/color.js";
import { kFormatter, wrapTextMultiline } from "../common/fmt.js";
import { encodeHTML } from "../common/html.js";
import { I18n } from "../common/I18n.js";
import { icons } from "../common/icons.js";
import { clampValue, parseEmojis } from "../common/ops.js";
import {
  flexLayout,
  measureText,
  iconWithLabel,
  createLanguageNode,
} from "../common/render.js";
import { repoCardLocales } from "../translations.js";

const ICON_SIZE = 16;
const DESCRIPTION_LINE_WIDTH = 59;
const DESCRIPTION_MAX_LINES = 3;

/**
 * Retrieves the repository description and wraps it to fit the card width.
 *
 * @param {string} label The repository description.
 * @param {string} textColor The color of the text.
 * @returns {string} Wrapped repo description SVG object.
 */
const getBadgeSVG = (label, textColor) => `
  <g data-testid="badge" class="badge" transform="translate(320, -18)">
    <rect stroke="${textColor}" stroke-width="1" width="70" height="20" x="-12" y="-14" ry="10" rx="10"></rect>
    <text
      x="23" y="-5"
      alignment-baseline="central"
      dominant-baseline="central"
      text-anchor="middle"
      fill="${textColor}"
    >
      ${label}
    </text>
  </g>
`;

/**
 * @typedef {import("../fetchers/types").RepositoryData} RepositoryData Repository data.
 * @typedef {import("./types").RepoCardOptions} RepoCardOptions Repo card options.
 */

/**
 * Renders repository card details.
 *
 * @param {RepositoryData} repo Repository data.
 * @param {Partial<RepoCardOptions>} options Card options.
 * @returns {string} Repository card SVG object.
 */
const renderRepoCard = (repo, options = {}) => {
  const {
    name,
    nameWithOwner,
    description,
    primaryLanguage,
    isArchived,
    isTemplate,
    starCount,
    forkCount,
  } = repo;
  const {
    hide_border = false,
    show_issues = false,
    show_prs = false,
    show_age = false,
    age_metric = "first",
    title_color,
    icon_color,
    text_color,
    bg_color,
    show_owner = false,
    theme = "default_repocard",
    border_radius,
    border_color,
    locale,
    description_lines_count,
  } = options;

  const lineHeight = 10;
  const header = show_owner ? nameWithOwner : name;
  const langName = (primaryLanguage && primaryLanguage.name) || "Unspecified";
  const langColor = (primaryLanguage && primaryLanguage.color) || "#333";
  const descriptionMaxLines = description_lines_count
    ? clampValue(description_lines_count, 1, DESCRIPTION_MAX_LINES)
    : DESCRIPTION_MAX_LINES;

  const desc = parseEmojis(description || "No description provided");
  const multiLineDescription = wrapTextMultiline(
    desc,
    DESCRIPTION_LINE_WIDTH,
    descriptionMaxLines,
  );
  const descriptionLinesCount = description_lines_count
    ? clampValue(description_lines_count, 1, DESCRIPTION_MAX_LINES)
    : multiLineDescription.length;

  const descriptionSvg = multiLineDescription
    .map((line) => `<tspan dy="1.2em" x="25">${encodeHTML(line)}</tspan>`)
    .join("");

  const height =
    (descriptionLinesCount > 1 ? 120 : 110) +
    descriptionLinesCount * lineHeight;

  const i18n = new I18n({
    locale,
    translations: repoCardLocales,
  });

  // returns theme based colors with proper overrides and defaults
  const colors = getCardColors({
    title_color,
    icon_color,
    text_color,
    bg_color,
    border_color,
    theme,
  });

  const svgLanguage = primaryLanguage
    ? createLanguageNode(langName, langColor)
    : "";

  const totalStars = kFormatter(starCount);
  const totalForks = kFormatter(forkCount);
  const svgStars = iconWithLabel(
    icons.star,
    totalStars,
    "stargazers",
    ICON_SIZE,
  );
  const svgForks = iconWithLabel(
    icons.fork,
    totalForks,
    "forkcount",
    ICON_SIZE,
  );

  const issuesCountRaw =
    typeof repo.openIssuesCount === "number"
      ? repo.openIssuesCount
      : repo?.issues?.totalCount;
  const prsCountRaw =
    typeof repo.openPrsCount === "number"
      ? repo.openPrsCount
      : repo?.pullRequests?.totalCount;

  const issuesCount =
    typeof issuesCountRaw === "number" ? issuesCountRaw : undefined;
  const prsCount = typeof prsCountRaw === "number" ? prsCountRaw : undefined;
  const issuesLabel =
    issuesCount !== undefined ? `${kFormatter(issuesCount)}` : null;
  const prsLabel = prsCount !== undefined ? `${kFormatter(prsCount)}` : null;

  const svgIssues =
    show_issues && issuesLabel !== null
      ? iconWithLabel(icons.issues, issuesLabel, "issues", ICON_SIZE)
      : "";
  const svgPRs =
    show_prs && prsLabel !== null
      ? iconWithLabel(icons.prs, prsLabel, "prs", ICON_SIZE)
      : "";

  const resolveAgeDate = () => {
    if (age_metric === "created") {
      return repo.createdAt;
    }
    if (age_metric === "pushed") {
      return repo.pushedAt;
    }
    return repo.firstCommitDate || repo.createdAt || repo.pushedAt;
  };

  const renderAgeBadge = () => {
    const iso = resolveAgeDate();
    if (!show_age || !iso) {
      return { svg: "", label: "" };
    }
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - then);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 365 * day;
    let label;
    if (diff >= year) {
      const years = Math.floor(diff / year);
      label = `${years}y`;
    } else if (diff >= month) {
      const months = Math.floor(diff / month);
      label = `${months}mo`;
    } else if (diff >= day) {
      const days = Math.floor(diff / day);
      label = `${days}d`;
    } else if (diff >= hour) {
      const hours = Math.floor(diff / hour);
      label = `${hours}h`;
    } else if (diff >= minute) {
      const minutes = Math.floor(diff / minute);
      label = `${minutes}m`;
    } else {
      const seconds = Math.floor(diff / 1000);
      label = `${seconds}s`;
    }
    return {
      svg: iconWithLabel(icons.commits, label, "age", ICON_SIZE),
      label,
    };
  };

  const ageBadge = renderAgeBadge();

  const statsItems = [];
  const statsSizes = [];

  if (svgLanguage) {
    statsItems.push(svgLanguage);
    statsSizes.push(measureText(langName, 12));
  }

  statsItems.push(svgStars);
  statsSizes.push(ICON_SIZE + measureText(`${totalStars}`, 12));

  statsItems.push(svgForks);
  statsSizes.push(ICON_SIZE + measureText(`${totalForks}`, 12));

  if (svgIssues && issuesLabel !== null) {
    statsItems.push(svgIssues);
    statsSizes.push(ICON_SIZE + measureText(issuesLabel, 12));
  }

  if (svgPRs && prsLabel !== null) {
    statsItems.push(svgPRs);
    statsSizes.push(ICON_SIZE + measureText(prsLabel, 12));
  }

  if (ageBadge.svg) {
    statsItems.push(ageBadge.svg);
    statsSizes.push(ICON_SIZE + measureText(ageBadge.label, 12));
  }

  const starAndForkCount = flexLayout({
    items: statsItems,
    sizes: statsSizes,
    gap: 25,
  }).join("");

  const card = new Card({
    defaultTitle: header.length > 35 ? `${header.slice(0, 35)}...` : header,
    titlePrefixIcon: icons.contribs,
    width: 400,
    height,
    border_radius,
    colors,
  });

  card.disableAnimations();
  card.setHideBorder(hide_border);
  card.setHideTitle(false);
  card.setCSS(`
    .description { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${colors.textColor} }
    .gray { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${colors.textColor} }
    .icon { fill: ${colors.iconColor} }
    .badge { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; }
    .badge rect { opacity: 0.2 }
  `);

  return card.render(`
    ${
      isTemplate
        ? // @ts-ignore
          getBadgeSVG(i18n.t("repocard.template"), colors.textColor)
        : isArchived
          ? // @ts-ignore
            getBadgeSVG(i18n.t("repocard.archived"), colors.textColor)
          : ""
    }

    <text class="description" x="25" y="-5">
      ${descriptionSvg}
    </text>

    <g transform="translate(30, ${height - 75})">
      ${starAndForkCount}
    </g>
  `);
};

export { renderRepoCard };
export default renderRepoCard;
