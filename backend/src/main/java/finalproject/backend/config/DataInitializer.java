package finalproject.backend.config;

import finalproject.backend.modal.*;
import finalproject.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;


@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository        roleRepository;
    private final UserRepository        userRepository;
    private final CategoryRepository    categoryRepository;
    private final CourseRepository      courseRepository;
    private final ChapterRepository     chapterRepository;
    private final LessonRepository      lessonRepository;
    private final CodeSnippetRepository codeSnippetRepository;
    private final PasswordEncoder       passwordEncoder;

    // ══════════════════════════════════════════════════════════════════════════
    @Override
    @Transactional
    public void run(String... args) {
        seedRoles();
        seedAdmin();
        seedAll();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ROLES & ADMIN
    // ══════════════════════════════════════════════════════════════════════════

    private void seedRoles() {
        for (String r : List.of("USER", "MODERATOR", "ADMIN"))
            if (roleRepository.findByName(r).isEmpty())
                roleRepository.save(Role.builder().name(r).build());
    }

    private void seedAdmin() {
        if (userRepository.existsByUsername("admin")) return;
        userRepository.save(User.builder()
                .username("admin")
                .email("admin@codekhmerlearning.site")
                .password(passwordEncoder.encode("Admin@1234"))
                .status("ACTIVE")
                .roles(Set.of(
                        roleRepository.findByName("ADMIN").orElseThrow(),
                        roleRepository.findByName("USER").orElseThrow()))
                .build());
        log.info("✅ Admin seeded → admin / Admin@1234");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // MAIN SEED
    // ══════════════════════════════════════════════════════════════════════════

    private void seedAll() {
        User ins = userRepository.findByUsername("admin").orElseThrow();

        // ── Categories ────────────────────────────────────────────────────────
        Category webDev  = cat("ការអភិវឌ្ឍន៍គេហទំព័រ", "web-development",
                "HTML, CSS, JavaScript ពីដំបូងរហូតដល់ Framework ទំនើប", 1);
        Category fe      = cat("Frontend Engineering", "frontend-engineering",
                "React.js, Next.js, TypeScript, Tailwind CSS", 2);
        Category be      = cat("Backend Engineering",  "backend-engineering",
                "Java, Spring Boot, REST API, JPA, Security", 3);
        Category devops  = cat("DevOps & Tools",       "devops-tools",
                "Git, Docker, CI/CD, GitHub Actions", 4);

        // ── Courses ───────────────────────────────────────────────────────────
        seedHTML      (ins, webDev);
        seedCSS       (ins, webDev);
        seedJavaScript(ins, webDev);
        seedReact     (ins, fe);
        seedNextJS    (ins, fe);
        seedJava      (ins, be);
        seedSpringBoot(ins, be);
        seedGit       (ins, devops);

        log.info("✅ All {} courses seeded.", courseRepository.count());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 1. HTML
    // ══════════════════════════════════════════════════════════════════════════
    private void seedHTML(User ins, Category cat) {
        Course c = course("HTML សម្រាប់អ្នកចាប់ផ្តើម", "html-for-beginners-km",
                "រៀន HTML ពីដំបូងរហូតដល់ Semantic HTML5 ជាភាសាខ្មែរ។ " +
                        "Tags, Elements, Forms, Tables, Accessibility ។",
                "BEGINNER", true, ins, cat);

        // Ch1
        Chapter ch1 = ch(c, "ការណែនាំអំពី HTML", 1);
        Lesson l1 = ls(ch1, c, "HTML គឺជាអ្វី?", 1,
                "HTML (HyperText Markup Language) ជាភាសាស្តង់ដារសម្រាប់បង្កើតទំព័រគេហទំព័រ។\n\n" +
                        "HTML ពណ៌នារចនាសម្ព័ន្ធទំព័រដោយប្រើ markup tags។ Browser អានឯកសារ HTML ហើយបង្ហាញជា visual page។\n\n" +
                        "HTML Elements ជាតំណាងនៃផ្នែកផ្សេងៗ ដូចជា ចំណងជើង, កថាខណ្ឌ, តំណ, រូបភាព ។");
        sn(l1, "HTML Document មូលដ្ឋាន", """
                <!DOCTYPE html>
                <html lang="km">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>ទំព័រដំបូងរបស់ខ្ញុំ</title>
                </head>
                <body>
                    <h1>សួស្តី ពិភពលោក!</h1>
                    <p>នេះគឺជាទំព័រ HTML ដំបូងរបស់ខ្ញុំ។</p>
                </body>
                </html>""", "html",
                "DOCTYPE ប្រាប់ browser ថានេះ HTML5 ។ head = metadata ។ body = មាតិកា ។", 1);

        Lesson l2 = ls(ch1, c, "HTML Tags និង Elements", 2,
                "Tag ជាឈ្មោះ element ក្នុង angle brackets < > ។\n\n" +
                        "Elements ភាគច្រើនមាន opening tag <tag> និង closing tag </tag> ។\n\n" +
                        "Void elements ដូចជា <br>, <hr>, <img> គ្មាន closing tag ។");
        sn(l2, "Basic HTML Tags", """
                <!-- Headings h1 ធំបំផុត h6 តូចបំផុត -->
                <h1>ចំណងជើងកម្រិត ១</h1>
                <h2>ចំណងជើងកម្រិត ២</h2>
                <h3>ចំណងជើងកម្រិត ៣</h3>

                <!-- Paragraph -->
                <p>នេះជាកថាខណ្ឌ។ HTML ignore spaces ច្រើន ។</p>

                <!-- Text formatting -->
                <strong>អត្ថបទដិត (important)</strong>
                <em>អត្ថបទទ្រេត (emphasis)</em>
                <mark>អត្ថបទ highlight</mark>
                <del>អត្ថបទដែលត្រូវបានលុប</del>

                <!-- Whitespace -->
                <br>   <!-- line break -->
                <hr>   <!-- horizontal line -->""", "html",
                "h1 ប្រើតែ ១ ដងក្នុង ១ page ។ strong/em ផ្ដល់ semantic meaning ។", 1);

        // Ch2
        Chapter ch2 = ch(c, "Links, Images និង Lists", 2);
        Lesson l3 = ls(ch2, c, "Hyperlinks", 1,
                "Anchor tag <a> ប្រើដើម្បីបង្កើត hyperlinks ។\n\n" +
                        "href attribute ផ្ដល់ URL ។ target='_blank' បើក tab ថ្មី ។\n\n" +
                        "Link អាចជា absolute URL ឬ relative path ។");
        sn(l3, "Links - ប្រភេទផ្សេងៗ", """
                <!-- Absolute URL -->
                <a href="https://www.codekhmerlearning.site">Code Khmer Learning</a>

                <!-- Relative path -->
                <a href="about.html">អំពីយើង</a>
                <a href="../index.html">ទៅ folder ខ្ពស់ជាង</a>

                <!-- Tab ថ្មី -->
                <a href="https://google.com" target="_blank" rel="noopener">Google</a>

                <!-- Link ទៅ section ក្នុង page -->
                <a href="#section1">ទៅ Section 1</a>
                <section id="section1">...</section>

                <!-- Email link -->
                <a href="mailto:info@codekhmer.site">ផ្ញើ Email</a>

                <!-- Phone link -->
                <a href="tel:+85512345678">ទូរស័ព្ទ</a>""", "html",
                "rel='noopener' ជួយ security នៅពេល target='_blank' ។", 1);

        Lesson l4 = ls(ch2, c, "Images និង Lists", 2,
                "img tag ប្រើបង្ហាញរូបភាព ។ alt attribute ជាការពណ៌នា accessible ។\n\n" +
                        "ul (unordered) ប្រើ bullet points ។ ol (ordered) ប្រើ numbers ។ li = list item ។");
        sn(l4, "Images", """
                <!-- Image មូលដ្ឋាន -->
                <img src="logo.png" alt="Logo Code Khmer" width="200" height="100">

                <!-- Image ពី URL -->
                <img src="https://example.com/photo.jpg"
                     alt="ពណ៌នា image"
                     loading="lazy">

                <!-- Responsive image -->
                <img src="hero.jpg" alt="Hero image"
                     style="max-width: 100%; height: auto;">""", "html",
                "alt text សំខាន់ណាស់ សម្រាប់ screen readers និង SEO ។ loading='lazy' ធ្វើ performance ល្អ ។", 1);
        sn(l4, "Lists", """
                <!-- Unordered List - bullet points -->
                <ul>
                    <li>HTML</li>
                    <li>CSS</li>
                    <li>JavaScript</li>
                </ul>

                <!-- Ordered List - numbers -->
                <ol>
                    <li>រៀន HTML</li>
                    <li>រៀន CSS</li>
                    <li>រៀន JavaScript</li>
                </ol>

                <!-- Nested List -->
                <ul>
                    <li>Frontend
                        <ul>
                            <li>HTML</li>
                            <li>CSS</li>
                            <li>JavaScript</li>
                        </ul>
                    </li>
                    <li>Backend
                        <ul>
                            <li>Java</li>
                            <li>Spring Boot</li>
                        </ul>
                    </li>
                </ul>""", "html", "li ត្រូវវាងក្នុង ul ឬ ol ។ Nested list = list ក្នុង list ។", 2);

        // Ch3
        Chapter ch3 = ch(c, "Forms និង Input", 3);
        Lesson l5 = ls(ch3, c, "HTML Forms", 1,
                "Form element ប្រមូលទិន្នន័យពីអ្នកប្រើ ។\n\n" +
                        "action = URL ដែលទិន្នន័យត្រូវបញ្ជូន ។ method = GET ឬ POST ។\n\n" +
                        "Input types: text, email, password, number, checkbox, radio, file, date ។");
        sn(l5, "Form ចុះឈ្មោះ Registration", """
                <form action="/api/v1/auth/register" method="POST">

                    <!-- Text input -->
                    <label for="name">ឈ្មោះពេញ:</label>
                    <input type="text" id="name" name="name"
                           placeholder="បញ្ចូលឈ្មោះ" required minlength="2">

                    <!-- Email input -->
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email"
                           placeholder="example@email.com" required>

                    <!-- Password input -->
                    <label for="password">ពាក្យសម្ងាត់:</label>
                    <input type="password" id="password" name="password"
                           placeholder="Min 8 characters" required minlength="8">

                    <!-- Select dropdown -->
                    <label for="level">កម្រិត:</label>
                    <select id="level" name="level">
                        <option value="">-- ជ្រើសរើស --</option>
                        <option value="beginner">អ្នកចាប់ផ្ដើម</option>
                        <option value="intermediate">មធ្យម</option>
                        <option value="advanced">កម្រិតខ្ពស់</option>
                    </select>

                    <!-- Checkbox -->
                    <input type="checkbox" id="terms" name="terms" required>
                    <label for="terms">យល់ព្រមលក្ខខណ្ឌ</label>

                    <!-- Submit button -->
                    <button type="submit">ចុះឈ្មោះ</button>
                    <button type="reset">លុបទម្រង់</button>
                </form>""", "html",
                "label for= ត្រូវ match input id= ។ required ធ្វើ validation ក្នុង browser ។", 1);

        // Ch4
        Chapter ch4 = ch(c, "Semantic HTML5", 4);
        Lesson l6 = ls(ch4, c, "Semantic Elements", 1,
                "Semantic HTML ប្រើ tags ដែលមានន័យច្បាស់ ជំនួស <div> ទូទៅ ។\n\n" +
                        "ជួយ SEO: search engines យល់ content structure ។\n\n" +
                        "ជួយ Accessibility: screen readers navigate ល្អ ។");
        sn(l6, "Semantic Page Layout", """
                <!DOCTYPE html>
                <html lang="km">
                <head>
                    <meta charset="UTF-8">
                    <title>Code Khmer Learning</title>
                </head>
                <body>

                    <!-- Header - logo + navigation -->
                    <header>
                        <a href="/" class="logo">Code Khmer</a>
                        <nav>
                            <a href="/">ដើម</a>
                            <a href="/courses">វគ្គសិក្សា</a>
                            <a href="/about">អំពីយើង</a>
                        </nav>
                    </header>

                    <!-- Main content area -->
                    <main>
                        <!-- Group of related content -->
                        <section id="featured-courses">
                            <h2>វគ្គសិក្សាពេញនិយម</h2>

                            <!-- Self-contained content -->
                            <article class="course-card">
                                <h3>HTML សម្រាប់អ្នកចាប់ផ្ដើម</h3>
                                <p>រៀន HTML ពីដំបូង...</p>
                                <a href="/courses/html">ចូលរៀន</a>
                            </article>

                            <article class="course-card">
                                <h3>CSS Styling</h3>
                                <p>រចនាទំព័រ...</p>
                            </article>
                        </section>
                    </main>

                    <!-- Secondary info (sidebar) -->
                    <aside>
                        <h3>ការប្រកាស</h3>
                        <p>វគ្គ React ថ្មីបានចេញ!</p>
                    </aside>

                    <!-- Footer -->
                    <footer>
                        <p>&copy; 2026 Code Khmer Learning. រក្សាសិទ្ធគ្រប់យ៉ាង។</p>
                    </footer>

                </body>
                </html>""", "html",
                "ប្រើ semantic elements ជំនួស <div class='header'> ។ ១ <main> ក្នុង ១ page ។", 1);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. CSS
    // ══════════════════════════════════════════════════════════════════════════
    private void seedCSS(User ins, Category cat) {
        Course c = course("CSS Styling ជាភាសាខ្មែរ", "css-styling-khmer",
                "រៀន CSS ពីដំបូងរហូតដល់ Flexbox, Grid, Animations ជាភាសាខ្មែរ។ " +
                        "រចនាទំព័រ responsive ដ៏ស្រស់ស្អាត ។",
                "BEGINNER", true, ins, cat);

        // Ch1
        Chapter ch1 = ch(c, "ការណែនាំអំពី CSS", 1);
        Lesson l1 = ls(ch1, c, "CSS គឺជាអ្វី?", 1,
                "CSS (Cascading Style Sheets) ប្រើដើម្បីកំណត់ style (ពណ៌, ទំហំ, ទីតាំង) ជូន HTML elements ។\n\n" +
                        "CSS មាន ៣ វិធីដើម្បី apply: Inline, Internal (<style>), External (.css file) ។\n\n" +
                        "External CSS ល្អបំផុត ព្រោះ reusable ហើយ separate concerns ។");
        sn(l1, "CSS ៣ វិធី", """
                <!-- 1. Inline CSS (មិនណែនាំ) -->
                <h1 style="color: red; font-size: 32px;">ចំណងជើង</h1>

                <!-- 2. Internal CSS -->
                <head>
                    <style>
                        h1 { color: blue; }
                        p  { font-size: 16px; }
                    </style>
                </head>

                <!-- 3. External CSS (ល្អបំផុត) -->
                <head>
                    <link rel="stylesheet" href="styles.css">
                </head>""", "css",
                "External CSS ល្អជាងគេ ព្រោះ reuse បាន និង browser cache ។", 1);

        Lesson l2 = ls(ch1, c, "CSS Selectors", 2,
                "Selectors ជ្រើសរើស HTML elements ដើម្បី apply styles ។\n\n" +
                        "Element selector, Class selector (.), ID selector (#), Attribute selector, Pseudo-class (:hover) ។\n\n" +
                        "Specificity: ID (100) > Class (10) > Element (1) ។");
        sn(l2, "CSS Selectors", """
                /* Element selector */
                h1 { color: #2c3e50; }
                p  { line-height: 1.6; }

                /* Class selector (ប្រើញឹកញាប់ជាងគេ) */
                .card        { border-radius: 8px; padding: 16px; }
                .card-title  { font-size: 20px; font-weight: bold; }
                .btn-primary { background: #3b82f6; color: white; }

                /* ID selector (unique - ១ page ១ element) */
                #navbar { position: fixed; top: 0; }

                /* Descendant - ក្នុង card ទាំងអស់ */
                .card p { color: #6b7280; }

                /* Pseudo-class */
                a:hover          { color: #3b82f6; text-decoration: underline; }
                button:active    { transform: scale(0.98); }
                input:focus      { outline: 2px solid #3b82f6; }
                li:first-child   { font-weight: bold; }
                li:nth-child(2n) { background: #f9fafb; }""", "css",
                "ប្រើ class selectors ជានិច្ច ។ ID selector ប្រើតែ ១ ដង ។ Specificity គ្រប់គ្រង style ណាដែលឈ្នះ ។", 1);

        // Ch2
        Chapter ch2 = ch(c, "Box Model & Layout", 2);
        Lesson l3 = ls(ch2, c, "CSS Box Model", 1,
                "Box Model ជាគំនិតស្នូល CSS ។ Element ទាំងអស់ជា box មាន ៤ layer:\n\n" +
                        "Content → Padding → Border → Margin\n\n" +
                        "box-sizing: border-box ធ្វើឱ្យ width/height include padding + border ។");
        sn(l3, "Box Model", """
                /* Box Model Visualization */
                .card {
                    /* Content */
                    width: 300px;
                    height: 200px;

                    /* Padding - space inside border */
                    padding: 16px;                /* ៤ sides ស្មើ */
                    padding: 16px 24px;           /* top/bottom left/right */
                    padding: 8px 12px 16px 20px; /* top right bottom left */

                    /* Border */
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;

                    /* Margin - space outside border */
                    margin: 16px auto; /* center horizontally */

                    /* Include padding+border in width */
                    box-sizing: border-box;

                    /* Background */
                    background-color: #ffffff;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                /* Reset - apply to all elements */
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }""", "css",
                "* { box-sizing: border-box } ជា CSS reset ដែលត្រូវ apply ជានិច្ច ។", 1);

        Lesson l4 = ls(ch2, c, "Flexbox Layout", 2,
                "Flexbox ជា layout method ដ៏ powerful ។ ប្រើ display: flex ។\n\n" +
                        "justify-content គ្រប់គ្រង main axis (horizontal) ។\n\n" +
                        "align-items គ្រប់គ្រង cross axis (vertical) ។");
        sn(l4, "Flexbox", """
                /* Flex Container */
                .navbar {
                    display: flex;
                    justify-content: space-between; /* left/right */
                    align-items: center;            /* center vertically */
                    padding: 0 24px;
                    height: 64px;
                    background: #1e293b;
                }

                /* Flex ចែក 3 column ស្មើ */
                .course-grid {
                    display: flex;
                    gap: 24px;
                    flex-wrap: wrap; /* ចុះបន្ទាត់ thead screen តូច */
                }
                .course-card {
                    flex: 1;
                    min-width: 280px; /* minimum width */
                }

                /* Center ពេញ screen */
                .hero {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    flex-direction: column;
                    gap: 16px;
                }""", "css",
                "flex-wrap: wrap ជួយ responsive ។ gap ជំនួស margin ។ flex: 1 ចែក space ស្មើ ។", 1);

        Lesson l5 = ls(ch2, c, "CSS Grid Layout", 3,
                "CSS Grid ជា 2D layout system ។ ល្អសម្រាប់ page layouts ។\n\n" +
                        "grid-template-columns គ្រប់គ្រងជួរឈរ ។\n\n" +
                        "Flexbox ល្អសម្រាប់ 1D (row/column) ។ Grid ល្អសម្រាប់ 2D ។");
        sn(l5, "CSS Grid", """
                /* Basic Grid - 3 columns ស្មើ */
                .courses {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    padding: 24px;
                }

                /* Responsive Grid */
                .courses {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }

                /* Page Layout */
                .page {
                    display: grid;
                    grid-template-columns: 280px 1fr;  /* sidebar + content */
                    grid-template-rows: 64px 1fr 60px; /* header + main + footer */
                    min-height: 100vh;
                }
                .header  { grid-column: 1 / -1; } /* span all columns */
                .footer  { grid-column: 1 / -1; }""", "css",
                "auto-fill + minmax ធ្វើ responsive grid ដោយ automatic ។ 1fr = 1 fraction of space ។", 1);

        // Ch3
        Chapter ch3 = ch(c, "Colors, Typography & Effects", 3);
        Lesson l6 = ls(ch3, c, "Colors & Typography", 1,
                "CSS Colors: named, hex (#fff), rgb(), hsl(), rgba() ។\n\n" +
                        "Typography: font-family, font-size, font-weight, line-height, letter-spacing ។\n\n" +
                        "Google Fonts ដើម្បីប្រើ fonts ស្រស់ស្អាត ។");
        sn(l6, "Colors & Fonts", """
                /* CSS Variables - Color System */
                :root {
                    --color-primary:   #3b82f6;
                    --color-secondary: #8b5cf6;
                    --color-success:   #22c55e;
                    --color-danger:    #ef4444;
                    --color-text:      #1e293b;
                    --color-muted:     #64748b;
                    --color-bg:        #f8fafc;
                }

                /* Typography */
                @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700&display=swap');

                body {
                    font-family: 'Kantumruy Pro', sans-serif; /* Khmer font */
                    font-size: 16px;
                    line-height: 1.6;
                    color: var(--color-text);
                    background: var(--color-bg);
                }

                h1 { font-size: 2.5rem;  font-weight: 700; line-height: 1.2; }
                h2 { font-size: 1.875rem; font-weight: 600; }
                h3 { font-size: 1.25rem;  font-weight: 600; }

                .text-muted   { color: var(--color-muted); }
                .text-primary { color: var(--color-primary); }""", "css",
                "Kantumruy Pro ជា Google Font ល្អសម្រាប់ Khmer ។ CSS variables ងាយ maintain ។", 1);

        // Ch4
        Chapter ch4 = ch(c, "Responsive Design", 4);
        Lesson l7 = ls(ch4, c, "Media Queries", 1,
                "Media Queries ធ្វើ stylesheet ខុសគ្នាតាម screen size ។\n\n" +
                        "Mobile-first approach: ចាប់ផ្ដើមមកពី mobile ហើយ add breakpoints ។\n\n" +
                        "Breakpoints ទូទៅ: sm (640px) md (768px) lg (1024px) xl (1280px) ។");
        sn(l7, "Responsive CSS", """
                /* Mobile First - default styles */
                .courses {
                    display: grid;
                    grid-template-columns: 1fr; /* 1 column mobile */
                    gap: 16px;
                    padding: 16px;
                }

                .sidebar {
                    display: none; /* hide sidebar on mobile */
                }

                /* Tablet: 768px+ */
                @media (min-width: 768px) {
                    .courses {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                        padding: 20px;
                    }
                }

                /* Desktop: 1024px+ */
                @media (min-width: 1024px) {
                    .courses {
                        grid-template-columns: repeat(3, 1fr);
                    }
                    .sidebar {
                        display: block; /* show sidebar on desktop */
                    }
                    .layout {
                        display: grid;
                        grid-template-columns: 260px 1fr;
                        gap: 32px;
                    }
                }""", "css",
                "Mobile-first = ចាប់ DefaultValue mobile ហើយ scale up ។ min-width ប្រើ mobile-first ។", 1);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 3. JAVASCRIPT
    // ══════════════════════════════════════════════════════════════════════════
    private void seedJavaScript(User ins, Category cat) {
        Course c = course("JavaScript ជាភាសាខ្មែរ", "javascript-khmer",
                "រៀន JavaScript ពីមូលដ្ឋានរហូតដល់ ES6+, DOM, Fetch API ជាភាសាខ្មែរ ។",
                "BEGINNER", true, ins, cat);

        Chapter ch1 = ch(c, "ការណែនាំ & Variables", 1);
        Lesson l1 = ls(ch1, c, "JavaScript គឺជាអ្វី?", 1,
                "JavaScript ជា programming language ដែលដំណើរការ browser ។ JS ធ្វើឱ្យ HTML interactive ។\n\n" +
                        "JS ប្រើក្នុង Frontend (browser), Backend (Node.js), Mobile (React Native) ។\n\n" +
                        "Dynamic typing: variable type កំណត់ automatically ។");
        sn(l1, "Hello World", """
                // console.log - print output
                console.log("សួស្តី ពិភពលោក!");
                console.log(42);
                console.log(true);
                console.log([1, 2, 3]);

                // comment
                // single line comment
                /* multi
                   line comment */

                // typeof - check data type
                console.log(typeof "Hello");  // string
                console.log(typeof 42);       // number
                console.log(typeof true);     // boolean
                console.log(typeof undefined);// undefined
                console.log(typeof null);     // object (JS quirk)""", "javascript",
                "console.log() ជាវិធីងាយបំផុតក្នុងការ debug ។ F12 ក្នុង browser បើក DevTools ។", 1);

        Lesson l2 = ls(ch1, c, "Variables & Data Types", 2,
                "const: value ថេរ (recommended) ។ let: value ប្ដូរបាន ។ var: function-scoped (avoid) ។\n\n" +
                        "JS Data Types: String, Number, Boolean, Null, Undefined, Object, Array ។");
        sn(l2, "Variables & Types", """
                // ✅ const - value មិនប្ដូរ
                const PI = 3.14159;
                const siteName = "Code Khmer Learning";
                const year = 2026;

                // ✅ let - value ប្ដូរបាន
                let studentName = "ដារ៉ា";
                let score = 85;
                score = 90; // OK

                // String
                const greeting = "សួស្តី";
                const message  = `ឈ្មោះ: ${studentName}, ពិន្ទុ: ${score}`; // template literal
                console.log(message);

                // Number
                const price  = 9.99;
                const total  = Math.round(price * 100) / 100;
                const random = Math.random(); // 0–1

                // Boolean
                const isLoggedIn = true;
                const isEmpty    = false;

                // Null & Undefined
                let user = null;        // intentionally empty
                let token;              // undefined - not yet assigned

                // Array
                const courses = ["HTML", "CSS", "JavaScript", "React"];
                console.log(courses[0]);     // HTML
                console.log(courses.length); // 4

                // Object
                const student = {
                    name: "ដារ៉ា",
                    age: 22,
                    skills: ["HTML", "CSS"],
                    address: { city: "ភ្នំពេញ", country: "កម្ពុជា" }
                };
                console.log(student.name);          // ដារ៉ា
                console.log(student.address.city);  // ភ្នំពេញ""", "javascript",
                "ប្រើ const ជានិច្ចកាល ។ Template literals (backtick) ជំនួស string concatenation (+) ។", 1);

        Chapter ch2 = ch(c, "Control Flow & Functions", 2);
        Lesson l3 = ls(ch2, c, "if/else, switch & Loops", 1,
                "if/else: execute code តាម condition ។ switch: check ច្រើន cases ។\n\n" +
                        "for loop, while loop, forEach, for...of ។");
        sn(l3, "Control Flow", """
                // if / else if / else
                const score = 87;
                if (score >= 90)      console.log("A - ឆ្នើម");
                else if (score >= 80) console.log("B - ល្អ");
                else if (score >= 70) console.log("C - មធ្យម");
                else                  console.log("F - ធ្លាក់");

                // Ternary operator
                const status = score >= 50 ? "✅ បាន" : "❌ ធ្លាក់";

                // switch
                const day = new Date().getDay();
                switch (day) {
                    case 0: console.log("ថ្ងៃអាទិត្យ"); break;
                    case 1: console.log("ថ្ងៃច័ន្ទ");   break;
                    case 6: console.log("ថ្ងៃសៅរ៍");    break;
                    default: console.log("ថ្ងៃធ្វើការ");
                }

                // for loop
                for (let i = 1; i <= 5; i++) console.log(`ជំហានទី ${i}`);

                // forEach
                ["HTML","CSS","JS"].forEach((lang, i) => console.log(`${i+1}. ${lang}`));

                // for...of (recommended for arrays)
                const skills = ["HTML", "CSS", "JS", "React"];
                for (const skill of skills) {
                    console.log(`📚 ${skill}`);
                }""", "javascript",
                "forEach ជំនួស for loop ។ for...of ច្បាស់ ។ ternary ខ្លី ។ === ប្រើ strict equality ។", 1);

        Lesson l4 = ls(ch2, c, "Functions & Arrow Functions", 2,
                "Function ជា reusable block of code ។\n\n" +
                        "Arrow function (=>) ខ្លី clean ។ Default parameters ។ Rest parameters (…) ។");
        sn(l4, "Functions", """
                // Function Declaration
                function greet(name) {
                    return `សួស្តី ${name}!`;
                }

                // Arrow Function ✅
                const add     = (a, b) => a + b;
                const square  = n => n * n;           // ១ parameter គ្មាន ()
                const sayHi   = () => "Hello!";       // គ្មាន parameter

                // Default parameters
                const welcome = (name = "Guest", lang = "km") =>
                    `Welcome ${name} [${lang}]`;
                console.log(welcome());           // Welcome Guest [km]
                console.log(welcome("ដារ៉ា", "en")); // Welcome ដារ៉ា [en]

                // Rest parameters
                const sum = (...nums) => nums.reduce((acc, n) => acc + n, 0);
                console.log(sum(1, 2, 3, 4, 5)); // 15

                // Destructuring in parameters
                const showCourse = ({ title, level, isFree }) =>
                    `${title} [${level}] ${isFree ? "FREE" : "PAID"}`;

                console.log(showCourse({
                    title: "React.js",
                    level: "INTERMEDIATE",
                    isFree: true
                }));""", "javascript",
                "Arrow functions ប្រើ this ពី outer scope ។ Destructuring params ធ្វើ code clean ។", 1);

        Chapter ch3 = ch(c, "Arrays, Objects & ES6+", 3);
        Lesson l5 = ls(ch3, c, "Array Methods", 1,
                "map(), filter(), reduce(), find(), some(), every(), includes() ។\n\n" +
                        "Spread operator (...) copy/merge arrays ។\n\n" +
                        "Array destructuring ។");
        sn(l5, "Array Methods", """
                const courses = [
                    { id: 1, title: "HTML",       level: "BEGINNER", isFree: true  },
                    { id: 2, title: "CSS",         level: "BEGINNER", isFree: true  },
                    { id: 3, title: "JavaScript",  level: "BEGINNER", isFree: false },
                    { id: 4, title: "React.js",    level: "INTERMEDIATE", isFree: false },
                    { id: 5, title: "Spring Boot", level: "INTERMEDIATE", isFree: false },
                ];

                // map - transform
                const titles = courses.map(c => c.title);
                console.log(titles); // ["HTML","CSS","JavaScript",...]

                // filter - select
                const freeCourses      = courses.filter(c => c.isFree);
                const beginnerCourses  = courses.filter(c => c.level === "BEGINNER");

                // find - first match
                const reactCourse = courses.find(c => c.title === "React.js");
                console.log(reactCourse?.title); // React.js

                // some / every
                const hasFreeCourse = courses.some(c => c.isFree);  // true
                const allFree       = courses.every(c => c.isFree); // false

                // reduce - count free courses
                const freeCount = courses.reduce((acc, c) => acc + (c.isFree ? 1 : 0), 0);

                // Spread
                const moreCourses = [...courses, { id: 6, title: "Next.js" }];

                // Destructuring
                const [first, second, ...rest] = courses;
                console.log(first.title);  // HTML
                console.log(rest.length);  // 3""", "javascript",
                "Optional chaining (?.) ការពារ error នៅពេល object undefined ។ Spread (...) copy array ។", 1);

        Lesson l6 = ls(ch3, c, "Objects & Destructuring", 2,
                "Object destructuring ។ Spread object ។ Optional chaining (?.) ។\n\n" +
                        "Nullish coalescing (??) ។ Dynamic keys ។");
        sn(l6, "Objects ES6+", """
                const student = {
                    name: "ដារ៉ា",
                    age: 22,
                    skills: ["HTML", "CSS"],
                    address: { city: "ភ្នំពេញ", country: "កម្ពុជា" },
                    score: null
                };

                // Destructuring
                const { name, age, skills, address: { city } } = student;
                console.log(name, city); // ដារ៉ា ភ្នំពេញ

                // Rename & default
                const { name: studentName, phone = "N/A" } = student;
                console.log(phone); // N/A

                // Spread - copy/merge
                const updated = { ...student, age: 23, school: "RUPP" };

                // Optional chaining (?.)
                console.log(student?.address?.city);   // ភ្នំពេញ
                console.log(student?.phone?.number);   // undefined (no error)

                // Nullish coalescing (??)
                console.log(student.score ?? "N/A");   // N/A (score is null)
                console.log(student.age   ?? "N/A");   // 22  (age is 22)

                // Dynamic keys
                const field = "name";
                console.log(student[field]); // ដារ៉ា""", "javascript",
                "?? ខុស || ។ ?? ពិនិត្យ null/undefined ។ || ពិនិត្យ falsy (0, '', false) ។", 1);

        Chapter ch4 = ch(c, "DOM & Events", 4);
        Lesson l7 = ls(ch4, c, "DOM Manipulation", 1,
                "DOM (Document Object Model) ជា API ដែល JS ប្រើ access/modify HTML ។\n\n" +
                        "querySelector, textContent, innerHTML, classList, createElement ។");
        sn(l7, "DOM Manipulation", """
                // Select elements
                const title   = document.querySelector("h1");
                const cards   = document.querySelectorAll(".card");
                const sidebar = document.getElementById("sidebar");

                // Read / Write content
                console.log(title.textContent);          // read
                title.textContent = "ចំណងជើងថ្មី";      // write (safe)
                title.innerHTML   = "<span>ថ្មី</span>"; // write (HTML)

                // CSS classes
                title.classList.add("active");
                title.classList.remove("hidden");
                title.classList.toggle("dark");
                console.log(title.classList.contains("active")); // true

                // Inline styles
                title.style.color = "#3b82f6";
                title.style.display = "none";

                // Attributes
                const img = document.querySelector("img");
                img.setAttribute("src", "new-image.jpg");
                img.getAttribute("alt");

                // Create element
                const card = document.createElement("div");
                card.className = "card";
                card.textContent = "Card ថ្មី";
                document.body.appendChild(card);

                // Remove element
                card.remove();""", "javascript",
                "textContent ស្ងាំជាង innerHTML ។ innerHTML អាចបង្ក XSS attack ។", 1);

        Chapter ch5 = ch(c, "Async JavaScript & Fetch API", 5);
        Lesson l8 = ls(ch5, c, "Fetch API & async/await", 1,
                "Fetch API ប្រើ HTTP requests ពី browser ។\n\n" +
                        "async/await ធ្វើ asynchronous code ងាយ ។ Promise-based ។\n\n" +
                        "try/catch handle errors ។");
        sn(l8, "Fetch API ជាមួយ async/await", """
                const API = "http://localhost:8080/api/v1";

                // GET - fetch courses
                async function getCourses() {
                    try {
                        const res  = await fetch(`${API}/courses`);
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        const json = await res.json();
                        return json.data.content; // your ApiResponse shape
                    } catch (err) {
                        console.error("❌ getCourses:", err.message);
                        return [];
                    }
                }

                // GET - course by slug
                async function getCourseBySlug(slug) {
                    const res  = await fetch(`${API}/courses/slug/${slug}/full`);
                    const json = await res.json();
                    return json.data;
                }

                // POST - with auth token
                async function createCourse(data, token) {
                    const res = await fetch(`${API}/courses`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify(data)
                    });
                    if (!res.ok) throw new Error(`Failed: ${res.status}`);
                    return res.json();
                }

                // Run
                getCourses().then(courses => console.log(courses));""", "javascript",
                "Always use try/catch ។ Check res.ok before parsing ។ Async function returns Promise ។", 1);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 4. REACT
    // ══════════════════════════════════════════════════════════════════════════
    private void seedReact(User ins, Category cat) {
        Course c = course("React.js ជាភាសាខ្មែរ", "reactjs-khmer",
                "រៀន React.js 18+: Components, Hooks, Router, Context API ជាភាសាខ្មែរ ។",
                "INTERMEDIATE", true, ins, cat);

        Chapter ch1 = ch(c, "ការណែនាំ & Setup", 1);
        Lesson l1 = ls(ch1, c, "React គឺជាអ្វី?", 1,
                "React ជា JavaScript library by Meta (2013) សម្រាប់ build UI ។\n\n" +
                        "Component-based: UI ចែកជា components តូចៗ reusable ។\n\n" +
                        "Virtual DOM: React compare virtual DOM → update DOM ដែល changed ប៉ុណ្ណោះ (efficient) ។");
        sn(l1, "Setup ជាមួយ Vite", """
                # Create React app ជាមួយ Vite (faster than CRA)
                npm create vite@latest my-app -- --template react
                cd my-app
                npm install
                npm run dev   # http://localhost:5173""", "bash",
                "Vite លឿនជាង Create React App ។ ប្រើ Vite ជា default ។", 1);
        sn(l1, "React Component ដំបូង", """
                // src/App.jsx
                function App() {
                    return (
                        <div className="app">
                            <h1>សួស្តី React!</h1>
                            <p>វគ្គ React.js ជាភាសាខ្មែរ</p>
                        </div>
                    );
                }
                export default App;""", "jsx",
                "className ជំនួស class ។ return JSX - HTML-like syntax ។", 2);

        Chapter ch2 = ch(c, "JSX & Components & Props", 2);
        Lesson l2 = ls(ch2, c, "JSX & Props", 1,
                "JSX rules: single root, className, camelCase, {} for JS expressions ។\n\n" +
                        "Props: data pass ពី parent → child (read-only) ។");
        sn(l2, "Props", """
                // Child Component
                function CourseCard({ title, level = "BEGINNER", isFree, onEnroll }) {
                    return (
                        <div className="course-card">
                            <h3>{title}</h3>
                            <span className={`badge badge-${level.toLowerCase()}`}>
                                {level}
                            </span>
                            {isFree && <span className="badge-free">FREE</span>}
                            <button onClick={onEnroll}>ចុះឈ្មោះ</button>
                        </div>
                    );
                }

                // Parent Component
                function App() {
                    return (
                        <div>
                            <CourseCard
                                title="HTML សម្រាប់អ្នកចាប់ផ្ដើម"
                                level="BEGINNER"
                                isFree={true}
                                onEnroll={() => alert("Enrolled!")}
                            />
                        </div>
                    );
                }""", "jsx", "Destructure props in params ។ {} pass dynamic values ។", 1);

        Chapter ch3 = ch(c, "Hooks: useState & useEffect", 3);
        Lesson l3 = ls(ch3, c, "useState Hook", 1,
                "useState ផ្ដល់ state ទៅ function component ។\n\n" +
                        "State change → component re-renders → UI updates ។");
        sn(l3, "useState", """
                import { useState } from "react";

                function CourseSearch() {
                    const [keyword, setKeyword] = useState("");
                    const [courses, setCourses] = useState([]);
                    const [loading, setLoading] = useState(false);

                    const handleSearch = async () => {
                        if (!keyword.trim()) return;
                        setLoading(true);
                        const res  = await fetch(`/api/v1/courses?keyword=${keyword}`);
                        const data = await res.json();
                        setCourses(data.data.content);
                        setLoading(false);
                    };

                    return (
                        <div>
                            <input
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSearch()}
                                placeholder="ស្វែងរកវគ្គ..."
                            />
                            <button onClick={handleSearch} disabled={loading}>
                                {loading ? "កំពុងស្វែងរក..." : "ស្វែងរក"}
                            </button>
                            <ul>
                                {courses.map(c => <li key={c.id}>{c.title}</li>)}
                            </ul>
                        </div>
                    );
                }""", "jsx", "Always use functional update c => c+1 ។ State update is async ។", 1);

        Lesson l4 = ls(ch3, c, "useEffect Hook", 2,
                "useEffect: side effects (fetch, subscriptions, DOM) ។\n\n" +
                        "[] = run once on mount ។ [dep] = run when dep changes ។");
        sn(l4, "useEffect - Fetch Data", """
                import { useState, useEffect } from "react";

                function CourseDetailPage({ slug }) {
                    const [course,  setCourse]  = useState(null);
                    const [loading, setLoading] = useState(true);
                    const [error,   setError]   = useState(null);

                    useEffect(() => {
                        let cancelled = false; // cleanup flag

                        async function load() {
                            try {
                                const res  = await fetch(`/api/v1/courses/slug/${slug}/full`);
                                if (!res.ok) throw new Error(`${res.status}`);
                                const json = await res.json();
                                if (!cancelled) setCourse(json.data);
                            } catch (e) {
                                if (!cancelled) setError(e.message);
                            } finally {
                                if (!cancelled) setLoading(false);
                            }
                        }
                        load();

                        return () => { cancelled = true; }; // cleanup on unmount
                    }, [slug]); // re-run when slug changes

                    if (loading) return <div>កំពុងផ្ទុក...</div>;
                    if (error)   return <div>Error: {error}</div>;
                    if (!course) return null;

                    return (
                        <div>
                            <h1>{course.title}</h1>
                            <p>{course.description}</p>
                        </div>
                    );
                }""", "jsx", "cleanup function ការពារ memory leak ។ cancelled flag ការពារ setState after unmount ។", 1);

        Chapter ch4 = ch(c, "React Router DOM", 4);
        Lesson l5 = ls(ch4, c, "Routing Setup", 1,
                "React Router DOM v6  សម្រាប់ navigate រវាង pages ក្នុង SPA ។\n\n" +
                        "BrowserRouter, Routes, Route, Link, useNavigate, useParams ។");
        sn(l5, "React Router", """
                // App.jsx
                import { BrowserRouter, Routes, Route } from "react-router-dom";

                function App() {
                    return (
                        <BrowserRouter>
                            <Navbar />
                            <Routes>
                                <Route path="/"                        element={<HomePage />} />
                                <Route path="/courses"                 element={<CoursesPage />} />
                                <Route path="/courses/:slug"           element={<CourseDetailPage />} />
                                <Route path="/courses/:slug/:lessonSlug" element={<LessonPage />} />
                                <Route path="/login"                   element={<LoginPage />} />
                                <Route path="*"                        element={<NotFoundPage />} />
                            </Routes>
                        </BrowserRouter>
                    );
                }

                // CourseDetailPage.jsx
                import { useParams, Link } from "react-router-dom";
                function CourseDetailPage() {
                    const { slug } = useParams();
                    // fetch /api/v1/courses/slug/${slug}/full
                }""", "jsx", "useParams() ខ្ចី URL params ។ Link ជំនួស <a> (no page reload) ។", 1);

        Chapter ch5 = ch(c, "Custom Hooks & Context API", 5);
        Lesson l6 = ls(ch5, c, "Custom Hooks", 1,
                "Custom Hook = extract logic ។ ចាប់ផ្ដើម use ។ Reusable ។");
        sn(l6, "useFetch Hook", """
                import { useState, useEffect } from "react";

                export function useFetch(url) {
                    const [data,    setData]    = useState(null);
                    const [loading, setLoading] = useState(true);
                    const [error,   setError]   = useState(null);

                    useEffect(() => {
                        if (!url) return;
                        let cancelled = false;
                        setLoading(true);

                        fetch(url)
                            .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
                            .then(d => { if (!cancelled) { setData(d.data); setLoading(false); } })
                            .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });

                        return () => { cancelled = true; };
                    }, [url]);

                    return { data, loading, error };
                }

                // Usage
                function CourseList() {
                    const { data, loading, error } = useFetch("/api/v1/courses");
                    if (loading) return <p>Loading...</p>;
                    if (error)   return <p>Error: {error}</p>;
                    return (
                        <ul>
                            {data?.content?.map(c => <li key={c.id}>{c.title}</li>)}
                        </ul>
                    );
                }""", "jsx", "Custom hooks ជួយ reuse logic ។ avoid duplicate code ។", 1);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 5. NEXT.JS
    // ══════════════════════════════════════════════════════════════════════════
    private void seedNextJS(User ins, Category cat) {
        Course c = course("Next.js ជាភាសាខ្មែរ", "nextjs-khmer",
                "រៀន Next.js 14+ App Router, Server Components, API Routes, Tailwind CSS ជាភាសាខ្មែរ ។",
                "INTERMEDIATE", false, ins, cat);

        Chapter ch1 = ch(c, "ការណែនាំ & Setup", 1);
        Lesson l1 = ls(ch1, c, "Next.js គឺជាអ្វី?", 1,
                "Next.js ជា React Framework by Vercel ។\n\n" +
                        "ផ្ដល់ SSR (Server Side Rendering), SSG (Static Site Generation), ISR ។\n\n" +
                        "App Router (Next.js 13+): folder-based routing ។");
        sn(l1, "Create Next.js App", """
                # Create Next.js project
                npx create-next-app@latest my-app
                # Options: TypeScript? Yes | Tailwind? Yes | App Router? Yes

                cd my-app
                npm run dev  # http://localhost:3000

                # Folder structure
                my-app/
                ├── app/                  # App Router
                │   ├── layout.tsx        # Root layout
                │   ├── page.tsx          # Home page (/)
                │   ├── courses/
                │   │   ├── page.tsx      # /courses
                │   │   └── [slug]/
                │   │       └── page.tsx  # /courses/:slug
                ├── components/           # Reusable components
                ├── public/               # Static files
                └── next.config.js""", "bash",
                "App Router ថ្មី ។ ប្រើ TypeScript + Tailwind CSS ។", 1);

        Chapter ch2 = ch(c, "App Router & Pages", 2);
        Lesson l2 = ls(ch2, c, "File-based Routing", 1,
                "Next.js App Router: folder = route ។\n\n" +
                        "page.tsx ក្នុង folder = route ។ layout.tsx = shared layout ។\n\n" +
                        "Dynamic routes: [slug] folder ។");
        sn(l2, "Pages & Layout", """
                // app/layout.tsx - Root Layout
                export default function RootLayout({ children }) {
                    return (
                        <html lang="km">
                            <body>
                                <Navbar />
                                <main>{children}</main>
                                <Footer />
                            </body>
                        </html>
                    );
                }

                // app/page.tsx - Home page (/)
                export default function HomePage() {
                    return <h1>ស្វាគមន៍ Code Khmer Learning</h1>;
                }

                // app/courses/[slug]/page.tsx - Dynamic route /courses/:slug
                export default async function CourseDetailPage({ params }) {
                    const { slug } = await params;
                    const res  = await fetch(`http://localhost:8080/api/v1/courses/slug/${slug}/full`,
                        { cache: "no-store" }); // SSR
                    const json = await res.json();
                    const course = json.data;

                    return (
                        <div>
                            <h1>{course.title}</h1>
                            <p>{course.description}</p>
                        </div>
                    );
                }""", "jsx", "Server Component = no useState ។ fetch ផ្ទាល់ ។ cache:'no-store' = SSR ។", 1);

        Chapter ch3 = ch(c, "Server vs Client Components", 3);
        Lesson l3 = ls(ch3, c, "Server & Client Components", 1,
                "Server Component (default): render server-side ។ direct DB/API access ។ no useState ។\n\n" +
                        "'use client': render browser ។ ប្រើ useState, useEffect, event handlers ។");
        sn(l3, "use client directive", """
                // ✅ Server Component (default) - no 'use client'
                // app/courses/page.tsx
                async function CoursesPage() {
                    // fetch directly on server
                    const res    = await fetch("http://localhost:8080/api/v1/courses");
                    const json   = await res.json();
                    const courses = json.data.content;

                    return (
                        <div>
                            {courses.map(c => <CourseCard key={c.id} course={c} />)}
                        </div>
                    );
                }

                // ✅ Client Component - needs interactivity
                "use client";
                import { useState } from "react";

                function SearchBar({ onSearch }) {
                    const [query, setQuery] = useState("");
                    return (
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && onSearch(query)}
                            placeholder="ស្វែងរកវគ្គ..."
                        />
                    );
                }""", "jsx",
                "Server components ល្អ performance ។ Client components ប្រើ interaction ។ mix both ។", 1);

        Chapter ch4 = ch(c, "Tailwind CSS Integration", 4);
        Lesson l4 = ls(ch4, c, "Tailwind CSS ក្នុង Next.js", 1,
                "Tailwind CSS utility-first framework ។ ប្រើ classes ផ្ទាល់ HTML/JSX ។\n\n" +
                        "Built-in Next.js setup ។ Responsive: sm: md: lg: xl: ។");
        sn(l4, "Tailwind CSS", """
                // Course Card ជាមួយ Tailwind
                function CourseCard({ course }) {
                    return (
                        <div className="bg-white rounded-xl shadow-md overflow-hidden
                                        hover:shadow-xl transition-all duration-300
                                        border border-gray-100">

                            <img src={course.thumbnail}
                                 alt={course.title}
                                 className="w-full h-48 object-cover" />

                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-semibold px-2 py-1
                                                     bg-blue-100 text-blue-700 rounded-full">
                                        {course.level}
                                    </span>
                                    {course.isFree && (
                                        <span className="text-xs font-semibold px-2 py-1
                                                         bg-green-100 text-green-700 rounded-full">
                                            FREE
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2
                                               line-clamp-2">
                                    {course.title}
                                </h3>

                                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                    {course.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        📚 {course.totalLessons} មេរៀន
                                    </span>
                                    <a href={`/courses/${course.slug}`}
                                       className="text-sm font-medium text-blue-600
                                                  hover:text-blue-700">
                                        ចូលរៀន →
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                }""", "jsx", "line-clamp-2 truncate long text ។ hover: transition- smooth animations ។", 1);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 6. JAVA
    // ══════════════════════════════════════════════════════════════════════════
    private void seedJava(User ins, Category cat) {
        Course c = course("Java ជាភាសាខ្មែរ", "java-for-beginners-km",
                "រៀន Java OOP, Collections, Exception Handling, Generics ជាភាសាខ្មែរ ។",
                "BEGINNER", true, ins, cat);

        Chapter ch1 = ch(c, "ការណែនាំ & Data Types", 1);
        Lesson l1 = ls(ch1, c, "Java គឺជាអ្វី?", 1,
                "Java ជា OOP language by Sun Microsystems (1995) ។\n\n" +
                        "Write Once Run Anywhere (WORA) ។ JVM run Java bytecode ។\n\n" +
                        "ប្រើក្នុង: Android apps, Web (Spring Boot), Enterprise, Big Data ។");
        sn(l1, "Hello World", """
                // HelloWorld.java
                public class HelloWorld {
                    public static void main(String[] args) {
                        System.out.println("សួស្តី ពិភពលោក!");
                        System.out.println("Welcome to Java");

                        // Variables
                        String name = "ដារ៉ា";
                        int    age  = 22;
                        System.out.printf("ឈ្មោះ: %s, អាយុ: %d%n", name, age);
                    }
                }""", "java", "class name ត្រូវ match filename ។ main() ជា entry point ។", 1);

        Lesson l2 = ls(ch1, c, "Data Types & Variables", 2,
                "Java strongly typed: ត្រូវ declare type ។\n\n" +
                        "Primitive: byte, short, int, long, float, double, boolean, char ។\n\n" +
                        "Reference: String, Array, Object ។");
        sn(l2, "Java Data Types", """
                public class DataTypes {
                    public static void main(String[] args) {
                        // Primitives
                        int    age     = 22;
                        long   bigNum  = 9_000_000_000L;  // L suffix
                        double price   = 9.99;
                        float  rating  = 4.8f;            // f suffix
                        boolean active = true;
                        char   grade   = 'A';

                        // String (Object)
                        String name    = "ដារ៉ា";
                        String message = "ឈ្មោះ: " + name;

                        // String methods
                        System.out.println(name.length());        // 3
                        System.out.println(name.toUpperCase());
                        System.out.println("  hello  ".trim());   // "hello"
                        System.out.println(name.contains("ារ"));  // true

                        // var (Java 10+) - type inference
                        var courses = "HTML, CSS, Java";
                        var count   = 42;
                    }
                }""", "java", "String ជា immutable Object ។ var (Java 10+) infer type automatically ។", 1);

        Chapter ch2 = ch(c, "Control Flow & Loops", 2);
        Lesson l3 = ls(ch2, c, "if/else, switch & Loops", 1,
                "if/else, switch expression (Java 14+) ។ for, while, for-each loop ។");
        sn(l3, "Control Flow & Loops", """
                public class ControlFlow {
                    public static void main(String[] args) {

                        // if-else
                        int score = 85;
                        if      (score >= 90) System.out.println("A - ឆ្នើម");
                        else if (score >= 80) System.out.println("B - ល្អ");
                        else if (score >= 70) System.out.println("C - មធ្យម");
                        else                  System.out.println("F - ធ្លាក់");

                        // Ternary
                        String result = score >= 50 ? "✅ បាន" : "❌ ធ្លាក់";

                        // Switch Expression (Java 14+)
                        String day = "MONDAY";
                        String period = switch (day) {
                            case "MONDAY","TUESDAY","WEDNESDAY" -> "ដើមសប្ដាហ៍";
                            case "THURSDAY","FRIDAY"            -> "ចុងសប្ដាហ៍";
                            case "SATURDAY","SUNDAY"            -> "ថ្ងៃឈប់";
                            default -> "?";
                        };

                        // for loop
                        for (int i = 1; i <= 5; i++) System.out.println("i = " + i);

                        // for-each (enhanced for)
                        String[] langs = {"HTML", "CSS", "Java", "Spring"};
                        for (String lang : langs) System.out.println("📚 " + lang);

                        // while
                        int n = 10;
                        while (n > 0) { System.out.print(n + " "); n -= 2; }
                    }
                }""", "java", "Switch expression Java 14+ ។ for-each ល្អ iterate arrays/lists ។", 1);

        Chapter ch3 = ch(c, "OOP - Classes & Objects", 3);
        Lesson l4 = ls(ch3, c, "Classes, Objects & Encapsulation", 1,
                "Class ជា blueprint ។ Object ជា instance ។\n\n" +
                        "Encapsulation: private fields + public getters/setters ។\n\n" +
                        "Constructor: initialize object ។");
        sn(l4, "Class & Object", """
                // Course.java
                public class Course {
                    private Long   id;
                    private String title;
                    private String level;
                    private boolean isFree;

                    // Constructor
                    public Course(Long id, String title, String level, boolean isFree) {
                        this.id     = id;
                        this.title  = title;
                        this.level  = level;
                        this.isFree = isFree;
                    }

                    // Getters
                    public Long   getId()    { return id; }
                    public String getTitle() { return title; }
                    public String getLevel() { return level; }
                    public boolean isFree()  { return isFree; }

                    // Setter
                    public void setTitle(String title) { this.title = title; }

                    // Business logic
                    public String getInfo() {
                        return String.format("[%s] %s (%s)",
                            level, title, isFree ? "FREE" : "PAID");
                    }

                    @Override
                    public String toString() {
                        return "Course{id=" + id + ", title='" + title + "'}";
                    }
                }

                // Main.java
                public class Main {
                    public static void main(String[] args) {
                        Course html = new Course(1L, "HTML for Beginners", "BEGINNER", true);
                        Course react = new Course(2L, "React.js", "INTERMEDIATE", false);

                        System.out.println(html.getInfo());
                        System.out.println(react);
                    }
                }""", "java", "private fields = Encapsulation ។ this.field ជ្រើស field vs parameter ។", 1);

        Lesson l5 = ls(ch3, c, "Inheritance & Polymorphism", 2,
                "extends: inherit from parent class ។ @Override: override parent method ។\n\n" +
                        "Polymorphism: same method, different behavior ។ super() call parent ។");
        sn(l5, "Inheritance", """
                // Animal.java
                public class Animal {
                    protected String name;
                    protected int age;

                    public Animal(String name, int age) {
                        this.name = name;
                        this.age  = age;
                    }

                    public void sound() {
                        System.out.println(name + " ធ្វើសំឡេង...");
                    }

                    public String getInfo() { return name + " (អាយុ " + age + ")"; }
                }

                // Dog.java
                public class Dog extends Animal {
                    private String breed;

                    public Dog(String name, int age, String breed) {
                        super(name, age); // call parent constructor
                        this.breed = breed;
                    }

                    @Override
                    public void sound() { System.out.println(name + ": ប! ប! ប!"); }

                    @Override
                    public String getInfo() {
                        return super.getInfo() + " [" + breed + "]";
                    }
                }

                // Polymorphism
                Animal[] animals = {
                    new Dog("ប៊ូប៊ូ", 2, "Golden"),
                    new Dog("ម៉ាក្ស", 3, "Husky"),
                };
                for (Animal a : animals) {
                    a.sound(); // calls Dog.sound() - polymorphism
                    System.out.println(a.getInfo());
                }""", "java", "super() ត្រូវវាង line ដំបូង constructor ។ @Override ជួយ catch typos ។", 1);

        Chapter ch4 = ch(c, "Collections & Generics", 4);
        Lesson l6 = ls(ch4, c, "List, Map & Stream API", 1,
                "Collections Framework: List (ArrayList), Map (HashMap), Set (HashSet) ។\n\n" +
                        "Stream API: modern functional operations ។ Generics <T> ។");
        sn(l6, "Collections & Streams", """
                import java.util.*;
                import java.util.stream.*;

                public class CollectionsDemo {
                    public static void main(String[] args) {

                        // ArrayList
                        List<String> courses = new ArrayList<>(List.of(
                                "HTML", "CSS", "JavaScript", "React", "Java", "Spring Boot", "Git"));

                        // Add / Remove
                        courses.add("Next.js");
                        courses.remove("CSS");

                        // Stream API (like JS map/filter/reduce)
                        List<String> jCourses = courses.stream()
                                .filter(c -> c.contains("J"))       // filter
                                .sorted()                           // sort
                                .collect(Collectors.toList());
                        System.out.println("J courses: " + jCourses);

                        // Map to uppercase
                        List<String> upper = courses.stream()
                                .map(String::toUpperCase)
                                .toList(); // Java 16+

                        // Count
                        long count = courses.stream()
                                .filter(c -> c.length() > 4)
                                .count();

                        // HashMap
                        Map<String, Integer> scores = new HashMap<>();
                        scores.put("ដារ៉ា",  95);
                        scores.put("សុភាព", 88);
                        scores.put("វណ្ណា", 92);

                        // Sort by score desc
                        scores.entrySet().stream()
                                .sorted(Map.Entry.<String,Integer>comparingByValue().reversed())
                                .forEach(e -> System.out.println(e.getKey() + ": " + e.getValue()));
                    }
                }""", "java", "Stream API ដូច JS map/filter/reduce ។ toList() Java 16+ ។", 1);

        Chapter ch5 = ch(c, "Exception Handling", 5);
        Lesson l7 = ls(ch5, c, "try/catch/finally & Custom Exceptions", 1,
                "Exception handling ការពារ program crash ។\n\n" +
                        "Checked exceptions vs Unchecked exceptions ។ Custom exception classes ។");
        sn(l7, "Exception Handling", """
                public class ExceptionDemo {

                    // Custom Exception
                    static class CourseNotFoundException extends RuntimeException {
                        public CourseNotFoundException(String slug) {
                            super("Course not found: " + slug);
                        }
                    }

                    static String findCourse(String slug) {
                        Map<String,String> courses = Map.of("html", "HTML Course", "react", "React Course");
                        String course = courses.get(slug);
                        if (course == null) throw new CourseNotFoundException(slug);
                        return course;
                    }

                    public static void main(String[] args) {
                        // Basic try-catch-finally
                        try {
                            String title = findCourse("python"); // throws
                            System.out.println(title);
                        } catch (CourseNotFoundException e) {
                            System.out.println("❌ " + e.getMessage());
                        } catch (Exception e) {
                            System.out.println("Unknown error: " + e.getMessage());
                        } finally {
                            System.out.println("✅ finally ដំណើរការជានិច្ច");
                        }

                        // try-with-resources (auto-close)
                        try (var scanner = new java.util.Scanner(System.in)) {
                            System.out.print("Enter course slug: ");
                            String input = scanner.nextLine();
                            System.out.println(findCourse(input));
                        } catch (CourseNotFoundException e) {
                            System.out.println(e.getMessage());
                        }
                    }
                }""", "java",
                "Custom RuntimeException ងាយ ។ try-with-resources auto-close resources ។", 1);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 7. SPRING BOOT
    // ══════════════════════════════════════════════════════════════════════════
    private void seedSpringBoot(User ins, Category cat) {
        Course c = course("Spring Boot ជាភាសាខ្មែរ", "spring-boot-khmer",
                "រៀន Spring Boot: REST API, JPA, Spring Security, JWT, OAuth2 ជាភាសាខ្មែរ ។",
                "INTERMEDIATE", false, ins, cat);

        Chapter ch1 = ch(c, "ការណែនាំ & Setup", 1);
        Lesson l1 = ls(ch1, c, "Spring Boot គឺជាអ្វី?", 1,
                "Spring Boot ជា Java framework ។ Auto-configuration ។\n\n" +
                        "Build REST APIs, Microservices ។ Embedded Tomcat server ។\n\n" +
                        "Spring Initializr: https://start.spring.io ។");
        sn(l1, "pom.xml Dependencies", """
                <!-- pom.xml - Key dependencies -->
                <dependencies>
                    <!-- Spring Web - REST API -->
                    <dependency>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-starter-web</artifactId>
                    </dependency>

                    <!-- Spring Data JPA - Database ORM -->
                    <dependency>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-starter-data-jpa</artifactId>
                    </dependency>

                    <!-- PostgreSQL Driver -->
                    <dependency>
                        <groupId>org.postgresql</groupId>
                        <artifactId>postgresql</artifactId>
                    </dependency>

                    <!-- Spring Security + JWT -->
                    <dependency>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-starter-security</artifactId>
                    </dependency>

                    <!-- Lombok - reduce boilerplate -->
                    <dependency>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                    </dependency>

                    <!-- Validation -->
                    <dependency>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-starter-validation</artifactId>
                    </dependency>
                </dependencies>""", "xml",
                "Spring Initializr (start.spring.io) ជ្រើស dependencies ។ Maven/Gradle ។", 1);

        Chapter ch2 = ch(c, "REST API ជាមួយ Spring MVC", 2);
        Lesson l2 = ls(ch2, c, "Controllers & REST Endpoints", 1,
                "@RestController, @GetMapping, @PostMapping, @PutMapping, @DeleteMapping ។\n\n" +
                        "@PathVariable, @RequestParam, @RequestBody ។ ResponseEntity ។");
        sn(l2, "Course Controller", """
                @RestController
                @RequestMapping("/api/v1/courses")
                @RequiredArgsConstructor
                public class CourseController {

                    private final CourseService courseService;

                    // GET /api/v1/courses?page=0&size=10
                    @GetMapping
                    public ResponseEntity<ApiResponse<PageResponse<CourseResponse>>> getAll(
                            @RequestParam(defaultValue = "0")  int page,
                            @RequestParam(defaultValue = "10") int size) {
                        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                        return ResponseEntity.ok(
                                ApiResponse.success(courseService.getAll(pageable), "OK"));
                    }

                    // GET /api/v1/courses/slug/reactjs-khmer/full
                    @GetMapping("/slug/{slug}/full")
                    public ResponseEntity<ApiResponse<CourseDetailResponse>> getBySlug(
                            @PathVariable String slug) {
                        return ResponseEntity.ok(courseService.getBySlugFull(slug));
                    }

                    // POST /api/v1/courses (multipart/form-data)
                    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
                    public ResponseEntity<ApiResponse<CourseResponse>> create(
                            @Valid CourseRequest request,
                            @RequestParam(required = false) MultipartFile thumbnail) {
                        return ResponseEntity.status(201)
                                .body(courseService.create(request, thumbnail));
                    }

                    // DELETE /api/v1/courses/{id}
                    @DeleteMapping("/{id}")
                    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
                        return ResponseEntity.ok(courseService.delete(id));
                    }
                }""", "java", "@RequiredArgsConstructor inject dependencies ។ Multipart ប្រើ form-data ។", 1);

        Chapter ch3 = ch(c, "Spring Data JPA", 3);
        Lesson l3 = ls(ch3, c, "Entity & Repository", 1,
                "@Entity map Java class → database table ។\n\n" +
                        "JpaRepository: findAll, findById, save, delete ។ Custom queries: @Query ។");
        sn(l3, "Entity & Repository", """
                // Course Entity
                @Entity @Table(name = "course")
                @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
                public class Course {
                    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
                    private Long id;

                    @Column(unique = true, nullable = false)
                    private String title;

                    @Column(nullable = false, unique = true)
                    private String slug;

                    @ManyToOne(fetch = FetchType.LAZY)
                    @JoinColumn(name = "instructor_id")
                    private User instructor;

                    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
                    @OrderBy("orderIndex ASC")
                    private List<Chapter> chapters = new ArrayList<>();

                    @PrePersist
                    void onCreate() { if (createdAt == null) createdAt = LocalDateTime.now(); }
                }

                // Repository
                public interface CourseRepository extends JpaRepository<Course, Long> {

                    Optional<Course> findBySlug(String slug);
                    boolean existsBySlug(String slug);
                    boolean existsByTitle(String title);

                    // Fetch full content (no N+1)
                    @Query("SELECT DISTINCT c FROM Course c " +
                           "LEFT JOIN FETCH c.chapters ch " +
                           "LEFT JOIN FETCH ch.lessons l " +
                           "LEFT JOIN FETCH l.codeSnippets " +
                           "WHERE c.slug = :slug " +
                           "ORDER BY ch.orderIndex ASC")
                    Optional<Course> findBySlugWithFullContent(@Param("slug") String slug);
                }""", "java", "@Query JPQL (not SQL) ។ JOIN FETCH ការពារ N+1 problem ។", 1);

        Chapter ch4 = ch(c, "Spring Security & JWT", 4);
        Lesson l4 = ls(ch4, c, "JWT Authentication", 1,
                "JWT (JSON Web Token) ប្រើ stateless authentication ។\n\n" +
                        "Login → server return access token + refresh token ។\n\n" +
                        "Client send Bearer token ក្នុង Authorization header ។");
        sn(l4, "SecurityConfig & JWT Filter", """
                // SecurityConfig.java
                @Configuration
                @EnableWebSecurity
                @RequiredArgsConstructor
                public class SecurityConfig {

                    private final JwtAuthenticationFilter jwtFilter;

                    @Bean
                    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                        return http
                            .csrf(csrf -> csrf.disable())
                            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
                            .authorizeHttpRequests(auth -> auth
                                // Public endpoints
                                .requestMatchers(
                                    "/api/v1/auth/**",
                                    "/api/v1/courses/**"  // public read
                                ).permitAll()
                                // Protected endpoints
                                .requestMatchers(HttpMethod.POST, "/api/v1/courses").hasRole("ADMIN")
                                .anyRequest().authenticated()
                            )
                            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                            .build();
                    }
                }

                // JwtAuthenticationFilter.java (simplified)
                @Component @RequiredArgsConstructor
                public class JwtAuthenticationFilter extends OncePerRequestFilter {
                    private final JwtService jwtService;
                    private final UserDetailsService userDetailsService;

                    @Override
                    protected void doFilterInternal(HttpServletRequest req,
                                                    HttpServletResponse res,
                                                    FilterChain chain) throws Exception {
                        String header = req.getHeader("Authorization");
                        if (header == null || !header.startsWith("Bearer ")) {
                            chain.doFilter(req, res); return;
                        }
                        String token    = header.substring(7);
                        String username = jwtService.extractUsername(token);
                        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                            var user = userDetailsService.loadUserByUsername(username);
                            if (jwtService.isValid(token, user)) {
                                var auth = new UsernamePasswordAuthenticationToken(
                                        user, null, user.getAuthorities());
                                SecurityContextHolder.getContext().setAuthentication(auth);
                            }
                        }
                        chain.doFilter(req, res);
                    }
                }""", "java",
                "STATELESS = no session ។ JWT self-contained ។ Filter runs every request ។", 1);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 8. GIT
    // ══════════════════════════════════════════════════════════════════════════
    private void seedGit(User ins, Category cat) {
        Course c = course("Git & GitHub ជាភាសាខ្មែរ", "git-github-khmer",
                "រៀន Git version control ពីដំបូង: commits, branches, merging, GitHub ជាភាសាខ្មែរ ។",
                "BEGINNER", true, ins, cat);

        Chapter ch1 = ch(c, "ការណែនាំ & Setup", 1);
        Lesson l1 = ls(ch1, c, "Git គឺជាអ្វី?", 1,
                "Git ជា distributed version control system (VCS) ។\n\n" +
                        "Git record changes ។ revert ។ collaborate ។\n\n" +
                        "GitHub ជា cloud platform hosting Git repositories ។");
        sn(l1, "Install & Configure Git", """
                # ពិនិត្យ Git version
                git --version

                # macOS (Homebrew)
                brew install git

                # Ubuntu/Debian
                sudo apt install git -y

                # ⚙️ Configuration (ចំបាច់ setup ១ ដង)
                git config --global user.name  "ឈ្មោះអ្នក"
                git config --global user.email "you@example.com"
                git config --global core.editor "code --wait"  # VS Code
                git config --global init.defaultBranch main

                # ពិនិត្យ config
                git config --list""", "bash",
                "git config --global apply to all repos ។ user.name & email appear in every commit ។", 1);

        Chapter ch2 = ch(c, "Git Basics", 2);
        Lesson l2 = ls(ch2, c, "init, add, commit, status, log", 1,
                "Git workflow: Working Directory → Staging Area → Repository ។\n\n" +
                        "git init, git add, git commit, git status, git log ។");
        sn(l2, "Git Basic Commands", """
                # 1. Initialize repository
                mkdir my-project && cd my-project
                git init
                # ➡ Initialized empty Git repository in .git/

                # 2. Create file
                echo "# My Project" > README.md
                echo "console.log('Hello');" > index.js

                # 3. Check status
                git status
                # ➡ Untracked files: README.md, index.js

                # 4. Stage files
                git add README.md        # stage one file
                git add .                # stage ALL changes

                # 5. Commit
                git commit -m "feat: initial project setup"

                # 6. View history
                git log
                git log --oneline        # compact view
                git log --oneline --graph --all  # visual branches

                # 7. See what changed
                git diff                 # unstaged changes
                git diff --staged        # staged changes

                # 8. Undo
                git restore index.js     # discard unstaged changes
                git restore --staged .   # unstage files""", "bash",
                "Commit message ល្អ: type(scope): description ។ feat, fix, docs, refactor ។", 1);

        Chapter ch3 = ch(c, "Branching & Merging", 3);
        Lesson l3 = ls(ch3, c, "Branches & Merge", 1,
                "Branch ជួយ work on features ដោយឯករាជ្យ ។\n\n" +
                        "main branch = production code ។ feature branches ។\n\n" +
                        "merge: combine branch ។ rebase: linear history ។");
        sn(l3, "Branching Workflow", """
                # ─── Create & switch branch ───────────────────────────────────
                git branch feature/login         # create branch
                git checkout feature/login       # switch to it
                # OR shortcut:
                git checkout -b feature/login    # create + switch

                # ─── Modern syntax (Git 2.23+) ───────────────────────────────
                git switch -c feature/register   # create + switch
                git switch main                  # switch to main

                # ─── Work on feature ─────────────────────────────────────────
                # ... edit files ...
                git add .
                git commit -m "feat: add login endpoint"
                git commit -m "feat: add JWT token service"

                # ─── List branches ───────────────────────────────────────────
                git branch          # local branches
                git branch -a       # all branches (including remote)

                # ─── Merge feature into main ──────────────────────────────────
                git switch main
                git merge feature/login
                # If conflict: fix manually → git add . → git commit

                # ─── Delete branch after merge ───────────────────────────────
                git branch -d feature/login""", "bash",
                "ប្រើ descriptive branch names: feature/, fix/, hotfix/ ។ Delete branch after merge ។", 1);

        Chapter ch4 = ch(c, "Remote & GitHub", 4);
        Lesson l4 = ls(ch4, c, "GitHub: push, pull, clone", 1,
                "Remote repository = GitHub/GitLab/Bitbucket ។\n\n" +
                        "git push: upload local → remote ។ git pull: download remote → local ។\n\n" +
                        "git clone: copy remote repo ។");
        sn(l4, "Remote Commands", """
                # ─── Connect local repo to GitHub ────────────────────────────
                git remote add origin https://github.com/username/my-project.git
                git remote -v  # verify

                # ─── First push ──────────────────────────────────────────────
                git push -u origin main
                # -u = set upstream (only needed first time)

                # ─── Daily workflow ───────────────────────────────────────────
                git pull origin main     # get latest changes
                # ... make changes ...
                git add .
                git commit -m "feat: add course page"
                git push

                # ─── Clone existing repo ─────────────────────────────────────
                git clone https://github.com/username/repo.git
                cd repo

                # ─── Fork & Pull Request workflow ─────────────────────────────
                # 1. Fork repo on GitHub
                # 2. Clone your fork
                git clone https://github.com/YOUR/repo.git

                # 3. Create branch
                git checkout -b fix/typo-readme

                # 4. Make changes & push
                git add . && git commit -m "fix: typo in README"
                git push origin fix/typo-readme

                # 5. Open Pull Request on GitHub""", "bash",
                "Pull before push ជានិច្ច ។ Pull Request = propose changes ។ Code review ។", 1);

        Chapter ch5 = ch(c, ".gitignore & Best Practices", 5);
        Lesson l5 = ls(ch5, c, ".gitignore & Git Tips", 1,
                ".gitignore: tell Git ឯកសារណាដែលត្រូវ ignore ។\n\n" +
                        "node_modules, .env, target/, build/ មិន commit ។");
        sn(l5, ".gitignore ស្តង់ដារ", """
                # .gitignore for Full-Stack Project

                # ─── Environment / Secrets ────────────────────────────────────
                .env
                .env.local
                .env.production
                *.key
                *.pem

                # ─── Node.js / React / Next.js ───────────────────────────────
                node_modules/
                .next/
                dist/
                build/
                .cache/

                # ─── Java / Spring Boot ───────────────────────────────────────
                target/
                *.class
                *.jar
                *.war
                .mvn/
                !**/src/main/**/target/

                # ─── IDE ──────────────────────────────────────────────────────
                .idea/
                *.iml
                .vscode/
                .DS_Store        # macOS
                Thumbs.db        # Windows

                # ─── Logs ─────────────────────────────────────────────────────
                *.log
                logs/
                npm-debug.log*""", "bash",
                ".env មិន commit ព្រោះមាន secrets ។ node_modules មិន commit ព្រោះធំ ។ gitignore.io generate ។", 1);
        sn(l5, "Git Best Practices", """
                # ✅ Commit message convention (Conventional Commits)
                feat: add course detail page
                fix: resolve JWT token expiry bug
                docs: update API documentation
                style: format code with prettier
                refactor: extract useFetch hook
                test: add unit tests for CourseService
                chore: update dependencies

                # ✅ Useful aliases
                git config --global alias.st  "status"
                git config --global alias.lg  "log --oneline --graph --all"
                git config --global alias.undo "reset --soft HEAD~1"

                # Use:
                git st    # instead of git status
                git lg    # beautiful log
                git undo  # undo last commit (keep changes staged)

                # ✅ See who changed what
                git blame filename.java

                # ✅ Find commit that introduced a bug
                git bisect start
                git bisect bad          # current commit is bad
                git bisect good v1.0    # this tag was good
                # Git binary search through commits""", "bash",
                "Conventional Commits ធ្វើ history ច្បាស់ ។ git aliases ប្រើ fast ។", 2);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HELPERS - short names for clean code above
    // ══════════════════════════════════════════════════════════════════════════

    private Category cat(String name, String slug, String desc, int order) {
        return categoryRepository.findBySlug(slug).orElseGet(() -> {
            log.info("Cat: {}", name);
            return categoryRepository.save(Category.builder()
                    .name(name).slug(slug).description(desc)
                    .isActive(true).orderIndex(order).createdAt(now()).build());
        });
    }

    private Course course(String title, String slug, String desc,
                          String level, boolean featured, User ins, Category cat) {
        return courseRepository.findBySlug(slug).orElseGet(() -> {
            log.info("Course: {}", title);
            return courseRepository.save(Course.builder()
                    .title(title).slug(slug).description(desc)
                    .level(level).language("Khmer").status("PUBLISHED")
                    .isFeatured(featured).isFree(true)
                    .instructor(ins).category(cat)
                    .createdAt(now()).publishedAt(now()).build());
        });
    }

    private Chapter ch(Course course, String title, int order) {
        return chapterRepository.findByCourseIdAndTitle(course.getId(), title)
                .orElseGet(() -> chapterRepository.save(Chapter.builder()
                        .title(title).orderIndex(order)
                        .course(course).createdAt(now()).build()));
    }

    private Lesson ls(Chapter chapter, Course course,
                      String title, int order, String content) {
        return lessonRepository.findByChapterIdAndTitle(chapter.getId(), title)
                .orElseGet(() -> lessonRepository.save(Lesson.builder()
                        .title(title).content(content).orderIndex(order)
                        .chapter(chapter).course(course).createdAt(now()).build()));
    }

    private void sn(Lesson lesson, String title, String code,
                    String lang, String explanation, int order) {
        if (codeSnippetRepository.existsByTitleAndLessonId(title, lesson.getId())) return;
        codeSnippetRepository.save(CodeSnippet.builder()
                .title(title).code(code).language(lang)
                .explanation(explanation).orderIndex(order)
                .lesson(lesson).createdAt(now()).build());
    }

    private void done(Course course) {
        int total = lessonRepository.countByCourseId(course.getId());
        course.setTotalLessons(total);
        courseRepository.save(course);
        log.info("✅ {} → {} lessons", course.getTitle(), total);
    }

    private LocalDateTime now() { return LocalDateTime.now(); }
}