import { useState } from 'react';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  skipWarning?: boolean;
}

export default function ExternalLink({ href, children, className = '', skipWarning = false }: ExternalLinkProps) {
  const [showWarning, setShowWarning] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (skipWarning) {
      return;
    }
    e.preventDefault();
    setShowWarning(true);
  };

  const handleProceed = () => {
    window.open(href, '_blank');
    setShowWarning(false);
  };

  return (
    <>
      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>
      
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#111] border-2 border-text p-4 rounded max-w-md text-sm font-mono font-normal lowercase">
            <div className="text-text mb-2 text-sm">external link warning</div>
            <div className="text-[#888] dark:text-[#666] mb-4 text-sm">
              you are about to be redirected to an external website:
              <div className="mt-1 text-sm">{href.toLowerCase()}</div>
            </div>
            <div className="flex justify-end gap-2 text-sm">
              <button
                onClick={() => setShowWarning(false)}
                className="px-3 py-1 text-[#888] hover:text-text"
              >
                cancel
              </button>
              <button
                onClick={handleProceed}
                className="px-3 py-1 bg-[#f60] text-white hover:bg-[#f70]"
              >
                i understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
