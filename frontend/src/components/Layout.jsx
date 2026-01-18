import { Link, useLocation } from "react-router-dom";
import "./Layout.css";

const Layout = ({ children }) => {
    const location = useLocation();

    return (
        <div className="layout">
            <header className="header">
                <div className="header-content container">
                    <Link to="/" className="logo">
                        <span className="logo-mark">G</span>
                        <span className="logo-text">GENzNEWS</span>
                    </Link>

                    <nav className="nav" />
                </div>
            </header>

            <main className="main">
                <div className="container">
                    {children}
                </div>
            </main>

            <footer className="footer">
                <div className="footer-content container">
                    <span className="footer-text">© 2026 GENzNEWS</span>
                    <span className="footer-tagline">News, reimagined</span>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
