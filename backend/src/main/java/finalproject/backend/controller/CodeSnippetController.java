package finalproject.backend.controller;

import finalproject.backend.request.CodeSnippetRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CodeSnippetResponse;
import finalproject.backend.service.CodeSnippetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/snippets")
@RequiredArgsConstructor
public class CodeSnippetController {

    private final CodeSnippetService codeSnippetService;

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<ApiResponse<List<CodeSnippetResponse>>> getSnippetsByLesson(
            @PathVariable Long lessonId) {
        return ResponseEntity.ok(codeSnippetService.getSnippetsByLesson(lessonId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CodeSnippetResponse>> getSnippetById(@PathVariable Long id) {
        return ResponseEntity.ok(codeSnippetService.getSnippetById(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CodeSnippetResponse>> createSnippet(
            @Valid @RequestBody CodeSnippetRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(codeSnippetService.createSnippet(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CodeSnippetResponse>> updateSnippet(
            @PathVariable Long id,
            @Valid @RequestBody CodeSnippetRequest request) {
        return ResponseEntity.ok(codeSnippetService.updateSnippet(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSnippet(@PathVariable Long id) {
        return ResponseEntity.ok(codeSnippetService.deleteSnippet(id));
    }
}

