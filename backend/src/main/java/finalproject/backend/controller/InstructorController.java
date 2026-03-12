package finalproject.backend.controller;

import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CourseResponse;
import finalproject.backend.response.InstructorStatsResponse;
import finalproject.backend.response.PageResponse;
import finalproject.backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/instructor")
@RequiredArgsConstructor
public class InstructorController {

    private final CourseService courseService;

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<PageResponse<CourseResponse>>> getInstructorCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean isFeatured,
            @RequestParam(required = false) Boolean isFree
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<CourseResponse> courses = courseService.getInstructorCourses(
                pageable,
                search,
                status,
                level,
                categoryId,
                isFeatured,
                isFree
        );

        return ResponseEntity.ok(ApiResponse.success(courses, "Instructor courses retrieved successfully"));
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getInstructorCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getInstructorCourseById(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<InstructorStatsResponse>> getInstructorStats() {
        return ResponseEntity.ok(courseService.getInstructorStats());
    }
}