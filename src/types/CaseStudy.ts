export interface CasePart {
  id: string;
  title: string;
  content: string;
}

export interface CaseExhibit {
  title: string;
  url: string;
  phases: string[];
}

export interface CaseResource {
  title: string;
  url: string;
  phases: string[];
}

export interface CaseData {
  title: string;
  introText: string;
  isCustom?: boolean;
  parts: CasePart[];
  exhibits: CaseExhibit[];
  resources: CaseResource[];
}
