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

export type AIPersona = 
  | 'interviewer_strict' 
  | 'interviewer_friendly' 
  | 'teacher_eli5' 
  | 'architect_deep' 
  | 'devil_advocate';

export interface AIMessage {
  role: 'user' | 'model';
  text: string;
}