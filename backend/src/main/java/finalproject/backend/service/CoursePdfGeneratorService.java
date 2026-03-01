package finalproject.backend.service;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import finalproject.backend.modal.Chapter;
import finalproject.backend.modal.CodeSnippet;
import finalproject.backend.modal.Course;
import finalproject.backend.modal.Lesson;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;


@Slf4j
@Service
public class CoursePdfGeneratorService {


    // ── Color Palette ─────────────────────────────────────────────────────────
    private static final Color C_COVER_BG     = new Color(15,  23,  42);   // slate-900
    private static final Color C_PRIMARY      = new Color(37,  99, 235);   // blue-600
    private static final Color C_SUCCESS      = new Color(22, 163,  74);   // green-600
    private static final Color C_HEADING      = new Color(15,  23,  42);   // slate-900
    private static final Color C_BODY         = new Color(51,  65,  85);   // slate-700
    private static final Color C_MUTED        = new Color(100,116, 139);   // slate-500
    private static final Color C_WHITE        = Color.WHITE;
    private static final Color C_CODE_BG      = new Color(248,250, 252);   // slate-50
    private static final Color C_CODE_BORDER  = new Color(226,232, 240);   // slate-200
    private static final Color C_CHAPTER_BG   = new Color(37,  99, 235);   // blue-600
    private static final Color C_DIVIDER      = new Color(226,232, 240);   // slate-200
    private static final Color C_BADGE_BG     = new Color(219,234, 254);   // blue-100
    private static final Color C_BADGE_TEXT   = new Color(29,  78, 216);   // blue-700
    private static final Color C_COVER_TEXT2  = new Color(148,163, 184);   // slate-400

    // ── Fonts ─────────────────────────────────────────────────────────────────
    private Font fCoverTitle()  { return new Font(Font.HELVETICA, 28, Font.BOLD,   C_WHITE);      }
    private Font fCoverSub()    { return new Font(Font.HELVETICA, 12, Font.NORMAL, C_COVER_TEXT2);}
    private Font fCoverBadge()  { return new Font(Font.HELVETICA, 10, Font.BOLD,   C_WHITE);      }
    private Font fTocHeading()  { return new Font(Font.HELVETICA, 16, Font.BOLD,   C_HEADING);    }
    private Font fTocChapter()  { return new Font(Font.HELVETICA, 11, Font.BOLD,   C_PRIMARY);    }
    private Font fTocLesson()   { return new Font(Font.HELVETICA, 10, Font.NORMAL, C_BODY);       }
    private Font fChapterNum()  { return new Font(Font.HELVETICA, 10, Font.BOLD,   C_WHITE);      }
    private Font fChapterTitle(){ return new Font(Font.HELVETICA, 16, Font.BOLD,   C_WHITE);      }
    private Font fLessonTitle() { return new Font(Font.HELVETICA, 13, Font.BOLD,   C_HEADING);    }
    private Font fBody()        { return new Font(Font.HELVETICA, 11, Font.NORMAL, C_BODY);       }
    private Font fCodeLabel()   { return new Font(Font.HELVETICA,  9, Font.BOLD,   C_MUTED);      }
    private Font fCode()        { return new Font(Font.COURIER,   10, Font.NORMAL, C_BODY);       }
    private Font fExplain()     { return new Font(Font.HELVETICA, 10, Font.ITALIC, C_SUCCESS);    }
    private Font fFooter()      { return new Font(Font.HELVETICA,  8, Font.NORMAL, C_MUTED);      }
    private Font fPage()        { return new Font(Font.HELVETICA,  9, Font.NORMAL, C_MUTED);      }

    // ═════════════════════════════════════════════════════════════════════════
    //  PUBLIC — Main entry point
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * Generate PDF bytes from a fully-loaded Course entity.
     * Course must have chapters → lessons → codeSnippets eagerly fetched.
     */
    public byte[] generate(Course course) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4, 50, 50, 70, 60);
            PdfWriter writer = PdfWriter.getInstance(doc, out);

            // Register page event for header/footer on every page
            writer.setPageEvent(new HeaderFooterEvent(course));

            doc.open();

            // 1. Cover page
            buildCoverPage(doc, writer, course);
            doc.newPage();

            // 2. Table of Contents
            buildTableOfContents(doc, course);
            doc.newPage();

            // 3. Chapters
            for (Chapter chapter : course.getChapters()) {
                buildChapter(doc, chapter);
                doc.newPage();
            }

            doc.close();
            log.info("✅ PDF generated for course='{}' pages={}", course.getSlug(), writer.getPageNumber());
            return out.toByteArray();

        } catch (Exception e) {
            log.error("❌ PDF generation failed for courseId={}: {}", course.getId(), e.getMessage(), e);
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  1. COVER PAGE
    // ═════════════════════════════════════════════════════════════════════════

    private void buildCoverPage(Document doc, PdfWriter writer, Course course) throws Exception {
        // Dark background rectangle filling the full page
        PdfContentByte canvas = writer.getDirectContentUnder();
        canvas.setColorFill(C_COVER_BG);
        canvas.rectangle(0, 0, PageSize.A4.getWidth(), PageSize.A4.getHeight());
        canvas.fill();

        // Accent bar at top
        canvas.setColorFill(C_PRIMARY);
        canvas.rectangle(0, PageSize.A4.getHeight() - 8, PageSize.A4.getWidth(), 8);
        canvas.fill();

        // Spacer
        addEmptyLines(doc, 6);

        // Course title
        Paragraph title = new Paragraph(course.getTitle(), fCoverTitle());
        title.setAlignment(Element.ALIGN_LEFT);
        title.setSpacingAfter(12);
        doc.add(title);

        // Description
        if (course.getDescription() != null) {
            Paragraph desc = new Paragraph(course.getDescription(), fCoverSub());
            desc.setAlignment(Element.ALIGN_LEFT);
            desc.setSpacingAfter(32);
            doc.add(desc);
        }

        // Divider line
        addDivider(doc, C_PRIMARY);
        addEmptyLines(doc, 1);

        // Badges row: Level | Language | Lessons | Free/Paid
        PdfPTable badges = new PdfPTable(4);
        badges.setWidthPercentage(70);
        badges.setHorizontalAlignment(Element.ALIGN_LEFT);
        badges.setSpacingAfter(32);
        badges.addCell(badge("📊 " + course.getLevel(),       new Color(79, 70, 229)));
        badges.addCell(badge("🌐 " + course.getLanguage(),    new Color(8, 145, 178)));
        badges.addCell(badge("📚 " + course.getTotalLessons() + " Lessons", C_PRIMARY));
        badges.addCell(badge(course.getIsFree() ? "✅ FREE" : "💎 PREMIUM",
                course.getIsFree() ? C_SUCCESS : new Color(217, 119, 6)));
        doc.add(badges);

        // Instructor
        String instructor = course.getInstructor() != null ? course.getInstructor().getUsername() : "Code Khmer";
        Paragraph ins = new Paragraph("👤  Instructor: " + instructor, fCoverSub());
        ins.setSpacingAfter(6);
        doc.add(ins);

        // Generated date
        Paragraph date = new Paragraph(
                "📅  Generated: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")),
                fCoverSub());
        date.setSpacingAfter(6);
        doc.add(date);

        // Website
        Paragraph site = new Paragraph("🌍  codekhmerlearning.site", fCoverSub());
        doc.add(site);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  2. TABLE OF CONTENTS
    // ═════════════════════════════════════════════════════════════════════════

    private void buildTableOfContents(Document doc, Course course) throws Exception {
        Paragraph tocHeading = new Paragraph("📋  Table of Contents", fTocHeading());
        tocHeading.setSpacingAfter(16);
        doc.add(tocHeading);

        addDivider(doc, C_PRIMARY);
        addEmptyLines(doc, 1);

        for (Chapter chapter : course.getChapters()) {
            // Chapter row
            Paragraph chRow = new Paragraph(
                    "Chapter " + chapter.getOrderIndex() + ":  " + chapter.getTitle(),
                    fTocChapter());
            chRow.setSpacingBefore(10);
            chRow.setSpacingAfter(4);
            doc.add(chRow);

            // Lesson rows indented
            for (Lesson lesson : chapter.getLessons()) {
                Paragraph lRow = new Paragraph(
                        "      " + chapter.getOrderIndex() + "." + lesson.getOrderIndex()
                                + "   " + lesson.getTitle(), fTocLesson());
                lRow.setSpacingAfter(2);
                doc.add(lRow);
            }
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  3. CHAPTER + LESSONS
    // ═════════════════════════════════════════════════════════════════════════

    private void buildChapter(Document doc, Chapter chapter) throws Exception {
        // Chapter header — colored full-width banner
        PdfPTable banner = new PdfPTable(1);
        banner.setWidthPercentage(100);
        banner.setSpacingAfter(20);

        Phrase chapterPhrase = new Phrase();
        chapterPhrase.add(new Chunk("  CHAPTER " + chapter.getOrderIndex() + "\n", fChapterNum()));
        chapterPhrase.add(new Chunk("  " + chapter.getTitle(), fChapterTitle()));

        PdfPCell bannerCell = new PdfPCell(chapterPhrase);
        bannerCell.setBackgroundColor(C_CHAPTER_BG);
        bannerCell.setPadding(16);
        bannerCell.setBorder(Rectangle.NO_BORDER);
        banner.addCell(bannerCell);
        doc.add(banner);

        // Lessons
        for (Lesson lesson : chapter.getLessons()) {
            buildLesson(doc, chapter, lesson);
        }
    }

    // ─── Lesson ──────────────────────────────────────────────────────────────

    private void buildLesson(Document doc, Chapter chapter, Lesson lesson) throws Exception {
        // Lesson title
        Paragraph lessonTitle = new Paragraph(
                chapter.getOrderIndex() + "." + lesson.getOrderIndex() + "  " + lesson.getTitle(),
                fLessonTitle());
        lessonTitle.setSpacingBefore(16);
        lessonTitle.setSpacingAfter(8);
        doc.add(lessonTitle);

        // Lesson content (description)
        if (lesson.getContent() != null && !lesson.getContent().isBlank()) {
            // Split by \n to preserve paragraph breaks from DB
            for (String line : lesson.getContent().split("\n\n")) {
                if (line.isBlank()) continue;
                Paragraph p = new Paragraph(line.trim(), fBody());
                p.setLeading(16);
                p.setSpacingAfter(6);
                doc.add(p);
            }
        }

        // Code Snippets
        for (CodeSnippet cs : lesson.getCodeSnippets()) {
            buildCodeSnippet(doc, cs);
        }

        // Thin divider after each lesson
        addDivider(doc, C_DIVIDER);
    }

    // ─── Code Snippet Block ───────────────────────────────────────────────────

    private void buildCodeSnippet(Document doc, CodeSnippet cs) throws Exception {
        addEmptyLines(doc, 1);

        // Label: language tag
        String lang = cs.getLanguage() != null ? cs.getLanguage().toUpperCase() : "CODE";
        Paragraph label = new Paragraph(
                (cs.getTitle() != null ? cs.getTitle() + "   " : "") + "[ " + lang + " ]",
                fCodeLabel());
        label.setSpacingAfter(4);
        doc.add(label);

        // Code block table (gray background, monospace)
        PdfPTable codeTable = new PdfPTable(1);
        codeTable.setWidthPercentage(100);
        codeTable.setSpacingAfter(6);

        PdfPCell codeCell = new PdfPCell();
        codeCell.setBackgroundColor(C_CODE_BG);
        codeCell.setBorderColor(C_CODE_BORDER);
        codeCell.setBorderWidth(1f);
        codeCell.setPadding(12);

        // Preserve code formatting line by line
        Phrase codePhrase = new Phrase();
        String[] lines = cs.getCode().split("\n");
        for (int i = 0; i < lines.length; i++) {
            codePhrase.add(new Chunk(lines[i], fCode()));
            if (i < lines.length - 1) codePhrase.add(Chunk.NEWLINE);
        }
        codeCell.addElement(new Phrase(codePhrase));
        codeTable.addCell(codeCell);
        doc.add(codeTable);

        // Explanation (tip)
        if (cs.getExplanation() != null && !cs.getExplanation().isBlank()) {
            Paragraph tip = new Paragraph("💡  " + cs.getExplanation(), fExplain());
            tip.setSpacingAfter(12);
            doc.add(tip);
        }

        addEmptyLines(doc, 1);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  HELPERS
    // ═════════════════════════════════════════════════════════════════════════

    private PdfPCell badge(String text, Color bgColor) {
        Phrase p = new Phrase(text, new Font(Font.HELVETICA, 9, Font.BOLD, C_WHITE));
        PdfPCell cell = new PdfPCell(p);
        cell.setBackgroundColor(bgColor);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setBorderWidthRight(4);
        cell.setBorderColorRight(C_WHITE);
        return cell;
    }

    private void addDivider(Document doc, Color color) throws Exception {
        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        line.setSpacingBefore(4);
        line.setSpacingAfter(4);
        PdfPCell cell = new PdfPCell(new Phrase(" "));
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(color);
        cell.setBorderWidthBottom(1f);
        cell.setPaddingBottom(4);
        line.addCell(cell);
        doc.add(line);
    }

    private void addEmptyLines(Document doc, int count) throws Exception {
        for (int i = 0; i < count; i++) doc.add(Chunk.NEWLINE);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  HEADER / FOOTER — runs on every page
    // ═════════════════════════════════════════════════════════════════════════

    private static class HeaderFooterEvent extends PdfPageEventHelper {
        private final Course course;

        HeaderFooterEvent(Course course) { this.course = course; }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();

            // ── Footer ────────────────────────────────────────────────────
            // Left: course title
            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                    new Phrase(course.getTitle(),
                            new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(100, 116, 139))),
                    document.left(), document.bottom() - 20, 0);

            // Center: site name
            ColumnText.showTextAligned(cb, Element.ALIGN_CENTER,
                    new Phrase("codekhmerlearning.site",
                            new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(100, 116, 139))),
                    (document.right() + document.left()) / 2, document.bottom() - 20, 0);

            // Right: page number
            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase("Page " + writer.getPageNumber(),
                            new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(100, 116, 139))),
                    document.right(), document.bottom() - 20, 0);

            // Footer line
            cb.setColorStroke(new Color(226, 232, 240));
            cb.setLineWidth(0.5f);
            cb.moveTo(document.left(), document.bottom() - 10);
            cb.lineTo(document.right(), document.bottom() - 10);
            cb.stroke();
        }
    }
}
