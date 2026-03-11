package finalproject.backend.service;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.Margin;
import com.microsoft.playwright.options.WaitUntilState;
import finalproject.backend.modal.Chapter;
import finalproject.backend.modal.CodeSnippet;
import finalproject.backend.modal.Course;
import finalproject.backend.modal.Lesson;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;

@Slf4j
@Service
public class CoursePdfGeneratorService {

    // ── CDN base ─────────────────────────────────────────────────────────
    private static final String PRISM_CDN =
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0";

    // ── GFG Green palette ────────────────────────────────────────────────
    private static final String G_PRIMARY = "#2f8d46";
    private static final String G_DEEP    = "#1e6b33";
    private static final String G_LIGHT   = "#f0fdf4";
    private static final String G_MUTED   = "rgba(47,141,70,0.12)";
    private static final String G_BORDER  = "rgba(47,141,70,0.25)";

    // ── Language accent colours ──────────────────────────────────────────
    private static String langAccent(String lang) {
        if (lang == null) return G_PRIMARY;
        return switch (lang.toUpperCase()) {
            case "HTML"                         -> "#e44d26";
            case "CSS"                          -> "#268fe4";
            case "JS", "JAVASCRIPT"             -> "#f0a500";
            case "TS", "TYPESCRIPT"             -> "#3178c6";
            case "JAVA", "SPRING", "SPRINGBOOT" -> "#5382a1";
            case "PYTHON"                       -> "#3572a5";
            case "SQL"                          -> "#e38c00";
            case "BASH", "SH", "SHELL"          -> "#4caf50";
            case "JSON"                         -> "#cbcb41";
            case "XML"                          -> "#f1672d";
            case "KOTLIN"                       -> "#a97bff";
            case "DART"                         -> "#00b4ab";
            case "PHP"                          -> "#8993be";
            case "C", "CPP", "C++"             -> "#607d8b";
            case "SWIFT"                        -> "#f05138";
            case "GO"                           -> "#00acd7";
            case "RUST"                         -> "#dea584";
            default                             -> G_PRIMARY;
        };
    }

    private static String prismLang(String lang) {
        if (lang == null) return "markup";
        return switch (lang.toUpperCase()) {
            case "HTML", "XML"                  -> "markup";
            case "CSS"                          -> "css";
            case "JS", "JAVASCRIPT"             -> "javascript";
            case "TS", "TYPESCRIPT"             -> "typescript";
            case "JAVA", "SPRING", "SPRINGBOOT" -> "java";
            case "PYTHON"                       -> "python";
            case "SQL"                          -> "sql";
            case "BASH", "SH", "SHELL"          -> "bash";
            case "JSON"                         -> "json";
            case "KOTLIN"                       -> "kotlin";
            case "DART"                         -> "dart";
            case "PHP"                          -> "php";
            case "C"                            -> "c";
            case "CPP", "C++"                  -> "cpp";
            case "SWIFT"                        -> "swift";
            case "GO"                           -> "go";
            case "RUST"                         -> "rust";
            case "YAML", "YML"                  -> "yaml";
            case "DOCKERFILE"                   -> "docker";
            default                             -> "clike";
        };
    }

    // ═══════════════════════════════════════════════════════════════════
    //  PUBLIC generate()
    // ═══════════════════════════════════════════════════════════════════

    public byte[] generate(Course course) {
        log.info("🖨️  Generating PDF — course='{}'", course.getSlug());
        try (Playwright playwright = Playwright.create()) {
            Browser browser = playwright.chromium().launch(
                    new BrowserType.LaunchOptions().setHeadless(true));
            Page page = browser.newContext().newPage();

            page.setContent(buildHtml(course),
                    new Page.SetContentOptions()
                            .setWaitUntil(WaitUntilState.NETWORKIDLE));

            page.waitForFunction(
                    "() => typeof Prism !== 'undefined' && " +
                            "document.querySelectorAll('pre').length >= 0"
            );
            page.waitForTimeout(600);

            byte[] pdf = page.pdf(new Page.PdfOptions()
                    .setFormat("A4")
                    .setPrintBackground(true)
                    .setMargin(new Margin()
                            .setTop("0mm").setBottom("0mm")
                            .setLeft("0mm").setRight("0mm")));

            log.info("✅ PDF generated — course='{}'", course.getSlug());
            return pdf;
        } catch (Exception e) {
            log.error("❌ PDF failed — courseId={}: {}", course.getId(), e.getMessage(), e);
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  HTML BUILDER
    // ═══════════════════════════════════════════════════════════════════

    private String buildHtml(Course course) {
        String level      = course.getLevel()      != null ? course.getLevel().toString() : "—";
        String lang       = course.getLanguage()   != null ? course.getLanguage()          : "Khmer";
        boolean isFree    = Boolean.TRUE.equals(course.getIsFree());
        String instructor = course.getInstructor() != null
                ? course.getInstructor().getUsername() : "GrowCodeKH";
        String date       = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        int lessons       = course.getTotalLessons() != null ? course.getTotalLessons() : 0;

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n<html lang=\"km\">\n<head>\n")
                .append("<meta charset=\"UTF-8\">\n")
                .append("<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n")
                .append("<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n")
                .append("<link href=\"https://fonts.googleapis.com/css2?")
                .append("family=Noto+Serif+Khmer:wght@300;400;600;700")
                .append("&family=Inter:wght@300;400;500;600;700;800;900")
                .append("&family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400")
                .append("&display=swap\" rel=\"stylesheet\">\n")
                // ── Prism Tomorrow theme (light base, overridden below) ──
                .append("<link rel=\"stylesheet\" href=\"")
                .append(PRISM_CDN).append("/themes/prism-tomorrow.min.css\">\n")
                .append("<style>\n").append(css()).append("</style>\n</head>\n<body>\n");

        html.append(coverPage(course, level, lang, isFree, instructor, date, lessons));
        html.append(tocPage(course));

        int ci = 0;
        for (Chapter ch : course.getChapters())
            html.append(chapterPage(ch, ++ci));

        // ── Prism.js scripts ──────────────────────────────────────────
        html.append("\n<script src=\"").append(PRISM_CDN).append("/prism.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-typescript.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-java.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-python.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-sql.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-bash.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-json.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-kotlin.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-dart.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-php.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-c.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-cpp.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-swift.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-go.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-rust.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-yaml.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-docker.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-graphql.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-regex.min.js\"></script>\n")
                .append("<script>if(typeof Prism !== 'undefined') Prism.highlightAll();</script>\n")
                .append("</body>\n</html>");

        return html.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  COVER PAGE
    // ═══════════════════════════════════════════════════════════════════

    private String coverPage(Course course, String level, String lang,
                             boolean isFree, String instructor, String date, int lessons) {
        String accessColor = isFree ? "#10b981" : "#f59e0b";
        String accessBg    = isFree ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)";
        String access      = isFree ? "FREE"    : "PREMIUM";
        String desc        = course.getDescription() != null ? course.getDescription() : "";
        int    chCount     = course.getChapters() != null ? course.getChapters().size() : 0;

        return """
            <div class="page cover">
              <div class="cv-stripe-top"></div>
              <div class="cv-stripe-left"></div>
              <div class="cv-glow-tr"></div>
              <div class="cv-glow-bl"></div>

              <div class="cv-brand">
                <span class="cv-brand-dot"></span>
                GrowCodeKH &nbsp;·&nbsp; growcodekh.site
              </div>

              <div class="cv-hero">
                <div class="cv-tag">COURSE DOCUMENTATION</div>
                <h1 class="cv-title">%s</h1>
                <div class="cv-rule"></div>
                <p class="cv-desc">%s</p>
              </div>

              <div class="cv-stats">
                <div class="cv-stat">
                  <div class="cv-stat-icon">📊</div>
                  <div class="cv-stat-info">
                    <div class="cv-stat-lbl">Level</div>
                    <div class="cv-stat-val">%s</div>
                  </div>
                </div>
                <div class="cv-stat-div"></div>
                <div class="cv-stat">
                  <div class="cv-stat-icon">🌐</div>
                  <div class="cv-stat-info">
                    <div class="cv-stat-lbl">Language</div>
                    <div class="cv-stat-val">%s</div>
                  </div>
                </div>
                <div class="cv-stat-div"></div>
                <div class="cv-stat">
                  <div class="cv-stat-icon">📚</div>
                  <div class="cv-stat-info">
                    <div class="cv-stat-lbl">Lessons</div>
                    <div class="cv-stat-val">%d</div>
                  </div>
                </div>
                <div class="cv-stat-div"></div>
                <div class="cv-stat">
                  <div class="cv-stat-icon">📂</div>
                  <div class="cv-stat-info">
                    <div class="cv-stat-lbl">Chapters</div>
                    <div class="cv-stat-val">%d</div>
                  </div>
                </div>
                <div class="cv-stat-div"></div>
                <div class="cv-stat">
                  <div class="cv-stat-icon">🔑</div>
                  <div class="cv-stat-info">
                    <div class="cv-stat-lbl">Access</div>
                    <div class="cv-stat-val" style="color:%s;background:%s;padding:2px 8px;border-radius:4px;font-size:9pt;">%s</div>
                  </div>
                </div>
              </div>

              <div class="cv-meta">
                <div class="cv-meta-row">
                  <span class="cv-meta-icon">👨‍🏫</span>
                  <span class="cv-meta-key">Instructor</span>
                  <span class="cv-meta-sep">·</span>
                  <span class="cv-meta-val">%s</span>
                </div>
                <div class="cv-meta-row">
                  <span class="cv-meta-icon">📅</span>
                  <span class="cv-meta-key">Generated</span>
                  <span class="cv-meta-sep">·</span>
                  <span class="cv-meta-val">%s</span>
                </div>
                <div class="cv-meta-row">
                  <span class="cv-meta-icon">🌍</span>
                  <span class="cv-meta-key">Platform</span>
                  <span class="cv-meta-sep">·</span>
                  <span class="cv-meta-val" style="color:#2f8d46;">growcodekh.site</span>
                </div>
              </div>

              <div class="cv-footer">
                <span>© %d GrowCodeKH — All rights reserved</span>
                <span style="color:#2f8d46;font-weight:700;">growcodekh.site</span>
              </div>
            </div>
            """.formatted(
                esc(course.getTitle()), esc(desc),
                esc(level), esc(lang), lessons, chCount,
                accessColor, accessBg, access,
                esc(instructor), esc(date),
                LocalDate.now().getYear());
    }

    // ═══════════════════════════════════════════════════════════════════
    //  TABLE OF CONTENTS
    // ═══════════════════════════════════════════════════════════════════

    private String tocPage(Course course) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            <div class="page inner-page">
              <div class="pg-header">
                <span class="pg-site">growcodekh.site</span>
                <span class="pg-title">%s</span>
              </div>
              <div class="toc-eyebrow">TABLE OF CONTENTS</div>
              <div class="toc-heading">តារាងមាតិកា <span class="toc-heading-sub">/ Table of Contents</span></div>
              <div class="toc-rule"></div>
            """.formatted(esc(course.getTitle())));

        int ci = 0;
        for (Chapter ch : course.getChapters()) {
            ci++;
            sb.append("""
                <div class="toc-chapter">
                  <div class="toc-ch-num">%d</div>
                  <div class="toc-ch-body">
                    <div class="toc-ch-title">%s</div>
                    <div class="toc-ch-count">%d lessons</div>
                  </div>
                </div>
                """.formatted(ci, esc(ch.getTitle()), ch.getLessons().size()));

            int li = 0;
            for (Lesson ls : ch.getLessons()) {
                li++;
                String altBg = (li % 2 == 0) ? " style=\"background:rgba(47,141,70,0.035);\"" : "";
                sb.append("<div class=\"toc-lesson\"%s>".formatted(altBg))
                        .append("<span class=\"toc-ls-num\">%d.%d</span>".formatted(ci, li))
                        .append("<span class=\"toc-ls-title\">%s</span>".formatted(esc(ls.getTitle())))
                        .append("<span class=\"toc-ls-dots\"></span>")
                        .append("</div>\n");
            }
        }

        sb.append("""
              <div class="pg-footer">
                <span class="pf-brand">© GrowCodeKH</span>
                <span class="pg-num">— 2 —</span>
                <span class="pf-site">growcodekh.site</span>
              </div>
            </div>
            """);
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CHAPTER PAGE
    // ═══════════════════════════════════════════════════════════════════

    private String chapterPage(Chapter chapter, int ci) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            <div class="page inner-page">
              <div class="pg-header">
                <span class="pg-site">growcodekh.site</span>
                <span class="pg-title">Chapter %d · %s</span>
              </div>
              <div class="ch-banner">
                <div class="ch-badge">
                  <div class="ch-badge-label">ជំពូក</div>
                  <div class="ch-badge-num">%02d</div>
                </div>
                <div class="ch-banner-body">
                  <div class="ch-banner-eyebrow">CHAPTER %d</div>
                  <div class="ch-banner-title">%s</div>
                </div>
                <div class="ch-banner-deco"></div>
              </div>
            """.formatted(ci, esc(chapter.getTitle()), ci, ci, esc(chapter.getTitle())));

        if (chapter.getDescription() != null && !chapter.getDescription().isBlank())
            sb.append("<p class=\"ch-desc\">").append(esc(chapter.getDescription())).append("</p>\n");

        int li = 0;
        for (Lesson lesson : chapter.getLessons())
            sb.append(lessonSection(lesson, ci, ++li));

        sb.append("""
              <div class="pg-footer">
                <span class="pf-brand">© GrowCodeKH</span>
                <span class="pg-num">— %d —</span>
                <span class="pf-site">growcodekh.site</span>
              </div>
            </div>
            """.formatted(ci + 2));
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  LESSON SECTION
    // ═══════════════════════════════════════════════════════════════════

    private String lessonSection(Lesson lesson, int ci, int li) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            <div class="lesson">
              <div class="ls-header">
                <div class="ls-num">%d.%d</div>
                <div class="ls-title">%s</div>
              </div>
            """.formatted(ci, li, esc(lesson.getTitle())));

        if (lesson.getContent() != null && !lesson.getContent().isBlank())
            sb.append("<div class=\"ls-body\">")
                    .append(renderContent(lesson.getContent()))
                    .append("</div>\n");

        for (CodeSnippet cs : lesson.getCodeSnippets())
            sb.append(snippetHtml(cs));

        sb.append("<hr class=\"h-rule\">\n</div>\n");
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CONTENT RENDERER
    // ═══════════════════════════════════════════════════════════════════

    private String renderContent(String raw) {
        StringBuilder sb = new StringBuilder();
        for (String block : raw.split("\n\n")) {
            if (block.isBlank()) continue;
            String b = stripHtml(block).trim();
            if (b.isEmpty()) continue;

            String[] lines = b.split("\n");
            boolean isList = Arrays.stream(lines).anyMatch(this::isBulletLine);

            if (isList) {
                sb.append("<ul>\n");
                for (String line : lines)
                    if (!line.isBlank())
                        sb.append("<li>").append(inlineHtml(normaliseBullet(line.trim()))).append("</li>\n");
                sb.append("</ul>\n");
            } else {
                StringBuilder para = new StringBuilder();
                for (String line : lines) {
                    String t = line.trim();
                    if (t.isEmpty()) continue;
                    if (para.length() > 0) para.append(" ");
                    para.append(t);
                }
                if (para.length() > 0)
                    sb.append("<p>").append(inlineHtml(para.toString())).append("</p>\n");
            }
        }
        return sb.toString();
    }

    private String inlineHtml(String line) {
        if (!line.contains("**")) return esc(line);
        String[] parts = line.split("\\*\\*");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].isEmpty()) continue;
            sb.append(i % 2 == 1
                    ? "<strong>" + esc(parts[i]) + "</strong>"
                    : esc(parts[i]));
        }
        return sb.toString();
    }

    private boolean isBulletLine(String line) {
        String t = line.trim();
        return t.startsWith("•")  || t.startsWith("✅") || t.startsWith("▸")
                || t.startsWith("- ") || t.startsWith("* ") || t.startsWith("→")
                || t.matches("^\\d+[.)].+")
                || t.matches("^[①-⑩].+");
    }

    private String normaliseBullet(String line) {
        if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• "))
            return line.substring(2);
        return line;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CODE SNIPPET  ── GFG light-blue style (matches screenshot)
    // ═══════════════════════════════════════════════════════════════════

    private String snippetHtml(CodeSnippet cs) {
        String rawLang = cs.getLanguage() != null ? cs.getLanguage().toUpperCase() : "CODE";
        String pLang   = prismLang(cs.getLanguage());
        String accent  = langAccent(cs.getLanguage());
        String title   = (cs.getTitle() != null && !cs.getTitle().isBlank())
                ? cs.getTitle() : "ឧទាហរណ៍ / Example";
        String codeEsc = esc(cs.getCode() != null ? cs.getCode() : "");

        StringBuilder sb = new StringBuilder();

        // GFG-style wrapper
        sb.append("<div class=\"snippet\">\n");

        // Top bar: language pill left · title center · action icons right
        sb.append("""
            <div class="sn-topbar">
              <span class="sn-lang-pill" style="color:%s;border-color:%s55;">%s</span>
              <span class="sn-topbar-title">%s</span>
              <span class="sn-actions">
                <span class="sn-act sn-act-close">✕</span>
                <span class="sn-act sn-act-run">▷</span>
                <span class="sn-act sn-act-copy">⎘</span>
              </span>
            </div>
            """.formatted(accent, accent, rawLang, esc(title)));

        // Code body — light blue-gray background
        sb.append("<div class=\"sn-body\">\n")
                .append("<pre><code class=\"language-").append(pLang).append("\">")
                .append(codeEsc)
                .append("</code></pre>\n")
                .append("</div>\n");

        sb.append("</div>\n");

        // Explanation / output below block
        if (cs.getExplanation() != null && !cs.getExplanation().isBlank()) {
            String expl = cs.getExplanation().trim();
            if (expl.toLowerCase().startsWith("output:")
                    || expl.toLowerCase().startsWith("output :")) {
                String out = expl.replaceFirst("(?i)output\\s*:\\s*", "");
                sb.append("""
                    <div class="out-block">
                      <div class="out-lbl">▶&nbsp; Output</div>
                      <div class="out-body">%s</div>
                    </div>
                    """.formatted(esc(out)));
            } else {
                sb.append("""
                    <div class="note-block">
                      <span class="note-icon">💡</span>
                      <span class="note-text">%s</span>
                    </div>
                    """.formatted(esc(expl)));
            }
        }
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CSS  ── Light page + Darcula code blocks
    // ═══════════════════════════════════════════════════════════════════

    private String css() {
        return """
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

            body {
              font-family: 'Noto Serif Khmer', 'Inter', sans-serif;
              font-size: 11pt; color: #1e293b;
              background: #f8f9fa;
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }
            @page { size: A4; margin: 0; }

            /* ─────── Layout ─────── */
            .page { width: 210mm; min-height: 297mm; page-break-after: always; overflow: hidden; display: flex; flex-direction: column; }
            .page:last-child { page-break-after: avoid; }

            /* ════════════════════════════════════════════
               COVER PAGE
            ════════════════════════════════════════════ */
            .cover {
              background: #07100f;
              color: #f0fdf4;
              padding: 48px 56px;
              position: relative;
            }
            .cv-stripe-top {
              position: absolute; top: 0; left: 0; right: 0; height: 6px;
              background: linear-gradient(90deg, #2f8d46 0%, #059669 50%, #10b981 100%);
            }
            .cv-stripe-left {
              position: absolute; top: 0; left: 0; bottom: 0; width: 4px;
              background: linear-gradient(180deg, #2f8d46, #059669 60%, transparent);
            }
            .cv-glow-tr {
              position: absolute; top: -100px; right: -60px;
              width: 380px; height: 380px; border-radius: 50%;
              background: radial-gradient(circle, rgba(47,141,70,.18) 0%, transparent 68%);
              pointer-events: none;
            }
            .cv-glow-bl {
              position: absolute; bottom: 20px; left: 40px;
              width: 220px; height: 220px; border-radius: 50%;
              background: radial-gradient(circle, rgba(5,150,105,.10) 0%, transparent 68%);
              pointer-events: none;
            }
            .cv-brand {
              font-family: 'Inter', sans-serif; font-size: 8pt; font-weight: 700;
              color: #2f8d46; letter-spacing: .12em; text-transform: uppercase;
              display: flex; align-items: center; gap: 8px; margin-bottom: 52px;
            }
            .cv-brand-dot { display: inline-block; width: 8px; height: 8px; background: #2f8d46; border-radius: 50%; }
            .cv-hero    { margin-bottom: 40px; }
            .cv-tag {
              display: inline-block;
              font-family: 'Inter', sans-serif; font-size: 7.5pt; font-weight: 700;
              color: #2f8d46; letter-spacing: .12em;
              border: 1px solid rgba(47,141,70,.40);
              padding: 3px 12px; border-radius: 3px; margin-bottom: 14px;
            }
            .cv-title { font-size: 28pt; font-weight: 800; line-height: 1.5; color: #f0fdf4; margin-bottom: 16px; }
            .cv-rule { width: 56px; height: 4px; background: linear-gradient(90deg, #2f8d46, #10b981); border-radius: 2px; margin-bottom: 18px; }
            .cv-desc { font-size: 10.5pt; color: #6ee7b7; line-height: 2.15; max-width: 88%; }
            .cv-stats {
              display: flex; align-items: stretch; gap: 0;
              background: rgba(255,255,255,.04); border: 1px solid rgba(47,141,70,.22);
              border-radius: 8px; overflow: hidden; margin-bottom: 24px;
            }
            .cv-stat { flex: 1; padding: 14px 16px; display: flex; align-items: center; gap: 10px; }
            .cv-stat-div { width: 1px; background: rgba(47,141,70,.20); flex-shrink: 0; }
            .cv-stat-icon { font-size: 15pt; line-height: 1; }
            .cv-stat-info { display: flex; flex-direction: column; gap: 2px; }
            .cv-stat-lbl { font-family: 'Inter', sans-serif; font-size: 7pt; font-weight: 700; color: #6b7280; letter-spacing: .08em; text-transform: uppercase; }
            .cv-stat-val { font-family: 'Inter', sans-serif; font-size: 10.5pt; font-weight: 700; color: #ecfdf5; }
            .cv-meta {
              background: rgba(47,141,70,.08); border-left: 4px solid #2f8d46;
              border-radius: 0 6px 6px 0; padding: 14px 18px;
              display: flex; flex-direction: column; gap: 0; margin-bottom: auto;
            }
            .cv-meta-row { display: flex; align-items: center; gap: 8px; font-size: 9.5pt; color: #a7f3d0; line-height: 2.4; font-family: 'Inter', sans-serif; }
            .cv-meta-icon { font-size: 10pt; }
            .cv-meta-key { font-weight: 600; color: #6ee7b7; min-width: 90px; }
            .cv-meta-sep { color: #2f8d46; font-weight: 700; }
            .cv-meta-val { color: #ecfdf5; }
            .cv-footer {
              margin-top: 32px; display: flex; justify-content: space-between; align-items: center;
              font-family: 'Inter', sans-serif; font-size: 8pt; color: #374151;
              border-top: 1px solid rgba(47,141,70,.18); padding-top: 16px;
            }

            /* ════════════════════════════════════════════
               INNER PAGE  ── light background
            ════════════════════════════════════════════ */
            .inner-page { padding: 40px 52px; flex: 1; background: #ffffff; }

            .pg-header {
              font-family: 'Inter', sans-serif; font-size: 8pt;
              display: flex; justify-content: space-between; align-items: center;
              border-bottom: 2px solid #2f8d46;
              padding-bottom: 8px; margin-bottom: 24px;
            }
            .pg-site  { font-weight: 800; color: #2f8d46; letter-spacing: .05em; }
            .pg-title { color: #64748b; font-size: 7.5pt; max-width: 65%; text-align: right; }

            .pg-footer {
              font-family: 'Inter', sans-serif; font-size: 8pt; color: #64748b;
              display: flex; justify-content: space-between; align-items: center;
              border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 24px;
            }
            .pg-num  { font-weight: 800; color: #2f8d46; font-size: 9pt; }
            .pf-brand { font-weight: 600; color: #475569; }
            .pf-site  { color: #2f8d46; font-weight: 600; }

            /* ════════════════════════════════════════════
               TABLE OF CONTENTS
            ════════════════════════════════════════════ */
            .toc-eyebrow {
              display: inline-block; font-family: 'Inter', sans-serif; font-size: 7.5pt; font-weight: 800;
              color: #fff; background: #2f8d46; padding: 3px 12px; letter-spacing: .10em; border-radius: 3px; margin-bottom: 8px;
            }
            .toc-heading { font-size: 22pt; font-weight: 700; color: #0f172a; line-height: 1.5; }
            .toc-heading-sub { font-family: 'Inter', sans-serif; font-size: 13pt; font-weight: 400; color: #64748b; }
            .toc-rule { width: 52%; height: 3px; border-radius: 2px; background: linear-gradient(90deg, #2f8d46, #10b981); margin: 14px 0 22px; }
            .toc-chapter {
              display: flex; align-items: stretch; margin-top: 14px; border-radius: 6px; overflow: hidden;
              box-shadow: 0 1px 4px rgba(47,141,70,.12);
            }
            .toc-ch-num {
              background: #2f8d46; color: #fff; font-family: 'Inter', sans-serif; font-size: 11pt; font-weight: 800;
              padding: 10px 14px; display: flex; align-items: center; justify-content: center; min-width: 42px;
            }
            .toc-ch-body {
              background: #f0fdf4; border-left: 3px solid #2f8d46; padding: 10px 16px; flex: 1;
              display: flex; align-items: center; gap: 12px;
            }
            .toc-ch-title { font-size: 11pt; font-weight: 700; color: #14532d; flex: 1; line-height: 1.7; }
            .toc-ch-count {
              font-family: 'Inter', sans-serif; font-size: 7.5pt; font-weight: 600; color: #2f8d46; white-space: nowrap;
              background: rgba(47,141,70,.12); padding: 2px 8px; border-radius: 10px;
            }
            .toc-lesson { display: flex; align-items: center; font-size: 10pt; color: #334155; padding: 1px 0; }
            .toc-ls-num { font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 700; color: #2f8d46; padding: 5px 10px 5px 56px; min-width: 90px; }
            .toc-ls-title { padding: 5px 0; line-height: 1.85; flex: 1; }
            .toc-ls-dots { width: 40px; border-bottom: 1px dashed #cbd5e1; align-self: center; flex-shrink: 0; margin-right: 8px; }

            /* ════════════════════════════════════════════
               CHAPTER BANNER
            ════════════════════════════════════════════ */
            .ch-banner {
              display: flex; align-items: stretch; border-radius: 8px; overflow: hidden;
              margin-bottom: 24px; box-shadow: 0 2px 12px rgba(47,141,70,.18);
            }
            .ch-badge {
              background: #1a5c2e; padding: 18px 16px;
              display: flex; flex-direction: column; align-items: center; justify-content: center;
              min-width: 78px; gap: 2px;
            }
            .ch-badge-label { font-family: 'Inter', sans-serif; font-size: 7pt; font-weight: 700; color: #86efac; letter-spacing: .05em; }
            .ch-badge-num { font-family: 'Inter', sans-serif; font-size: 28pt; font-weight: 900; color: #fff; line-height: 1; }
            .ch-banner-body {
              background: linear-gradient(135deg, #2f8d46 0%, #059669 100%);
              padding: 18px 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;
            }
            .ch-banner-eyebrow { font-family: 'Inter', sans-serif; font-size: 7.5pt; font-weight: 700; color: #a7f3d0; letter-spacing: .10em; margin-bottom: 5px; }
            .ch-banner-title { font-size: 16pt; font-weight: 700; color: #fff; line-height: 1.6; }
            .ch-banner-deco { width: 5px; background: rgba(255,255,255,.15); }
            .ch-desc {
              color: #475569; font-size: 10pt; line-height: 2.15; margin-bottom: 16px;
              padding: 10px 14px; background: #f0fdf4;
              border-left: 3px solid rgba(47,141,70,.30); border-radius: 0 4px 4px 0;
            }

            /* ════════════════════════════════════════════
               LESSON
            ════════════════════════════════════════════ */
            .lesson    { margin-bottom: 10px; }
            .ls-header {
              display: flex; align-items: stretch; margin: 18px 0 10px;
              border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(47,141,70,.10);
            }
            .ls-num {
              background: #2f8d46; color: #fff; font-family: 'Inter', sans-serif;
              font-size: 8.5pt; font-weight: 800; padding: 8px 10px;
              display: flex; align-items: center; justify-content: center; min-width: 44px; letter-spacing: .03em;
            }
            .ls-title {
              background: #f0fdf4; border-left: 3px solid #2f8d46;
              padding: 8px 16px; font-size: 12pt; font-weight: 700; color: #14532d; flex: 1; line-height: 1.7;
            }
            .ls-body { font-size: 10.5pt; line-height: 2.1; color: #334155; margin-bottom: 10px; }
            .ls-body p  { margin-bottom: 10px; }
            .ls-body ul { padding-left: 22px; margin-bottom: 10px; }
            .ls-body li { margin-bottom: 4px; line-height: 2; list-style: none; padding-left: 4px; position: relative; }
            .ls-body li::before { content: "▸"; color: #2f8d46; font-size: 9pt; position: absolute; left: -16px; }
            .h-rule { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0 6px; }

            /* ════════════════════════════════════════════
               CODE SNIPPET  ── GFG light-blue style
               Matches: pale blue-gray body, darker top bar,
               dark navy keywords, red strings, action icons
            ════════════════════════════════════════════ */

            .snippet {
              margin: 12px 0 6px;
              border-radius: 8px;
              overflow: hidden;
              border: 1px solid #c8d8e8;
              box-shadow: 0 2px 8px rgba(0,0,0,.08);
            }

            /* Top bar — slightly darker than code body */
            .sn-topbar {
              display: flex;
              align-items: center;
              gap: 10px;
              background: #dce8f4;
              border-bottom: 1px solid #c0d4e8;
              padding: 7px 14px;
              min-height: 36px;
            }

            /* Language pill */
            .sn-lang-pill {
              font-family: 'Inter', sans-serif;
              font-size: 7pt;
              font-weight: 800;
              letter-spacing: .08em;
              text-transform: uppercase;
              padding: 2px 9px;
              border-radius: 20px;
              border: 1px solid;
              background: rgba(255,255,255,.55);
              white-space: nowrap;
            }

            /* Title */
            .sn-topbar-title {
              font-family: 'Inter', sans-serif;
              font-size: 8pt;
              font-weight: 500;
              color: #3d5a7a;
              flex: 1;
            }

            /* Action icons — ✕ ▷ ⎘ */
            .sn-actions {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .sn-act {
              font-size: 9pt;
              color: #7a9bbb;
              background: rgba(255,255,255,.6);
              border: 1px solid #b0c8de;
              border-radius: 4px;
              padding: 1px 6px;
              line-height: 1.6;
              font-family: 'Inter', sans-serif;
            }
            .sn-act-run  { color: #2f8d46; border-color: #8fccaa; }
            .sn-act-copy { color: #5382a1; border-color: #9bbdd4; }

            /* Code body — light blue-gray, GFG signature */
            .sn-body {
              background: #eef4fb;
              padding: 0;
            }

            .sn-body pre[class*="language-"] {
              margin: 0 !important;
              border-radius: 0 !important;
              font-family: 'JetBrains Mono', 'Courier New', monospace !important;
              font-size: 8.8pt !important;
              line-height: 1.85 !important;
              padding: 16px 20px !important;
              background: #eef4fb !important;
              border: none !important;
              color: #1a1a2e !important;
            }

            /* GFG light-theme token colors — match screenshot */
            .sn-body .token.keyword      { color: #0033b3 !important; font-weight: 600 !important; }
            .sn-body .token.builtin      { color: #0033b3 !important; font-weight: 600 !important; }
            .sn-body .token.class-name   { color: #1a1a2e !important; font-weight: 600 !important; }
            .sn-body .token.function     { color: #00627a !important; }
            .sn-body .token.string       { color: #067d17 !important; }
            .sn-body .token.number       { color: #1750eb !important; }
            .sn-body .token.boolean      { color: #0033b3 !important; }
            .sn-body .token.comment      { color: #8c8c8c !important; font-style: italic !important; }
            .sn-body .token.operator     { color: #1a1a2e !important; }
            .sn-body .token.punctuation  { color: #1a1a2e !important; }
            .sn-body .token.variable     { color: #1a1a2e !important; }
            .sn-body .token.property     { color: #871094 !important; }
            .sn-body .token.annotation   { color: #808000 !important; }
            .sn-body .token.attr-name    { color: #0033b3 !important; }
            .sn-body .token.attr-value   { color: #067d17 !important; }
            .sn-body .token.tag          { color: #0033b3 !important; }
            .sn-body .token.selector     { color: #871094 !important; }
            .sn-body code                { color: #1a1a2e !important; background: none !important; }

            /* ════════════════════════════════════════════
               NOTE / OUTPUT
            ════════════════════════════════════════════ */
            .note-block {
              display: flex; align-items: flex-start; gap: 8px;
              background: #f0fdf4; border-left: 4px solid #2f8d46;
              padding: 10px 14px; margin: 6px 0 18px;
              font-size: 9.5pt; line-height: 1.9; border-radius: 0 6px 6px 0;
            }
            .note-icon { font-size: 11pt; flex-shrink: 0; margin-top: 1px; }
            .note-text { color: #15803d; }

            .out-block  { margin: 4px 0 18px; border-radius: 0 0 8px 8px; overflow: hidden; }
            .out-lbl {
              background: #2f8d46; padding: 5px 14px;
              font-family: 'JetBrains Mono', 'Courier New', monospace;
              font-size: 8pt; color: #fff; font-weight: 700; letter-spacing: .05em;
            }
            .out-body {
              background: #f0f7f0; border: 1px solid #c8e0c8; border-top: none;
              padding: 12px 18px;
              font-family: 'JetBrains Mono', 'Courier New', monospace;
              font-size: 8.5pt; color: #1a3a1a; line-height: 1.8; white-space: pre;
            }
            """;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  UTILITIES
    // ═══════════════════════════════════════════════════════════════════

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private String stripHtml(String s) {
        return s.replaceAll("<[^>]+>", " ")
                .replaceAll("&nbsp;",  " ")
                .replaceAll("&amp;",   "&")
                .replaceAll("&lt;",    "<")
                .replaceAll("&gt;",    ">")
                .replaceAll("&quot;",  "\"")
                .replaceAll("[ \\t]{2,}", " ")
                .trim();
    }
}