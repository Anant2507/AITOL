export default function Footer() {
  return (
    <footer className="border-t border-[--border] py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-6 text-sm text-[--text-secondary]">
        <span>© 2026 AITOL</span>
        <div className="flex gap-6">
          <a
            href="https://github.com/Anant2507/AITOL#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition-colors"
          >
            Documentation
          </a>
          <a
            href="https://github.com/Anant2507/AITOL"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://github.com/Anant2507/AITOL/commits"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition-colors"
          >
            Changelog
          </a>
        </div>
        <span>Node.js · TypeScript · Redis</span>
      </div>
    </footer>
  );
}