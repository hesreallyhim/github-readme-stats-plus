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
    hide_title = false,
    hide_text = false,
    stats_only = false,
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
    age_metric = "first",
  } = options;

  const lineHeight = 10;
  const header = show_owner ? nameWithOwner : name;
  const langName = (primaryLanguage && primaryLanguage.name) || "Unspecified";
  const langColor = (primaryLanguage && primaryLanguage.color) || "#333";
  let descriptionLinesCount = 0;
  let descriptionSvg = "";
  const shouldHideTitle = stats_only || hide_title;
  const shouldHideText = stats_only || hide_text;

  if (!shouldHideText) {
    const descriptionMaxLines = description_lines_count
      ? clampValue(description_lines_count, 1, DESCRIPTION_MAX_LINES)
      : DESCRIPTION_MAX_LINES;

    const descText = parseEmojis(description || "No description provided");
    const multiLineDescription = wrapTextMultiline(
      descText,
      DESCRIPTION_LINE_WIDTH,
      descriptionMaxLines,
    );

    descriptionLinesCount = description_lines_count
      ? descriptionMaxLines
      : multiLineDescription.length;

    descriptionSvg = multiLineDescription
      .map((line) => `<tspan dy="1.2em" x="25">${encodeHTML(line)}</tspan>`)
      .join("");
  }

  const hasDescription = !shouldHideText && descriptionLinesCount > 0;
  const descriptionHeight = hasDescription
    ? descriptionLinesCount * lineHeight
    : 0;
  let height =
    (hasDescription && descriptionLinesCount > 1 ? 120 : 110) +
    descriptionHeight;

  const compactStatsOnlyLayout = shouldHideText && shouldHideTitle;
  if (compactStatsOnlyLayout) {
    const compactPadding = 12;
    const compactRowHeight = ICON_SIZE + 8;
    height = compactPadding * 2 + compactRowHeight;
  }

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
  const issuesCount = repo.openIssuesCount || 0;
  const prsCount = repo.openPrsCount || 0;
  const totalIssues = kFormatter(issuesCount);
  const totalPRs = kFormatter(prsCount);

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

  // Single-row layout: language + stars + forks + optional issues/PRs/age.
  const rowItems = [];
  const rowSizes = [];
  if (svgLanguage) {
    rowItems.push(svgLanguage);
    rowSizes.push(measureText(langName, 12));
  }
  rowItems.push(svgStars);
  rowSizes.push(ICON_SIZE + measureText(`${totalStars}`, 12));
  rowItems.push(svgForks);
  rowSizes.push(ICON_SIZE + measureText(`${totalForks}`, 12));
  if (show_issues && issuesCount > 0) {
    rowItems.push(svgIssues);
    rowSizes.push(ICON_SIZE + measureText(`${totalIssues}`, 12));
  }
  if (show_prs && prsCount > 0) {
    rowItems.push(svgPRs);
    rowSizes.push(ICON_SIZE + measureText(`${totalPRs}`, 12));
  }
  if (show_age && ageLabel) {
    rowItems.push(svgAge);
    rowSizes.push(ICON_SIZE + measureText(`${ageLabel}`, 12));
  }
  const starAndForkCount = flexLayout({
    items: rowItems,
    sizes: rowSizes,
    gap: 16,
  }).join("");

  const cardHeight = shouldHideTitle
    ? compactStatsOnlyLayout
      ? height + 30
      : height
    : height;

  const card = new Card({
    defaultTitle: header.length > 35 ? `${header.slice(0, 35)}...` : header,
    titlePrefixIcon: icons.contribs,
    width: 400,
    height: cardHeight,
    border_radius,
    colors,
  });

  card.disableAnimations();
  card.setHideBorder(hide_border);
  card.setHideTitle(shouldHideTitle);
  if (compactStatsOnlyLayout) {
    card.paddingX = 25;
  }
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

    ${
      hasDescription
        ? `



    <text class="description" x="25" y="-5">
      ${descriptionSvg}
    </text>


    `
        : ""
    }

    <g transform="translate(${compactStatsOnlyLayout ? 20 : 30}, ${
      hasDescription ? height - 75 : compactStatsOnlyLayout ? 2.5 : 0
    })">
      ${starAndForkCount}
    </g>
  `);
};

export { renderRepoCard };
export default renderRepoCard;
