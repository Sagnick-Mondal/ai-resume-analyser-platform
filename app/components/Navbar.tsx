import {Link} from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar bg-transparent">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMEPORT</p>
            </Link>
            <Link to="/upload" className="primary-button font-semibold w-fit">
                Upload Resume
            </Link>
            <Link to="/wipe" className="bg-gradient-to-br from-rose-400 via-amber-700 to-red-700 text-black rounded-full px-4 py-2 cursor-pointer font-semibold w-fit">
                Wipe Data
            </Link>
        </nav>
    )
}
export default Navbar
