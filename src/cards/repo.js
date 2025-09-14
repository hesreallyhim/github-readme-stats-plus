// @ts-check
import { Card } from "../common/Card.js";
import { I18n } from "../common/I18n.js";
import { icons } from "../common/icons.js";
import {
  encodeHTML,
  flexLayout,
  getCardColors,
  kFormatter,
  measureText,
  parseEmojis,
  wrapTextMultiline,
  iconWithLabel,
  createLanguageNode,
  clampValue,
} from "../common/utils.js";
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
    show_issues = false,
    show_prs = false,
    show_age = false,
    age_metric = "pushed",
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
  const totalIssues = kFormatter(repo.openIssuesCount || 0);
  const totalPRs = kFormatter(repo.openPrsCount || 0);

  const svgIssues = show_issues
    ? iconWithLabel(icons.issues, totalIssues, "issues", ICON_SIZE)
    : "";
  const svgPRs = show_prs
    ? iconWithLabel(icons.prs, totalPRs, "prs", ICON_SIZE)
    : "";

  /**
   * Format an ISO date string into a compact relative age label.
   * @param {string | null} iso ISO 8601 timestamp to format.
   * @returns {string} Compact relative time (e.g., "2y", "3mo", "5d").
   */
  const formatAge = (iso) => {
    if (!iso) {
      return "";
    }
    const then = new Date(iso).getTime();
    const now = Date.now();
    const sec = Math.max(0, Math.floor((now - then) / 1000));
    const y = Math.floor(sec / (365 * 24 * 3600));
    if (y >= 1) {
      return `${y}y`;
    }
    const mo = Math.floor(sec / (30 * 24 * 3600));
    if (mo >= 1) {
      return `${mo}mo`;
    }
    const d = Math.floor(sec / (24 * 3600));
    if (d >= 1) {
      return `${d}d`;
    }
    const h = Math.floor(sec / 3600);
    if (h >= 1) {
      return `${h}h`;
    }
    const m = Math.floor(sec / 60);
    if (m >= 1) {
      return `${m}m`;
    }
    return `${sec}s`;
  };

  /** @type {string | null} */
  let ageIso = null;
  if (age_metric === "created") {
    ageIso = repo.createdAt || null;
  } else if (age_metric === "first") {
    ageIso = repo.firstCommitDate || null;
  } else {
    ageIso = repo.pushedAt || null;
  }
  const ageLabel = formatAge(ageIso);
  const svgAge =
    show_age && ageLabel
      ? iconWithLabel(icons.commits, ageLabel, "age", ICON_SIZE)
      : "";
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

  const starAndForkCount = flexLayout({
    items: [svgLanguage, svgStars, svgForks, svgIssues, svgPRs, svgAge],
    sizes: [
      measureText(langName, 12),
      ICON_SIZE + measureText(`${totalStars}`, 12),
      ICON_SIZE + measureText(`${totalForks}`, 12),
      totalIssues > 0 ? ICON_SIZE + measureText(`${totalIssues}`, 12) : 0,
      totalPRs > 0 ? ICON_SIZE + measureText(`${totalPRs}`, 12) : 0,
      ageLabel ? ICON_SIZE + measureText(`${ageLabel}`, 12) : 0,
    ],
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
        ? getBadgeSVG(i18n.t("repocard.template"), colors.textColor)
        : isArchived
          ? getBadgeSVG(i18n.t("repocard.archived"), colors.textColor)
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
