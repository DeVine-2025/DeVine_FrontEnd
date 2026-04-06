import { getMemberTerms, type MemberTermsItem } from '@apis/terms';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const [terms, setTerms] = useState<MemberTermsItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    void getMemberTerms(controller.signal)
      .then((items) => {
        setTerms(items);
      })
      .catch((error) => {
        if ((error as Error)?.name !== 'AbortError') {
          console.warn('[footer] API terms fetch failed', error);
        }
        setTerms([]);
      });

    return () => controller.abort();
  }, []);

  return (
    <footer className="-translate-x-1/2 relative left-1/2 w-screen bg-[var(--ui-bg)] py-[2rem]">
      <div className="mx-auto max-w-[144rem] flex-col-center gap-[0.5rem] px-[6rem]">
        <div className="mb-[0.8rem] flex-items-center gap-[2.4rem]">
          {terms.map((term, index) => (
            <div key={term.termsId} className="flex items-center gap-[2.4rem]">
              <button
                type="button"
                onClick={() => navigate(`/terms/${term.termsId}`)}
                className="Label1 cursor-pointer text-[var(--ui-600)] transition-colors hover:text-[var(--ui-800)]"
              >
                {term.title}
              </button>
              {index < terms.length - 1 ? (
                <div className="h-[1.2rem] w-[1px] bg-[var(--ui-600)] opacity-30" />
              ) : null}
            </div>
          ))}

          {terms.length > 0 ? <div className="h-[1.2rem] w-[1px] bg-[var(--ui-600)] opacity-30" /> : null}

          <a
            href="/service"
            rel="noopener noreferrer"
            className="Label1 cursor-pointer text-[var(--ui-600)] transition-colors hover:text-[var(--ui-800)]"
          >
            서비스 소개
          </a>
        </div>

        <div className="flex-col-center gap-[0.5rem]">
          <p className="Caption1 font-medium text-[11px] text-[var(--ui-600)]">Contact</p>
          <p className="Caption1 text-center font-medium text-[11px] text-[var(--ui-600)]">
            Copyright Devine. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
