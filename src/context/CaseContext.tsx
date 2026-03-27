import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CaseData } from '../types/CaseStudy';
import { caseIntroText, partAText, partBText, partCText } from '../case-text';

const initialCaseData: CaseData = {
  title: 'Gaska Tape at a Cross Roads',
  introText: `This company tells the story of a well alive culture of successful manufacturing in the United States of America.

How did Gaska become what it is today? Its trajectory is filled with numerous ups and downs, beginning in 1965.

This case presents business students with a unique opportunity to delve into the intricacies of manufacturing, entrepreneurship, and family business dynamics.

Dive into the heart of a family business saga with our case study on Gaska Tape Inc., located in the heart of Elkhart, Indiana.`,
  isCustom: false,
  parts: [
    { id: 'partA', title: 'Part A: Familial Bonds', content: partAText },
    { id: 'partB', title: 'Part B: Jack Reflects Back', content: partBText },
    { id: 'partC', title: 'Part C: Changes at Gaska Tape', content: partCText },
  ],
  exhibits: [
    { title: 'Exhibit 1: Family Tree', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/first-person-PART-A-JACK-SMITH-CASE-PART-TATIANA.pdf#page=6', phases: ['partA'] },
    { title: 'Exhibit 2: Automotive Industry', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/first-person-PART-A-JACK-SMITH-CASE-PART-TATIANA.pdf#page=7', phases: ['partA'] },
    { title: 'Exhibit 3: Indiana Code - Judicial Dissolution', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/first-person-PART-A-JACK-SMITH-CASE-PART-TATIANA.pdf#page=8', phases: ['partA'] },
    { title: 'Exhibit 4: Greenspan Recession Warning', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/first-person-PART-A-JACK-SMITH-CASE-PART-TATIANA.pdf#page=11', phases: ['partA'] },
    { title: 'Exhibit 5: Investor Optimism Index', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/first-person-PART-A-JACK-SMITH-CASE-PART-TATIANA.pdf#page=12', phases: ['partA'] },
    { title: 'Exhibit 1: About Gaska Tape', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/PART-C-Jack-Smith.pdf#page=6', phases: ['partC'] },
    { title: 'Exhibit 2: Industry 2008', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/PART-C-Jack-Smith.pdf#page=7', phases: ['partC'] },
    { title: 'Figure 2: Indiana Employment', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/PART-C-Jack-Smith.pdf#page=8', phases: ['partC'] },
    { title: 'Exhibit 3: Gaska Org Chart 2007 vs 2009', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/PART-C-Jack-Smith.pdf#page=9', phases: ['partC'] },
    { title: 'Exhibit 4: Elkhart Police Community Donor', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/PART-C-Jack-Smith.pdf#page=10', phases: ['partC'] },
    { title: 'Vatican Swiss Guards Helmets', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/PART-C-Jack-Smith.pdf#page=11', phases: ['partC'] },
    { title: 'Exhibit 5: JBS Collection', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/PART-C-Jack-Smith.pdf#page=12', phases: ['partC'] },
    { title: 'Exhibit 6: Elkhart Manufacturing 2021', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/PART-C-Jack-Smith.pdf#page=13', phases: ['partC'] },
  ],
  resources: [
    { title: 'Jacks Vision', url: 'https://www.youtube.com/watch?v=6-sIWTokjGg&t=1s', phases: ['partA', 'partB'] },
    { title: 'Gaska Tape', url: 'https://www.youtube.com/watch?v=IEL2jDXSOv4&t=4s', phases: ['partA'] },
    { title: 'Family Business Succession', url: 'https://www.youtube.com/watch?v=2pX_6CnBYyo&t=5s', phases: ['partA', 'partB'] },
    { title: 'Decision Making', url: 'https://www.youtube.com/watch?v=CxdigZBRgsY&t=3s', phases: ['partA'] },
    { title: 'Working Culture', url: 'https://www.youtube.com/watch?v=EO-pfsADlkw&t=2s', phases: ['partC'] },
    { title: 'Elkhart Entrepreneurship', url: 'https://www.youtube.com/watch?v=rG4eNMvNRUY&t=2s', phases: ['partC'] },
  ],
};

interface CaseContextType {
  caseData: CaseData;
  setCaseData: (data: CaseData) => void;
  resetToDefault: () => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export function CaseProvider({ children }: { children: ReactNode }) {
  const [caseData, setCaseData] = useState<CaseData>(initialCaseData);

  const resetToDefault = () => {
    setCaseData(initialCaseData);
  };

  return (
    <CaseContext.Provider value={{ caseData, setCaseData, resetToDefault }}>
      {children}
    </CaseContext.Provider>
  );
}

export function useCase() {
  const context = useContext(CaseContext);
  if (context === undefined) {
    throw new Error('useCase must be used within a CaseProvider');
  }
  return context;
}
