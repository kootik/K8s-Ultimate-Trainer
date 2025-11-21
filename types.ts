
export type LevelType = 'junior' | 'middle' | 'senior';

export interface Question {
  q: string;
  a: string; // HTML string
  tip?: string;
}

export interface Module {
  id: string;
  title: string;
  desc: string;
  questions: Question[];
}

export interface LevelConfig {
  id: LevelType;
  title: string;
  icon: string;
  color: string;
  borderColor: string;
  bgHover: string;
  textHover: string;
  subTitle: string;
  description: string;
  modules: Module[];
}

export interface CourseConfig {
  id: string;
  title: string;
  description: string;
  levels: Record<string, LevelConfig>;
}

export type AIPersona = 
  | 'interviewer_strict' 
  | 'interviewer_friendly' 
  | 'interviewer_continuous'
  | 'teacher_eli5' 
  | 'architect_deep' 
  | 'devil_advocate'
  | 'analyst_compare'
  | 'troubleshooter_debug'
  | 'security_auditor'
  | 'explain_code'
  | 'start_interview'
  | 'hint_giver';

export interface AIMessage {
  role: 'user' | 'model';
  text: string;
}
