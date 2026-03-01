package finalproject.backend.service.impl;

import finalproject.backend.exception.CustomMessageException;
import finalproject.backend.mapper.CodeSnippetMapper;
import finalproject.backend.modal.CodeSnippet;
import finalproject.backend.modal.Lesson;
import finalproject.backend.repository.CodeSnippetRepository;
import finalproject.backend.repository.LessonRepository;
import finalproject.backend.request.CodeSnippetRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CodeSnippetResponse;
import finalproject.backend.service.CodeSnippetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodeSnippetServiceImpl implements CodeSnippetService {

    private final CodeSnippetRepository codeSnippetRepository;
    private final LessonRepository lessonRepository;
    private final CodeSnippetMapper codeSnippetMapper;

    @Override
    @Transactional
    public ApiResponse<CodeSnippetResponse> createSnippet(CodeSnippetRequest request) {
        Lesson lesson = findLessonOrThrow(request.getLessonId());

        if (request.getTitle() != null && codeSnippetRepository.existsByTitleAndLessonId(request.getTitle(), request.getLessonId()))
            throw new CustomMessageException("Code snippet title already exists in this lesson",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        CodeSnippet saved = codeSnippetRepository.save(codeSnippetMapper.toEntity(request, lesson));
        log.info("Created code snippet id={} for lesson id={}", saved.getId(), lesson.getId());
        return ApiResponse.success(codeSnippetMapper.toResponse(saved), "Code snippet created successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<CodeSnippetResponse>> getSnippetsByLesson(Long lessonId) {
        if (!lessonRepository.existsById(lessonId))
            throw new CustomMessageException("Lesson not found with id: " + lessonId,
                    String.valueOf(HttpStatus.NOT_FOUND.value()));

        List<CodeSnippetResponse> snippets = codeSnippetRepository
                .findByLessonIdOrderByOrderIndexAsc(lessonId)
                .stream()
                .map(codeSnippetMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(snippets, "Code snippets retrieved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CodeSnippetResponse> getSnippetById(Long id) {
        return ApiResponse.success(
                codeSnippetMapper.toResponse(findSnippetOrThrow(id)),
                "Code snippet retrieved successfully");
    }

    @Override
    @Transactional
    public ApiResponse<CodeSnippetResponse> updateSnippet(Long id, CodeSnippetRequest request) {
        CodeSnippet snippet = findSnippetOrThrow(id);

        Lesson lesson = null;
        if (request.getLessonId() != null && !request.getLessonId().equals(snippet.getLesson().getId()))
            lesson = findLessonOrThrow(request.getLessonId());

        Long targetLessonId = lesson != null ? lesson.getId() : snippet.getLesson().getId();
        if (request.getTitle() != null && !request.getTitle().equals(snippet.getTitle())
                && codeSnippetRepository.existsByTitleAndLessonId(request.getTitle(), targetLessonId))
            throw new CustomMessageException("Code snippet title already exists in this lesson",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        codeSnippetMapper.updateEntity(request, snippet, lesson);
        CodeSnippet saved = codeSnippetRepository.save(snippet);
        log.info("Updated code snippet id={}", id);
        return ApiResponse.success(codeSnippetMapper.toResponse(saved), "Code snippet updated successfully");
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteSnippet(Long id) {
        codeSnippetRepository.delete(findSnippetOrThrow(id));
        log.info("Deleted code snippet id={}", id);
        return ApiResponse.success("Code snippet deleted successfully");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private CodeSnippet findSnippetOrThrow(Long id) {
        return codeSnippetRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException(
                        "Code snippet not found with id: " + id,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }

    private Lesson findLessonOrThrow(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException(
                        "Lesson not found with id: " + id,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }
}

