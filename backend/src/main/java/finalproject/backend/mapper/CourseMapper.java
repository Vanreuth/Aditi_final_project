package finalproject.backend.mapper;

import finalproject.backend.modal.Category;
import finalproject.backend.modal.Course;
import finalproject.backend.modal.CourseLevel;
import finalproject.backend.modal.CourseStatus;
import finalproject.backend.modal.User;
import finalproject.backend.repository.LessonProgressRepository;
import finalproject.backend.request.CourseRequest;
import finalproject.backend.response.CategorySummaryResponse;
import finalproject.backend.response.CourseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class CourseMapper {

    private final LessonProgressRepository lessonProgressRepository;

    public CourseResponse toResponse(Course course) {
        long enrolled = course.getId() != null
                ? lessonProgressRepository.countDistinctUsersByCourseId(course.getId())
                : 0L;
        long views = course.getViewCount() != null ? course.getViewCount() : 0L;
        List<Category> categories = course.getCategories() == null
                ? List.of()
                : course.getCategories().stream()
                .sorted(Comparator
                        .comparing((Category category) -> category.getOrderIndex() == null ? Integer.MAX_VALUE : category.getOrderIndex())
                        .thenComparing(Category::getId))
                .toList();
        Category primaryCategory = categories.isEmpty() ? null : categories.get(0);

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .description(course.getDescription())
                .thumbnail(course.getThumbnail())
                .requirements(course.getRequirements())
                .level(course.getLevel() != null ? course.getLevel().name() : null)
                .language(course.getLanguage())
                .status(course.getStatus() != null ? course.getStatus().name() : null)
                .isFeatured(course.getIsFeatured())
                .isFree(course.getIsFree())
                .price(course.getPrice())
                .totalLessons(course.getTotalLessons())
                .avgRating(course.getAvgRating())
                .viewCount(views)
                .enrolledCount(enrolled)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .publishedAt(course.getPublishedAt())
                .instructorId(course.getInstructor() != null ? course.getInstructor().getId() : null)
                .instructorName(course.getInstructor() != null ? course.getInstructor().getUsername() : null)
                .categoryId(primaryCategory != null ? primaryCategory.getId() : null)
                .categoryName(primaryCategory != null ? primaryCategory.getName() : null)
                .categories(categories.stream().map(this::toCategorySummary).toList())
                .build();
    }

    public Course toEntity(CourseRequest request, User instructor, Set<Category> categories) {
        return Course.builder()
                .title(request.getTitle())
                .slug(request.getSlug())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .level(request.getLevel())
                .language(request.getLanguage())
                .status(request.getStatus())
                .isFeatured(request.getFeatured())
                .isFree(request.getIsFree())
                .price(request.getPrice())
                .instructor(instructor)
                .categories(categories != null ? new LinkedHashSet<>(categories) : new LinkedHashSet<>())
                .build();
    }

    public void updateEntity(CourseRequest request, Course course, User instructor, Set<Category> categories) {
        if (request.getTitle() != null && !request.getTitle().isBlank())
            course.setTitle(request.getTitle());

        if (request.getSlug() != null && !request.getSlug().isBlank())
            course.setSlug(request.getSlug());

        if (request.getDescription() != null && !request.getDescription().isBlank())
            course.setDescription(request.getDescription());

        if (request.getRequirements() != null)
            course.setRequirements(request.getRequirements());

        if (request.getLevel() != null)
            course.setLevel(request.getLevel());

        if (request.getLanguage() != null && !request.getLanguage().isBlank())
            course.setLanguage(request.getLanguage());

        if (request.getStatus() != null)
            course.setStatus(request.getStatus());

        course.setIsFeatured(request.getFeatured());
        course.setIsFree(request.getIsFree());

        if (request.getPrice() != null)
            course.setPrice(request.getPrice());


        if (instructor != null)
            course.setInstructor(instructor);

        if (categories != null)
            course.setCategories(new LinkedHashSet<>(categories));
    }

    private CategorySummaryResponse toCategorySummary(Category category) {
        return CategorySummaryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .build();
    }
}
