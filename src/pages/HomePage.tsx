import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ChevronDown, FileText } from 'lucide-react';
import { useCase } from '../context/CaseContext';

const defaultSuccessStories = [
  {
    title: "Gaska tape: Successful manufacturing in the midst of Elkhart's entrepreneurial culture",
    link: '/case-study/gaska-tape',
    resources: [
      { name: 'Case Part A: Familial Bonds', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/first-person-PART-A-JACK-SMITH-CASE-PART-TATIANA.pdf' },
      { name: 'Case Part B: Jack Reflects Back', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/Part-B-Gaska-Tape.-Jack-reflects-back.pdf' },
      { name: 'Case Part C: Changes at Gaska Tape', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/04/PART-C-Jack-Smith.pdf' },
      { name: 'Teaching Note', url: 'https://goodbrandtoolkit.com/wp-content/uploads/2024/05/Teaching-Note-Gaska-Tape.pdf' },
    ]
  },
  { title: 'Success Story 2: Placeholder', link: '#' },
  { title: 'Success Story 3: Placeholder', link: '#' },
  { title: 'Success Story 4: Placeholder', link: '#' },
  { title: 'Success Story 5: Placeholder', link: '#' },
  { title: 'Success Story 6: Placeholder', link: '#' },
];

export default function HomePage() {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const { caseData } = useCase();

  const successStories = [...defaultSuccessStories];
  if (caseData.isCustom) {
    successStories[0] = {
      title: caseData.title,
      link: '/case-study/gaska-tape',
      resources: caseData.resources?.map(r => ({ name: r.title, url: r.url })) || []
    };
  }

  return (
    <div className="pb-12 w-full">
      <Header />
      
      <div className="w-full bg-[#060644] py-6 text-center border-b-4 border-black shadow-md relative z-40">
        <p className="text-2xl md:text-3xl text-white font-display font-bold uppercase tracking-wide max-w-5xl mx-auto px-4 leading-tight">
          Working to perpetuate the cycle of entrepreneurship in communities across the nation
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {successStories.map((story, index) => (
          <div key={index} className="relative group">
            <Link 
              to={story.link} 
              className="relative block h-full bg-white p-8 border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all overflow-hidden"
            >
              {!caseData.isCustom && index === 0 && (
                <img 
                  src="https://www.gaska.com/wp-content/uploads/2025/08/GaskaULCert-1024x683.png" 
                  alt="Gaska Tape product collage"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-multiply pointer-events-none" 
                />
              )}
              <div className="relative">
                <h2 className="text-3xl font-display font-bold text-black uppercase tracking-tight">{`Success Story ${index + 1}`}</h2>
                <p className="mt-4 text-xl text-gray-900 font-medium pr-8 leading-snug">{story.title}</p>
              </div>
            </Link>

            {story.resources && (
              <div className="absolute top-8 right-8 z-10">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === index ? null : index);
                  }}
                  className="p-2 bg-white border-2 border-black rounded-full hover:bg-yellow-400 hover:border-yellow-400 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  title="View Case PDFs"
                >
                  <ChevronDown className={`h-5 w-5 text-black transition-transform ${openDropdown === index ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === index && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-20">
                    <div className="p-4 bg-black border-b-2 border-black">
                      <p className="text-xs font-bold text-white uppercase tracking-widest">Case Resources (PDF)</p>
                    </div>
                    {story.resources.map((res, rIdx) => (
                      <a
                        key={rIdx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="flex items-center gap-3 px-4 py-4 text-sm font-medium text-black hover:bg-yellow-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <FileText className="h-5 w-5 text-black" />
                        {res.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-16 text-center">
        <a 
          href="https://theiec.org/contact-us" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 bg-[#060644] text-white font-display font-bold text-xl uppercase tracking-widest border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
        >
          Let's Partner
        </a>
      </div>
      </div>
    </div>
  );
}
