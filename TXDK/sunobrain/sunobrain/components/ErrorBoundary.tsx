import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("ErrorBoundary caught:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        padding: 32,
                        color: "#F87171",
                        fontFamily: "'Nunito', sans-serif",
                        background: "#020617",
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                    }}
                >
                    <h2 style={{ color: "#F1F5F9" }}>Something went wrong</h2>
                    <pre style={{ color: "#F87171", fontSize: 14 }}>
                        {this.state.error?.message}
                    </pre>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        style={{
                            background: "transparent",
                            border: "1px solid #D4AF37",
                            color: "#D4AF37",
                            padding: "8px 24px",
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 700,
                            letterSpacing: "2px",
                            borderRadius: "9999px",
                            cursor: "pointer",
                        }}
                    >
                        RETRY
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
