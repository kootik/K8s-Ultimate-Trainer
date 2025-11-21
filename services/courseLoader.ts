
import { CourseConfig } from '../types';
import { course as k8sCourse } from '../courses/k8s';
import { course as pythonCourse } from '../courses/python';

// Note: We use manual imports here because `import.meta.glob` caused runtime errors 
// in the current environment (likely due to the build transform not applying).
// To add a new course, import it here and add it to the `courses` array.

const courses: CourseConfig[] = [
  k8sCourse,
  pythonCourse
];

export const getAllCourses = (): CourseConfig[] => {
  return courses;
};

export const getCourseById = (id: string): CourseConfig | undefined => {
    return courses.find(c => c.id === id);
};
