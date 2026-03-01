package finalproject.backend.mapper;

import finalproject.backend.modal.Category;
import finalproject.backend.request.CategoryRequest;
import finalproject.backend.response.CategoryResponse;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .orderIndex(category.getOrderIndex())
                .courseCount(category.getCourses() != null ? category.getCourses().size() : 0)
                .createdAt(category.getCreatedAt())
                .build();
    }

    public Category toEntity(CategoryRequest request) {
        return Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .orderIndex(request.getOrderIndex())
                .build();
    }

    public void updateEntity(CategoryRequest request, Category category) {
        if (request.getName() != null && !request.getName().isBlank())
            category.setName(request.getName());

        if (request.getSlug() != null && !request.getSlug().isBlank())
            category.setSlug(request.getSlug());

        if (request.getDescription() != null)
            category.setDescription(request.getDescription());

        if (request.getIsActive() != null)
            category.setIsActive(request.getIsActive());

        category.setOrderIndex(request.getOrderIndex());
    }
}
