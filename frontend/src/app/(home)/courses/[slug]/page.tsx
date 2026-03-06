"use client";

import { CourseLearningContent } from "@/components/course/CourseLearningContent";
import { useParams } from "next/navigation";
import { CourseDetailSkeleton } from "@/components/course/CourseLearningContent";

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  if (!slug) return <CourseDetailSkeleton />;
  return <CourseLearningContent courseSlug={decodeURIComponent(slug)} />;
}