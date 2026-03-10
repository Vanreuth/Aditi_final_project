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

    // ── Language accent colours ──────────────────────────────────────────
    private static String langAccent(String lang) {
        if (lang == null) return "#4361ee";
        return switch (lang.toUpperCase()) {
            case "HTML"                         -> "#e44d26";
            case "CSS"                          -> "#268fe4";
            case "JS", "JAVASCRIPT"             -> "#f7df1e";
            case "TS", "TYPESCRIPT"             -> "#3178c6";
            case "JAVA", "SPRING", "SPRINGBOOT" -> "#5382a1";
            case "PYTHON"                       -> "#3572a5";
            case "SQL"                          -> "#e38c00";
            case "BASH", "SH", "SHELL"          -> "#89e051";
            case "JSON"                         -> "#cbcb41";
            case "XML"                          -> "#f1672d";
            case "KOTLIN"                       -> "#a97bff";
            case "DART"                         -> "#00b4ab";
            case "PHP"                          -> "#8993be";
            case "C", "CPP", "C++"             -> "#555555";
            case "SWIFT"                        -> "#f05138";
            case "GO"                           -> "#00acd7";
            case "RUST"                         -> "#dea584";
            default                             -> "#4361ee";
        };
    }

    /** Map our language name → Prism.js grammar token */
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

            // Wait for Prism.js to finish syntax-highlighting all blocks
            page.waitForFunction(
                    "() => typeof Prism !== 'undefined' && " +
                            "document.querySelectorAll('pre.line-numbers').length >= 0"
            );
            page.waitForTimeout(500);   // small buffer for print styles

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
                ? course.getInstructor().getUsername() : "Code Khmer";
        String date       = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        int lessons       = course.getTotalLessons() != null ? course.getTotalLessons() : 0;

        // Collect distinct Prism grammar tokens used in this course
        // (so we can emit their <script> tags dynamically)
        java.util.Set<String> usedLangs = new java.util.LinkedHashSet<>();
        for (Chapter ch : course.getChapters())
            for (Lesson ls : ch.getLessons())
                for (CodeSnippet cs : ls.getCodeSnippets())
                    usedLangs.add(prismLang(cs.getLanguage()));

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n<html lang=\"km\">\n<head>\n")
                .append("<meta charset=\"UTF-8\">\n")

                // ── Google Fonts ──────────────────────────────────────────────
                .append("<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n")
                .append("<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n")
                .append("<link href=\"https://fonts.googleapis.com/css2?")
                .append("family=Noto+Serif+Khmer:wght@300;400;600;700")
                .append("&family=Inter:wght@300;400;500;600;700;800")
                .append("&family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400")
                .append("&display=swap\" rel=\"stylesheet\">\n")

                // ── Prism.js CDN ── VSCode Dark+ theme ────────────────────────
                // 1. Theme CSS (VSCode Dark+)
                .append("<!-- Prism.js CDN – VSCode Dark+ theme -->\n")
                .append("<link rel=\"stylesheet\" href=\"")
                .append(PRISM_CDN).append("/themes/prism-vsc-dark-plus.min.css\">\n")

                // 2. Line-numbers plugin CSS
                .append("<!-- Prism line-numbers plugin -->\n")
                .append("<link rel=\"stylesheet\" href=\"")
                .append(PRISM_CDN).append("/plugins/line-numbers/prism-line-numbers.min.css\">\n")

                // 3. Toolbar plugin CSS (needed by copy-to-clipboard)
                .append("<!-- Prism toolbar plugin -->\n")
                .append("<link rel=\"stylesheet\" href=\"")
                .append(PRISM_CDN).append("/plugins/toolbar/prism-toolbar.min.css\">\n")

                // ── Custom overrides ──────────────────────────────────────────
                .append("<style>\n").append(css()).append("</style>\n</head>\n<body>\n");

        // ── Pages ─────────────────────────────────────────────────────────
        html.append(coverPage(course, level, lang, isFree, instructor, date, lessons));
        html.append(tocPage(course));

        int ci = 0;
        for (Chapter ch : course.getChapters())
            html.append(chapterPage(ch, ++ci));

        // ── Prism.js scripts — placed right before </body> ───────────────
        // 4. Prism core  (bundles: markup / css / javascript / clike)
        html.append("\n<!-- ═══ Prism.js core ═══ -->\n")
                .append("<script src=\"").append(PRISM_CDN).append("/prism.min.js\"></script>\n")

                // 5-22. Individual language grammars
                .append("<!-- Prism language grammars -->\n")
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

                // 23. Line-numbers plugin JS
                .append("<!-- Prism plugins -->\n")
                .append("<script src=\"").append(PRISM_CDN).append("/plugins/line-numbers/prism-line-numbers.min.js\"></script>\n")

                // 24. Toolbar plugin JS
                .append("<script src=\"").append(PRISM_CDN).append("/plugins/toolbar/prism-toolbar.min.js\"></script>\n")

                // 25. Copy-to-clipboard plugin JS (depends on toolbar)
                .append("<script src=\"").append(PRISM_CDN).append("/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js\"></script>\n")

                // 26. Re-highlight everything after all grammars have loaded
                .append("<script>if(typeof Prism !== 'undefined') Prism.highlightAll();</script>\n")

                .append("</body>\n</html>");

        return html.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  COVER PAGE
    // ═══════════════════════════════════════════════════════════════════

    private String coverPage(Course course, String level, String lang,
                             boolean isFree, String instructor, String date, int lessons) {
        String accessColor = isFree ? "#10b981" : "#d97706";
        String access      = isFree ? "FREE"    : "PREMIUM";
        String desc        = course.getDescription() != null ? course.getDescription() : "";

        return """
            <div class="page cover">
              <div class="bar-top"></div>
              <div class="bar-bottom"></div>
              <div class="bar-left"></div>
              <div class="glow"></div>
              <div class="glow2"></div>
              <div class="brand">GrowCodeKH &nbsp;·&nbsp; growcodekh.site</div>
              <div class="cover-title">%s</div>
              <div class="cover-rule"></div>
              <div class="cover-desc">%s</div>
              <div class="stat-grid">
                <div class="stat-card" style="--a:#6346f6;">
                  <div class="stat-icon">📊</div>
                  <div class="stat-lbl">LEVEL</div>
                  <div class="stat-val">%s</div>
                </div>
                <div class="stat-card" style="--a:#0694a2;">
                  <div class="stat-icon">🌐</div>
                  <div class="stat-lbl">LANGUAGE</div>
                  <div class="stat-val">%s</div>
                </div>
                <div class="stat-card" style="--a:#4f6dff;">
                  <div class="stat-icon">📚</div>
                  <div class="stat-lbl">LESSONS</div>
                  <div class="stat-val">%d</div>
                </div>
                <div class="stat-card" style="--a:%s;">
                  <div class="stat-icon">🔑</div>
                  <div class="stat-lbl">ACCESS</div>
                  <div class="stat-val" style="color:%s;">%s</div>
                </div>
              </div>
              <div class="meta-card">
                <div class="meta-row">
                  <span class="meta-key">👨‍🏫  Instructor</span>
                  <span class="meta-sep">:</span>
                  <span class="meta-val">%s</span>
                </div>
                <div class="meta-row">
                  <span class="meta-key">📅  Generated</span>
                  <span class="meta-sep">:</span>
                  <span class="meta-val">%s</span>
                </div>
                <div class="meta-row">
                  <span class="meta-key">🌍  Website</span>
                  <span class="meta-sep">:</span>
                  <span class="meta-val" style="color:#4f6dff;">growcodekh.site</span>
                </div>
              </div>
              <div class="cover-footer">
                <span>© %s GrowCodeKH — All rights reserved</span>
                <span style="color:#4f6dff;">growcodekh.site</span>
              </div>
            </div>
            """.formatted(
                esc(course.getTitle()), esc(desc),
                esc(level), esc(lang), lessons,
                accessColor, accessColor, access,
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
              <div class="toc-label-tag">TABLE OF CONTENTS</div>
              <div class="toc-h">តារាងមាតិកា <span class="toc-sub">/ Table of Contents</span></div>
              <div class="rule-blue"></div>
            """.formatted(esc(course.getTitle())));

        int ci = 0;
        for (Chapter ch : course.getChapters()) {
            ci++;
            sb.append("""
                <div class="toc-ch">
                  <div class="toc-ch-n">%d</div>
                  <div class="toc-ch-t">%s</div>
                  <div class="toc-ch-c">%d Lessons</div>
                </div>
                """.formatted(ci, esc(ch.getTitle()), ch.getLessons().size()));

            int li = 0;
            for (Lesson ls : ch.getLessons()) {
                li++;
                String bg = (li % 2 == 0) ? " style=\"background:#f8fafc;\"" : "";
                sb.append("<div class=\"toc-ls\"%s>".formatted(bg))
                        .append("<span class=\"toc-ls-n\">%d.%d</span>".formatted(ci, li))
                        .append("<span class=\"toc-ls-t\">%s</span>".formatted(esc(ls.getTitle())))
                        .append("<span class=\"toc-ls-dot\"></span>")
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
                <div class="ch-num-box">
                  <div class="ch-sup">ជំពូក</div>
                  <div class="ch-num">%02d</div>
                </div>
                <div class="ch-title-box">
                  <div class="ch-sup2">CHAPTER %d</div>
                  <div class="ch-title">%s</div>
                </div>
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

            String[] lines  = b.split("\n");
            boolean isList  = Arrays.stream(lines).anyMatch(this::isBulletLine);

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
    //  CODE SNIPPET  ── powered by Prism.js (CDN, VSCode Dark+ theme)
    // ═══════════════════════════════════════════════════════════════════

    private String snippetHtml(CodeSnippet cs) {
        String rawLang = cs.getLanguage() != null ? cs.getLanguage().toUpperCase() : "CODE";
        String pLang   = prismLang(cs.getLanguage());      // e.g. "java"
        String accent  = langAccent(cs.getLanguage());     // e.g. "#5382a1"
        String title   = (cs.getTitle() != null && !cs.getTitle().isBlank())
                ? cs.getTitle() : "ឧទាហរណ៍ / Example";
        String codeRaw = cs.getCode() != null ? cs.getCode() : "";

        // HTML-escape code content so Prism won't double-escape it
        String codeEsc = esc(codeRaw);

        StringBuilder sb = new StringBuilder();

        // ── Outer wrapper ── carries accent via CSS custom property ─────
        sb.append("<div class=\"snippet\" style=\"--lc:").append(accent).append(";\">\n");

        // ── Header bar: macOS dots · title · language badge ─────────────
        sb.append("""
            <div class="sn-header">
              <div class="sn-dots">
                <span class="dot dr"></span>
                <span class="dot dy"></span>
                <span class="dot dg"></span>
              </div>
              <div class="sn-title">%s</div>
              <div class="sn-lang-badge" style="background:%s;">%s</div>
            </div>
            """.formatted(esc(title), accent, rawLang));

        // ── Code body ──
        //   • <pre class="line-numbers"> activates the line-numbers plugin
        //   • <code class="language-XXX"> activates syntax highlighting
        sb.append("<div class=\"sn-body\">\n")
                .append("<pre class=\"line-numbers\" style=\"margin:0;border-radius:0;\">")
                .append("<code class=\"language-").append(pLang).append("\">")
                .append(codeEsc)
                .append("</code></pre>\n")
                .append("</div>\n");

        // ── Accent footer stripe ─────────────────────────────────────────
        sb.append("<div class=\"sn-foot\"></div>\n");
        sb.append("</div>\n");   // .snippet

        // ── Explanation / Output block ───────────────────────────────────
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
                      <span class="note-lbl">💡 Note: </span>%s
                    </div>
                    """.formatted(esc(expl)));
            }
        }
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CSS
    // ═══════════════════════════════════════════════════════════════════

    private String css() {
        return """
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

            body {
              font-family: 'Noto Serif Khmer', 'Inter', sans-serif;
              font-size: 11pt; color: #334155; background: #fff;
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }
            @page { size: A4; margin: 0; }

            /* ─────── Pages ─────── */
            .page { width: 210mm; min-height: 297mm; page-break-after: always; overflow: hidden; display: flex; flex-direction: column; }
            .page:last-child { page-break-after: avoid; }

            /* ═════════ COVER ═════════ */
            .cover { background: #070b1a; color: #fff; padding: 52px 56px; position: relative; }
            .bar-top    { position:absolute; top:0; left:0; right:0; height:10px; background:linear-gradient(90deg,#4f6dff 0%,#8b5cf6 55%,#ec4899 100%); }
            .bar-bottom { position:absolute; bottom:0; left:0; right:0; height:6px; background:linear-gradient(90deg,#4f6dff,#8b5cf6); }
            .bar-left   { position:absolute; top:0; left:0; bottom:0; width:5px; background:linear-gradient(180deg,#4f6dff,#8b5cf6); }
            .glow  { position:absolute; top:-80px; right:-80px; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(79,109,255,.14) 0%,transparent 70%); pointer-events:none; }
            .glow2 { position:absolute; bottom:40px; left:60px; width:250px; height:250px; border-radius:50%; background:radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 70%); pointer-events:none; }
            .brand { font-family:'Inter',sans-serif; font-size:8pt; font-weight:700; color:#4f6dff; letter-spacing:.1em; margin:28px 0 40px; text-transform:uppercase; }
            .cover-title { font-size:26pt; font-weight:800; line-height:1.55; margin-bottom:12px; }
            .cover-rule  { width:38%; height:3px; background:linear-gradient(90deg,#4f6dff,#8b5cf6); margin:16px 0 20px; border-radius:2px; }
            .cover-desc  { font-size:10.5pt; color:#94a3b8; line-height:2.1; margin-bottom:36px; }
            .stat-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:2px; margin-bottom:28px; }
            .stat-card   { background:#111827; border-top:3px solid var(--a); padding:14px 12px; display:flex; flex-direction:column; gap:4px; }
            .stat-icon   { font-size:14pt; margin-bottom:4px; }
            .stat-lbl    { font-family:'Inter',sans-serif; font-size:7pt; font-weight:700; color:#64748b; letter-spacing:.07em; text-transform:uppercase; }
            .stat-val    { font-family:'Inter',sans-serif; font-size:11pt; font-weight:700; color:#f1f5f9; }
            .meta-card   { background:#111827; border-left:4px solid #4f6dff; padding:16px 18px; display:flex; flex-direction:column; gap:2px; border-radius:0 4px 4px 0; }
            .meta-row    { display:flex; align-items:center; font-size:9.5pt; color:#94a3b8; line-height:2.4; gap:8px; }
            .meta-key    { font-family:'Inter',sans-serif; font-weight:600; min-width:120px; }
            .meta-sep    { color:#4f6dff; font-weight:700; }
            .meta-val    { color:#e2e8f0; }
            .cover-footer { margin-top:auto; padding-top:28px; display:flex; justify-content:space-between; font-family:'Inter',sans-serif; font-size:8pt; color:#475569; border-top:1px solid #1e293b; }

            /* ═════════ Inner Pages ═════════ */
            .inner-page { padding:48px 56px; flex:1; }
            .pg-header  { font-family:'Inter',sans-serif; font-size:8pt; display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #4361ee; padding-bottom:8px; margin-bottom:24px; }
            .pg-site    { font-weight:700; color:#4361ee; letter-spacing:.04em; }
            .pg-title   { color:#64748b; font-size:7.5pt; }
            .pg-footer  { font-family:'Inter',sans-serif; font-size:8pt; color:#64748b; display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e2e8f0; padding-top:10px; margin-top:24px; }
            .pg-num     { font-weight:800; color:#4361ee; font-size:9pt; }
            .pf-brand   { font-weight:600; color:#475569; }
            .pf-site    { color:#4361ee; font-weight:600; }

            /* ═════════ TOC ═════════ */
            .toc-label-tag { display:inline-block; font-family:'Inter',sans-serif; font-size:7.5pt; font-weight:700; color:#fff; background:#4361ee; padding:3px 10px; letter-spacing:.08em; border-radius:2px; margin-bottom:8px; }
            .toc-h    { font-size:22pt; font-weight:700; color:#0f172a; line-height:1.5; }
            .toc-sub  { font-family:'Inter',sans-serif; font-size:13pt; font-weight:400; color:#64748b; }
            .rule-blue { width:48%; height:3px; background:linear-gradient(90deg,#4361ee,#8b5cf6); margin:16px 0 22px; border-radius:2px; }
            .toc-ch   { display:flex; align-items:stretch; margin-top:14px; border-radius:4px; overflow:hidden; }
            .toc-ch-n { background:#4361ee; color:#fff; font-family:'Inter',sans-serif; font-size:10pt; font-weight:800; padding:8px 12px; display:flex; align-items:center; min-width:38px; justify-content:center; }
            .toc-ch-t { background:#eef2ff; border-left:3px solid #4361ee; padding:8px 14px; font-size:11pt; font-weight:700; color:#312e81; flex:1; line-height:1.7; }
            .toc-ch-c { background:#eef2ff; padding:8px 14px; font-family:'Inter',sans-serif; font-size:8pt; color:#64748b; display:flex; align-items:center; white-space:nowrap; }
            .toc-ls   { display:flex; align-items:center; font-size:10pt; color:#334155; padding:2px 0; }
            .toc-ls-n { font-family:'Inter',sans-serif; font-size:8.5pt; font-weight:700; color:#4361ee; padding:5px 10px 5px 52px; min-width:86px; }
            .toc-ls-t { padding:5px 0; line-height:1.8; flex:1; }
            .toc-ls-dot { width:40px; text-align:right; padding-right:8px; border-bottom:1px dotted #cbd5e1; align-self:center; flex-shrink:0; }

            /* ═════════ Chapter ═════════ */
            .ch-banner    { display:flex; margin-bottom:28px; border-radius:6px; overflow:hidden; }
            .ch-num-box   { background:#312e81; padding:16px 18px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:82px; }
            .ch-sup       { font-family:'Inter',sans-serif; font-size:7.5pt; font-weight:700; color:#c4b5fd; margin-bottom:4px; letter-spacing:.04em; }
            .ch-num       { font-family:'Inter',sans-serif; font-size:28pt; font-weight:800; color:#fff; line-height:1; }
            .ch-title-box { background:linear-gradient(135deg,#4361ee 0%,#5b21b6 100%); padding:16px 22px; flex:1; display:flex; flex-direction:column; justify-content:center; }
            .ch-sup2      { font-family:'Inter',sans-serif; font-size:7.5pt; font-weight:700; color:#c4b5fd; margin-bottom:6px; letter-spacing:.06em; }
            .ch-title     { font-size:16pt; font-weight:700; color:#fff; line-height:1.6; }
            .ch-desc      { color:#64748b; font-size:10pt; margin-bottom:16px; line-height:2.1; }

            /* ═════════ Lesson ═════════ */
            .lesson    { margin-bottom:10px; }
            .ls-header { display:flex; margin:22px 0 10px; border-radius:4px; overflow:hidden; }
            .ls-num    { background:#4361ee; color:#fff; font-family:'Inter',sans-serif; font-size:8.5pt; font-weight:700; padding:8px 10px; display:flex; align-items:center; min-width:46px; justify-content:center; letter-spacing:.02em; }
            .ls-title  { background:#eef2ff; border-left:3px solid #4361ee; padding:8px 16px; font-size:12pt; font-weight:700; color:#0f172a; flex:1; line-height:1.7; }
            .ls-body   { font-size:10.5pt; line-height:2.1; color:#334155; margin-bottom:10px; }
            .ls-body p { margin-bottom:10px; }
            .ls-body ul { padding-left:22px; margin-bottom:10px; }
            .ls-body li { margin-bottom:4px; line-height:2; }
            .h-rule    { border:none; border-top:1px solid #e2e8f0; margin:16px 0 6px; }

            /* ═════════ Code Snippet (Prism.js) ═════════ */
            .snippet { margin:14px 0 6px; border-radius:8px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.22); }

            /* Header bar */
            .sn-header { display:flex; align-items:stretch; border-top:3px solid var(--lc,#4361ee); background:#1e1e2e; }
            .sn-dots   { padding:9px 12px; display:flex; align-items:center; gap:5px; background:#1e1e2e; }
            .dot  { width:11px; height:11px; border-radius:50%; display:inline-block; }
            .dr   { background:#ff6059; }
            .dy   { background:#ffbd2e; }
            .dg   { background:#28c840; }
            .sn-title {
              padding:9px 10px; font-size:9pt; font-weight:600; color:#cdd6f4; flex:1;
              display:flex; align-items:center; line-height:1.5; background:#1e1e2e;
              font-family:'JetBrains Mono','Courier New',monospace;
            }
            .sn-lang-badge {
              font-family:'Inter',sans-serif; font-size:7.5pt; font-weight:800;
              color:#fff; padding:0 14px; display:flex; align-items:center;
              letter-spacing:.06em; text-transform:uppercase;
            }

            /* Code body — Prism handles colours; we only override font & spacing */
            .sn-body pre[class*="language-"] {
              margin:0 !important; border-radius:0 !important;
              font-family:'JetBrains Mono','Courier New',monospace !important;
              font-size:8.5pt !important; line-height:1.75 !important;
              background:#1e1e1e !important;
            }
            /* Line-numbers gutter */
            .sn-body .line-numbers .line-numbers-rows        { border-right:1px solid #3c3c3c !important; background:#252526 !important; }
            .sn-body .line-numbers-rows > span::before        { color:#636363 !important; }

            /* Accent footer stripe */
            .sn-foot { height:3px; background:var(--lc,#4361ee); }

            /* ═════════ Note / Output ═════════ */
            .note-block { background:#ecfdf5; border-left:4px solid #10b981; padding:10px 14px; margin:6px 0 18px; font-size:9.5pt; line-height:1.9; border-radius:0 6px 6px 0; }
            .note-lbl   { font-family:'Inter',sans-serif; font-weight:700; color:#059669; margin-right:6px; }
            .out-block  { margin:6px 0 18px; border-radius:0 0 6px 6px; overflow:hidden; }
            .out-lbl    { background:#14b8a6; padding:5px 14px; font-family:'JetBrains Mono','Courier New',monospace; font-size:8pt; color:#fff; font-weight:700; letter-spacing:.04em; }
            .out-body   { background:#0f172a; border-left:3px solid #14b8a6; padding:10px 16px; font-family:'JetBrains Mono','Courier New',monospace; font-size:8.5pt; color:#a3e6b4; line-height:1.75; white-space:pre; }
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