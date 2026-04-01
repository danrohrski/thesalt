import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ProseMarkdown({ children }: { children: string }) {
  return (
    <div
      className="font-light leading-relaxed text-base"
      style={{ fontFamily: "var(--font-display)", color: "#232120" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 space-y-1 pl-5" style={{ listStyleType: "disc" }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 space-y-1 pl-5" style={{ listStyleType: "decimal" }}>
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          h2: ({ children }) => (
            <h2
              className="text-2xl font-light mt-6 mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className="text-xs tracking-widest uppercase mt-4 mb-2 font-light"
              style={{ fontFamily: "var(--font-display)", color: "rgba(35,33,32,0.5)", letterSpacing: "0.1em" }}
            >
              {children}
            </h3>
          ),
          hr: () => (
            <hr style={{ border: "none", borderTop: "1px solid rgba(35,33,32,0.1)", margin: "1.5rem 0" }} />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-opacity hover:opacity-70"
              style={{ color: "#c4622d" }}
            >
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
