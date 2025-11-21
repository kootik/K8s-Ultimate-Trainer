
import { CourseConfig } from '../types';
import { course as k8sCourse } from '../courses/k8s';
import { course as pythonCourse } from '../courses/python';
import { course as dockerCourse } from '../courses/docker';
import { course as ansibleCourse } from '../courses/ansible';
import { course as terraformCourse } from '../courses/terraform';

const courses: CourseConfig[] = [
  k8sCourse,
  pythonCourse,
  dockerCourse,
  ansibleCourse,
  terraformCourse
];

export const getAllCourses = (): CourseConfig[] => {
  return courses;
};

export const getCourseById = (id: string): CourseConfig | undefined => {
    return courses.find(c => c.id === id);
};
