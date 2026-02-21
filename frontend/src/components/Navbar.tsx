import { NavLink } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav>
            <div className="nav-inner">
                <NavLink to="/" className="nav-brand">ResearchBrief</NavLink>
                <div className="nav-links">
                    <NavLink to="/" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} end>Home</NavLink>
                    <NavLink to="/briefs" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Saved</NavLink>
                    <NavLink to="/status" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Status</NavLink>
                </div>
            </div>
        </nav>
    )
}
