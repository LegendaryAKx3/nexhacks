import { Link, useLocation } from "react-router-dom";
import "./Layout.css";

const Layout = ({ children }) => {
    const location = useLocation();

    return (
        <div className="layout">
            <header className="header">
                <div className="header-content container">
                    <Link to="/" className="logo">
                        <span className="logo-mark">D</span>
                        <span className="logo-text">DeepResearchPod</span>
                    </Link>

                    <nav className="nav">
                        <Link
                            to="/"
                            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                        >
                            Topics
                        </Link>
                        <Link
                            to="/research"
                            className={`nav-link ${location.pathname === '/research' ? 'active' : ''}`}
                        >
                            Research
                        </Link>
                        <Link
                            to="/agents"
                            className={`nav-link ${location.pathname === '/agents' ? 'active' : ''}`}
                        >
                            Agents
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    {children}
                </div>
            </main>

            <footer className="footer">
                <div className="footer-content container">
                    <span className="footer-text">© 2026 DeepResearchPod</span>
                    <span className="footer-tagline">News, reimagined</span>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
