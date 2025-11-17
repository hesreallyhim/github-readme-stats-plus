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
 * Generates animation styles and SVG elements for different effects.
 *
 * @param {string} style Animation style: bubbles, embers, radiant, circuit, sparks.
 * @param {object} colors Card colors for theming animations.
 * @param {number} width Card width.
 * @param {number} height Card height.
 * @returns {{css: string, svg: string}} Animation CSS and SVG elements.
 */
const getAnimationStyle = (style, colors, width, height) => {
  if (!style || style === "none") {
    return { css: "", svg: "" };
  }

  const iconColor = colors.iconColor || "38bdf8";
  const titleColor = colors.titleColor || "00d9ff";

  switch (style) {
    case "bubbles": {
      // Fishtank-style floating bubbles
      const bubbles = Array.from({ length: 8 }, (_, i) => {
        const x = (width * (i + 1)) / 9;
        const size = 3 + (i % 3) * 2;
        const delay = i * 0.4;
        const duration = 3 + (i % 3);
        return `
          <circle
            class="bubble bubble-${i}"
            cx="${x}"
            cy="${height}"
            r="${size}"
            fill="${iconColor}"
            opacity="0.3"
            style="animation-delay: ${delay}s; animation-duration: ${duration}s;"
          />`;
      }).join("");

      const css = `
        @keyframes bubbleFloat {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-${height + 20}px) scale(0.5); opacity: 0; }
        }
        .bubble {
          animation: bubbleFloat 3s infinite ease-in-out;
        }`;

      return { css, svg: `<g class="animation-layer">${bubbles}</g>` };
    }

    case "embers": {
      // Glowing particles like burning embers
      const embers = Array.from({ length: 12 }, (_, i) => {
        const x = 10 + Math.random() * (width - 20);
        const y = height * 0.2 + Math.random() * (height * 0.6);
        const size = 1.5 + Math.random() * 2;
        const delay = i * 0.3;
        return `
          <circle
            class="ember ember-${i}"
            cx="${x}"
            cy="${y}"
            r="${size}"
            fill="${titleColor}"
            style="animation-delay: ${delay}s;"
          />`;
      }).join("");

      const css = `
        @keyframes emberGlow {
          0%, 100% { opacity: 0.2; filter: blur(0px); }
          25% { opacity: 0.8; filter: blur(1px); }
          50% { opacity: 0.4; filter: blur(0.5px); }
          75% { opacity: 0.9; filter: blur(1.5px); }
        }
        @keyframes emberFloat {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(3px, -5px); }
          66% { transform: translate(-3px, 5px); }
        }
        .ember {
          animation: emberGlow 2s infinite ease-in-out, emberFloat 4s infinite ease-in-out;
        }`;

      return { css, svg: `<g class="animation-layer">${embers}</g>` };
    }

    case "radiant": {
      // Radiant sun with pulsing rays
      const rays = Array.from({ length: 16 }, (_, i) => {
        const angle = (i * 360) / 16;
        const length = 80;
        const x1 = width / 2;
        const y1 = height / 2;
        const x2 = x1 + Math.cos((angle * Math.PI) / 180) * length;
        const y2 = y1 + Math.sin((angle * Math.PI) / 180) * length;
        const delay = i * 0.05;
        return `
          <line
            class="ray ray-${i}"
            x1="${x1}"
            y1="${y1}"
            x2="${x2}"
            y2="${y2}"
            stroke="${iconColor}"
            stroke-width="1.5"
            opacity="0.2"
            style="animation-delay: ${delay}s;"
          />`;
      }).join("");

      const core = `
        <circle
          class="radiant-core"
          cx="${width / 2}"
          cy="${height / 2}"
          r="8"
          fill="${titleColor}"
          opacity="0.3"
        />`;

      const css = `
        @keyframes rayPulse {
          0%, 100% { opacity: 0.1; stroke-width: 1; }
          50% { opacity: 0.4; stroke-width: 2; }
        }
        @keyframes corePulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .ray {
          animation: rayPulse 2s infinite ease-in-out;
          transform-origin: ${width / 2}px ${height / 2}px;
        }
        .radiant-core {
          animation: corePulse 2s infinite ease-in-out;
          transform-origin: ${width / 2}px ${height / 2}px;
        }`;

      return { css, svg: `<g class="animation-layer">${rays}${core}</g>` };
    }

    case "circuit": {
      // Elements traveling around the edges like circuit paths
      const dotCount = 6;
      const dots = Array.from({ length: dotCount }, (_, i) => {
        const delay = i * 0.8;
        return `
          <circle
            class="circuit-dot circuit-dot-${i}"
            r="3"
            fill="${titleColor}"
            opacity="0.6"
            style="animation-delay: ${delay}s;"
          >
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              path="M 5,5 L ${width - 5},5 L ${width - 5},${height - 5} L 5,${height - 5} Z"
              begin="${delay}s"
            />
          </circle>`;
      }).join("");

      // Glowing trail effect
      const trail = `
        <rect
          class="circuit-glow-top"
          x="5"
          y="5"
          width="${width - 10}"
          height="1"
          fill="${iconColor}"
          opacity="0.2"
        />
        <rect
          class="circuit-glow-right"
          x="${width - 6}"
          y="5"
          width="1"
          height="${height - 10}"
          fill="${iconColor}"
          opacity="0.2"
        />
        <rect
          class="circuit-glow-bottom"
          x="5"
          y="${height - 6}"
          width="${width - 10}"
          height="1"
          fill="${iconColor}"
          opacity="0.2"
        />
        <rect
          class="circuit-glow-left"
          x="5"
          y="5"
          width="1"
          height="${height - 10}"
          fill="${iconColor}"
          opacity="0.2"
        />`;

      const css = `
        @keyframes circuitGlow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }
        .circuit-dot {
          filter: drop-shadow(0 0 2px ${titleColor});
        }
        [class^="circuit-glow-"] {
          animation: circuitGlow 2s infinite ease-in-out;
        }`;

      return { css, svg: `<g class="animation-layer">${trail}${dots}</g>` };
    }

    case "sparks": {
      // Electric sparks appearing randomly
      const sparks = Array.from({ length: 10 }, (_, i) => {
        const x = 20 + Math.random() * (width - 40);
        const y = 20 + Math.random() * (height - 40);
        const delay = i * 0.5;
        const rotation = Math.random() * 360;
        return `
          <g class="spark spark-${i}" transform="translate(${x}, ${y}) rotate(${rotation})" style="animation-delay: ${delay}s;">
            <line x1="-6" y1="0" x2="6" y2="0" stroke="${titleColor}" stroke-width="2" opacity="0.8" />
            <line x1="0" y1="-6" x2="0" y2="6" stroke="${titleColor}" stroke-width="2" opacity="0.8" />
            <line x1="-4" y1="-4" x2="4" y2="4" stroke="${iconColor}" stroke-width="1.5" opacity="0.6" />
            <line x1="-4" y1="4" x2="4" y2="-4" stroke="${iconColor}" stroke-width="1.5" opacity="0.6" />
          </g>`;
      }).join("");

      const css = `
        @keyframes sparkFlash {
          0%, 90%, 100% { opacity: 0; transform: scale(0); }
          5% { opacity: 1; transform: scale(1.2); }
          10% { opacity: 0.8; transform: scale(0.9); }
          15% { opacity: 0; transform: scale(0.6); }
        }
        .spark {
          animation: sparkFlash 5s infinite ease-in-out;
          transform-origin: center;
        }`;

      return { css, svg: `<g class="animation-layer">${sparks}</g>` };
    }

    default:
      return { css: "", svg: "" };
  }
};

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
    animation_style = "none",
    disable_animations = false,
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

  // Get animation styles if enabled
  const hasAnimation = !disable_animations && animation_style !== "none";
  const animationData = hasAnimation
    ? getAnimationStyle(animation_style, colors, 400, cardHeight)
    : { css: "", svg: "" };

  if (disable_animations) {
    card.disableAnimations();
  }
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
    ${animationData.css}
  `);

  return card.render(`
    ${animationData.svg}

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
