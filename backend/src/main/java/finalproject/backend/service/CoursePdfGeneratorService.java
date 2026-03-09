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

/**
 * CoursePdfGeneratorService — Generates a perfectly shaped, Khmer-correct PDF
 * using Playwright (headless Chromium).
 *
 * ═══════════════════════════════════════════════════════════════════
 *  WHY PLAYWRIGHT — NOT OpenPDF / iText
 * ═══════════════════════════════════════════════════════════════════
 *  OpenPDF and iText 5 have NO OpenType shaping engine.
 *  Khmer clusters like ត្រូវ require GSUB/GPOS table processing
 *  (HarfBuzz) to substitute base + COENG + subscript into the correct
 *  ligature glyph.  Without shaping every character renders at its
 *  individual code-point position — corrupting meaning irreversibly.
 *  No line-break hack, no SplitCharacter, no ICU4J workaround can
 *  fix a missing shaping engine.
 *
 *  Chromium uses HarfBuzz — the same engine as every modern browser —
 *  so Khmer (and all complex scripts) render perfectly.
 *  Google Fonts (Noto Serif Khmer) is loaded via CDN in the template.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  SETUP
 * ═══════════════════════════════════════════════════════════════════
 *  1. Add to pom.xml:
 *       <dependency>
 *         <groupId>com.microsoft.playwright</groupId>
 *         <artifactId>playwright</artifactId>
 *         <version>1.44.0</version>
 *       </dependency>
 *
 *  2. Install Chromium once (run in project root):
 *       mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI \
 *         -D exec.args="install chromium"
 *
 *  3. Remove OpenPDF / iText 5 dependency — no longer needed.
 *     Remove ICU4J dependency — no longer needed.
 */
@Slf4j
@Service
public class CoursePdfGeneratorService {

    // ── Language accent colours for code block headers ────────────────
    private static String langAccent(String lang) {
        if (lang == null) return "#4361ee";
        return switch (lang.toUpperCase()) {
            case "HTML"                         -> "#e44d26";
            case "CSS"                          -> "#268fe4";
            case "JS", "JAVASCRIPT"             -> "#f7df1e";
            case "JAVA", "SPRING", "SPRINGBOOT" -> "#0066cc";
            default                             -> "#4361ee";
        };
    }

    // ═══════════════════════════════════════════════════════════════════
    //  PUBLIC generate()
    // ═══════════════════════════════════════════════════════════════════

    public byte[] generate(Course course) {
        log.info("🖨️  Generating Playwright PDF — course='{}'", course.getSlug());
        try (Playwright playwright = Playwright.create()) {
            Browser browser = playwright.chromium().launch(
                    new BrowserType.LaunchOptions().setHeadless(true));
            Page page = browser.newContext().newPage();

            page.setContent(buildHtml(course),
                    new Page.SetContentOptions()
                            .setWaitUntil(WaitUntilState.NETWORKIDLE));

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
        String level      = course.getLevel()       != null ? course.getLevel().toString() : "—";
        String lang       = course.getLanguage()    != null ? course.getLanguage()          : "Khmer";
        boolean isFree    = Boolean.TRUE.equals(course.getIsFree());
        String instructor = course.getInstructor()  != null
                ? course.getInstructor().getUsername() : "Code Khmer";
        String date       = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        int lessons       = course.getTotalLessons() != null ? course.getTotalLessons() : 0;

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n<html lang=\"km\">\n<head>\n")
                .append("<meta charset=\"UTF-8\">\n")
                .append("<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n")
                .append("<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n")
                .append("<link href=\"https://fonts.googleapis.com/css2?family=Noto+Serif+Khmer:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">\n")
                .append("<style>\n").append(css()).append("</style>\n</head>\n<body>\n");

        html.append(coverPage(course, level, lang, isFree, instructor, date, lessons));
        html.append(tocPage(course));

        int ci = 0;
        for (Chapter ch : course.getChapters()) {
            html.append(chapterPage(ch, ++ci));
        }

        html.append("</body>\n</html>");
        return html.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  COVER
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
              <div class="brand">CODE KHMER LEARNING &nbsp;·&nbsp; codekhmerlearning.site</div>
              <div class="cover-title">%s</div>
              <div class="cover-rule"></div>
              <div class="cover-desc">%s</div>
              <div class="stat-grid">
                <div class="stat-card" style="--a:#6346f6;">
                  <div class="stat-lbl">LEVEL</div><div class="stat-val">%s</div>
                </div>
                <div class="stat-card" style="--a:#0694a2;">
                  <div class="stat-lbl">LANGUAGE</div><div class="stat-val">%s</div>
                </div>
                <div class="stat-card" style="--a:#4f6dff;">
                  <div class="stat-lbl">LESSONS</div><div class="stat-val">%d Lessons</div>
                </div>
                <div class="stat-card" style="--a:%s;">
                  <div class="stat-lbl">ACCESS</div>
                  <div class="stat-val" style="color:%s;">%s</div>
                </div>
              </div>
              <div class="meta-card">
                <div class="meta-row"><span class="meta-key">Instructor :</span> %s</div>
                <div class="meta-row"><span class="meta-key">Date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</span> %s</div>
                <div class="meta-row"><span class="meta-key">Website &nbsp;&nbsp;&nbsp;:</span>
                  <span style="color:#4f6dff;">codekhmerlearning.site</span>
                </div>
              </div>
            </div>
            """.formatted(
                esc(course.getTitle()), esc(desc),
                esc(level), esc(lang), lessons,
                accessColor, accessColor, access,
                esc(instructor), esc(date));
    }

    // ═══════════════════════════════════════════════════════════════════
    //  TABLE OF CONTENTS
    // ═══════════════════════════════════════════════════════════════════

    private String tocPage(Course course) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            <div class="page inner-page">
              <div class="pg-header">
                <span class="pg-site">codekhmerlearning.site</span>
                <span class="pg-title">%s</span>
              </div>
              <div class="toc-lbl">TABLE OF CONTENTS</div>
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
                        .append("</div>\n");
            }
        }

        sb.append("""
              <div class="pg-footer">
                <span>Code Khmer Learning</span>
                <span class="pg-num">— 2 —</span>
                <span>© codekhmerlearning.site</span>
              </div>
            </div>
            """);
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CHAPTER
    // ═══════════════════════════════════════════════════════════════════

    private String chapterPage(Chapter chapter, int ci) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            <div class="page inner-page">
              <div class="pg-header">
                <span class="pg-site">codekhmerlearning.site</span>
                <span class="pg-title">Chapter %d</span>
              </div>
              <div class="ch-banner">
                <div class="ch-num-box">
                  <div class="ch-sup">ជំពូក / Ch.</div>
                  <div class="ch-num">%d</div>
                </div>
                <div class="ch-title-box">
                  <div class="ch-sup2">CHAPTER %d</div>
                  <div class="ch-title">%s</div>
                </div>
              </div>
            """.formatted(ci, ci, ci, esc(chapter.getTitle())));

        if (chapter.getDescription() != null && !chapter.getDescription().isBlank()) {
            sb.append("<p class=\"ch-desc\">").append(esc(chapter.getDescription())).append("</p>\n");
        }

        int li = 0;
        for (Lesson lesson : chapter.getLessons()) {
            sb.append(lessonSection(lesson, ci, ++li));
        }

        sb.append("""
              <div class="pg-footer">
                <span>Code Khmer Learning</span>
                <span class="pg-num">— %d —</span>
                <span>© codekhmerlearning.site</span>
              </div>
            </div>
            """.formatted(ci + 2));
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  LESSON
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

        if (lesson.getContent() != null && !lesson.getContent().isBlank()) {
            sb.append("<div class=\"ls-body\">")
                    .append(renderContent(lesson.getContent()))
                    .append("</div>\n");
        }

        for (CodeSnippet cs : lesson.getCodeSnippets()) {
            sb.append(snippetHtml(cs));
        }

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
                for (String line : lines) {
                    if (!line.isBlank())
                        sb.append("<li>").append(inlineHtml(normaliseBullet(line.trim()))).append("</li>\n");
                }
                sb.append("</ul>\n");
            } else {
                // Join \n-separated lines as one paragraph — mirrors browser behaviour
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
    //  CODE SNIPPET
    // ═══════════════════════════════════════════════════════════════════

    private String snippetHtml(CodeSnippet cs) {
        String rawLang = cs.getLanguage() != null ? cs.getLanguage().toUpperCase() : "CODE";
        String title   = (cs.getTitle() != null && !cs.getTitle().isBlank())
                ? cs.getTitle() : "ឧទាហរណ៍ / Example";
        String accent  = langAccent(rawLang);
        String[] lines = cs.getCode() != null ? cs.getCode().split("\n") : new String[]{""};

        StringBuilder gutter = new StringBuilder();
        StringBuilder code   = new StringBuilder();
        for (int i = 0; i < lines.length; i++) {
            gutter.append(i + 1).append(i < lines.length - 1 ? "\n" : "");
            code.append(esc(lines[i].stripTrailing())).append(i < lines.length - 1 ? "\n" : "");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("""
            <div class="snippet" style="--lc:%s;">
              <div class="sn-header">
                <div class="sn-dots">
                  <span class="dot dr"></span>
                  <span class="dot dy"></span>
                  <span class="dot dg"></span>
                </div>
                <div class="sn-title">%s</div>
                <div class="sn-lang">%s</div>
              </div>
              <div class="sn-body">
                <div class="sn-gutter">%s</div>
                <div class="sn-code">%s</div>
              </div>
              <div class="sn-foot"></div>
            </div>
            """.formatted(accent, esc(title), rawLang, gutter, code));

        if (cs.getExplanation() != null && !cs.getExplanation().isBlank()) {
            String expl = cs.getExplanation().trim();
            if (expl.toLowerCase().startsWith("output:")
                    || expl.toLowerCase().startsWith("output :")) {
                String out = expl.replaceFirst("(?i)output\\s*:\\s*", "");
                sb.append("<div class=\"out-block\"><div class=\"out-lbl\">▶  Output</div>")
                        .append("<div class=\"out-body\">").append(esc(out)).append("</div></div>\n");
            } else {
                sb.append("<div class=\"note-block\"><span class=\"note-lbl\">Note: </span>")
                        .append(esc(expl)).append("</div>\n");
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

            /* ─ Pages ─ */
            .page { width: 210mm; min-height: 297mm; page-break-after: always; overflow: hidden; }
            .page:last-child { page-break-after: avoid; }

            /* ─ COVER ─ */
            .cover {
              background: #070b1a; color: #fff;
              padding: 56px; position: relative;
              display: flex; flex-direction: column;
            }
            .bar-top {
              position: absolute; top: 0; left: 0; right: 0; height: 12px;
              background: linear-gradient(90deg, #4f6dff 58%, #8b5cf6 100%);
            }
            .bar-bottom {
              position: absolute; bottom: 0; left: 0; right: 0; height: 8px;
              background: linear-gradient(90deg, #4f6dff 45%, #8b5cf6 100%);
            }
            .bar-left {
              position: absolute; top: 0; left: 0; bottom: 0; width: 5px;
              background: linear-gradient(180deg, #4f6dff, #8b5cf6);
            }
            .glow {
              position: absolute; top: -60px; right: -60px;
              width: 360px; height: 360px; border-radius: 50%;
              background: radial-gradient(circle, rgba(79,109,255,.12) 0%, transparent 70%);
            }
            .brand {
              font-family: 'Inter', sans-serif; font-size: 8pt; font-weight: 700;
              color: #4f6dff; letter-spacing: .08em; margin: 32px 0 36px;
            }
            .cover-title { font-size: 28pt; font-weight: 700; line-height: 1.6; margin-bottom: 10px; }
            .cover-rule  { width: 40%; height: 3px; background: #4f6dff; margin: 18px 0 22px; }
            .cover-desc  { font-size: 10.5pt; color: #bdc8ff; line-height: 2; margin-bottom: 32px; }
            .stat-grid   { display: grid; grid-template-columns: repeat(4,1fr); margin-bottom: 28px; }
            .stat-card   { background: #121932; border-top: 2.5px solid var(--a); padding: 12px 14px; }
            .stat-lbl    { font-family: 'Inter',sans-serif; font-size: 7pt; font-weight: 700; color: #94a3b8; letter-spacing:.06em; margin-bottom:4px; }
            .stat-val    { font-family: 'Inter',sans-serif; font-size: 11pt; font-weight: 700; color: #fff; }
            .meta-card   { background: #121932; border-left: 3.5px solid #4f6dff; padding: 14px 16px; }
            .meta-row    { font-size: 9pt; color: #94a3b8; line-height: 2.2; }
            .meta-key    { font-family: 'Inter',sans-serif; font-weight: 700; }

            /* ─ Inner pages ─ */
            .inner-page { padding: 56px; }
            .pg-header  { font-family:'Inter',sans-serif; font-size:8pt; display:flex; justify-content:space-between; border-bottom:.9px solid #4361ee; padding-bottom:6px; margin-bottom:20px; }
            .pg-site    { font-weight:700; color:#4361ee; }
            .pg-title   { color:#64748b; }
            .pg-footer  { font-family:'Inter',sans-serif; font-size:8pt; color:#64748b; display:flex; justify-content:space-between; border-top:.5px solid #e2e8f0; padding-top:10px; margin-top:20px; }
            .pg-num     { font-weight:700; color:#4361ee; }

            /* ─ TOC ─ */
            .toc-lbl  { font-family:'Inter',sans-serif; font-size:8pt; font-weight:700; color:#4361ee; letter-spacing:.06em; margin-bottom:4px; }
            .toc-h    { font-size:22pt; font-weight:700; color:#0f172a; }
            .toc-sub  { font-family:'Inter',sans-serif; font-size:13pt; color:#64748b; }
            .rule-blue{ width:50%; height:3px; background:#4361ee; margin:18px 0 22px; }
            .toc-ch   { display:flex; align-items:stretch; margin-top:12px; }
            .toc-ch-n { background:#4361ee; color:#fff; font-family:'Inter',sans-serif; font-size:9pt; font-weight:700; padding:8px 10px; display:flex; align-items:center; min-width:36px; justify-content:center; }
            .toc-ch-t { background:#edf2ff; border-left:3.5px solid #4361ee; padding:8px 12px; font-size:11pt; font-weight:600; color:#312e81; flex:1; line-height:1.7; }
            .toc-ch-c { background:#edf2ff; padding:8px 12px; font-family:'Inter',sans-serif; font-size:8pt; color:#64748b; display:flex; align-items:center; }
            .toc-ls   { display:flex; font-size:10pt; color:#334155; }
            .toc-ls-n { font-family:'Inter',sans-serif; font-size:9pt; font-weight:700; color:#64748b; padding:5px 10px 5px 46px; min-width:80px; }
            .toc-ls-t { padding:5px 0; line-height:1.7; flex:1; }

            /* ─ Chapter ─ */
            .ch-banner    { display:flex; margin-bottom:28px; }
            .ch-num-box   { background:#312e81; padding:14px 16px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:80px; }
            .ch-sup       { font-family:'Inter',sans-serif; font-size:8pt; font-weight:700; color:#c4b5fd; margin-bottom:4px; }
            .ch-num       { font-family:'Inter',sans-serif; font-size:26pt; font-weight:700; color:#fff; line-height:1; }
            .ch-title-box { background:#4361ee; padding:16px 20px; flex:1; display:flex; flex-direction:column; justify-content:center; }
            .ch-sup2      { font-family:'Inter',sans-serif; font-size:8pt; font-weight:700; color:#c4b5fd; margin-bottom:6px; }
            .ch-title     { font-size:17pt; font-weight:700; color:#fff; line-height:1.6; }
            .ch-desc      { color:#64748b; font-size:10pt; margin-bottom:16px; line-height:2; }

            /* ─ Lesson ─ */
            .lesson    { margin-bottom:8px; }
            .ls-header { display:flex; margin:22px 0 10px; }
            .ls-num    { background:#4361ee; color:#fff; font-family:'Inter',sans-serif; font-size:8pt; font-weight:700; padding:8px 10px; display:flex; align-items:center; min-width:44px; justify-content:center; }
            .ls-title  { background:#edf2ff; border-left:3.5px solid #4361ee; padding:8px 14px; font-size:12pt; font-weight:700; color:#0f172a; flex:1; line-height:1.7; }
            .ls-body   { font-size:11pt; line-height:2; color:#334155; margin-bottom:8px; }
            .ls-body p { margin-bottom:8px; }
            .ls-body ul{ padding-left:20px; }
            .ls-body li{ margin-bottom:3px; line-height:2; }
            .h-rule    { border:none; border-top:.75px solid #e2e8f0; margin:14px 0 4px; }

            /* ─ Code Snippet ─ */
            .snippet    { margin:12px 0 4px; }
            .sn-header  { display:flex; align-items:stretch; border-top:2.5px solid var(--lc,#4361ee); }
            .sn-dots    { background:#252526; padding:8px 12px; display:flex; align-items:center; gap:5px; }
            .dot        { width:10px; height:10px; border-radius:50%; display:inline-block; }
            .dr         { background:#ff6059; }
            .dy         { background:#ffbd2e; }
            .dg         { background:#28c840; }
            .sn-title   { background:#252526; padding:8px 10px; font-size:9.5pt; font-weight:600; color:#d4d4d4; flex:1; display:flex; align-items:center; line-height:1.6; }
            .sn-lang    { font-family:'Courier New',monospace; font-size:7.5pt; font-weight:700; color:#fff; padding:0 14px; display:flex; align-items:center; background:var(--lc,#4361ee); }
            .sn-body    { display:flex; background:#1e1e1e; }
            .sn-gutter  { background:#2a2a2a; border-right:1px solid #3c3c3c; padding:12px 8px; font-family:'Courier New',monospace; font-size:8pt; color:#636363; line-height:1.7; text-align:right; min-width:36px; white-space:pre; }
            .sn-code    { padding:12px 14px; font-family:'Courier New',monospace; font-size:8.5pt; color:#d4d4d4; line-height:1.7; flex:1; white-space:pre; overflow-x:hidden; }
            .sn-foot    { height:2px; background:var(--lc,#4361ee); }

            /* ─ Note / Output ─ */
            .note-block { background:#d1fae5; border-left:3.5px solid #10b981; padding:10px 12px; margin:4px 0 16px; font-size:9.5pt; line-height:1.9; }
            .note-lbl   { font-family:'Inter',sans-serif; font-weight:700; color:#10b981; margin-right:6px; }
            .out-block  { margin:4px 0 14px; }
            .out-lbl    { background:#14b8a6; padding:4px 14px; font-family:'Courier New',monospace; font-size:7.5pt; color:#fff; }
            .out-body   { background:#16183b; border-left:3px solid #14b8a6; padding:9px 14px; font-family:'Courier New',monospace; font-size:8.5pt; color:#a3e6b4; line-height:1.7; white-space:pre; }
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