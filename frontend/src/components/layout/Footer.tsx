import { ArrowUp } from "lucide-react";
import { siteConfig } from "../../data/site";
import { scrollToSection } from "../../lib/scrollTo";
import { GithubMark, LinkedinMark } from "../ui/BrandIcons";

export function Footer() {
  return (
    <footer className="border-t border-border/8 py-8">
      <div className="container-content flex flex-col items-center justify-between gap-4 text-sm text-tertiary sm:flex-row">
        <p>© {new Date().getFullYear()} By yours truly. Astral</p>

        <div className="flex items-center gap-4">
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hover:text-primary"
          >
            <GithubMark size={16} />
          </a>
          <a
            href={siteConfig.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="hover:text-primary"
          >
            <LinkedinMark size={16} />
          </a>
          <button
            type="button"
            onClick={() => scrollToSection("hero")}
            aria-label="Back to top"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border/10 hover:text-primary"
          >
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
