import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
interface Props {
    markdown: string;
}

export default function MarkdownView({ markdown }: Props) {
    return (
        <div className="prose prose-lg max-w-none">
            <ReactMarkdown
                components={{
                    h1: ({node, ...props}) => <h1 style={{fontSize: '2em', fontWeight: 'bold', marginBottom: '0.5em'}} {...props} />,
                    h2: ({node, ...props}) => <h2 style={{fontSize: '1.5em', fontWeight: 'bold', marginBottom: '0.5em'}} {...props} />,
                    h3: ({node, ...props}) => <h3 style={{fontSize: '1.17em', fontWeight: 'bold', marginBottom: '0.5em'}} {...props} />,

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    code({ children, className, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;

                        return isInline ? (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        ) : (
                            <SyntaxHighlighter
                                style={tomorrow}
                                language={match[1]}
                                PreTag="div"
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        );
                    }
                }}
            >
                {markdown}
            </ReactMarkdown>
        </div>
    );
}