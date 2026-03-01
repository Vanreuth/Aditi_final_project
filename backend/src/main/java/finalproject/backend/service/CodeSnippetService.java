package finalproject.backend.service;

import finalproject.backend.request.CodeSnippetRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CodeSnippetResponse;

import java.util.List;

public interface CodeSnippetService {

    ApiResponse<CodeSnippetResponse> createSnippet(CodeSnippetRequest request);
    ApiResponse<List<CodeSnippetResponse>> getSnippetsByLesson(Long lessonId);
    ApiResponse<CodeSnippetResponse> getSnippetById(Long id);
    ApiResponse<CodeSnippetResponse> updateSnippet(Long id, CodeSnippetRequest request);
    ApiResponse<Void> deleteSnippet(Long id);
}

