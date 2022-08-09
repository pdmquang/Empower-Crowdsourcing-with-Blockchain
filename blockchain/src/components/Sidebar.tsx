import { Link } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";
import { MdOutlineHowToVote } from "react-icons/md";

export default function Sidebar() {
    return (
        <>
            <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
                <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
                    <div className="sidebar-brand-text mx-3">FakeCheck</div>
                </Link>
                <hr className="sidebar-divider my-0"></hr>
                <li className="nav-item">
                    <Link className="nav-link" to="/">
                        <AiOutlineHome />
                        <span>Home</span>
                    </Link>
                    <Link className="nav-link" to="/transaction">
                        <MdOutlineHowToVote/>
                        <span>Past Votes</span>
                    </Link>
                </li>
            </ul>

        </>
    )
}