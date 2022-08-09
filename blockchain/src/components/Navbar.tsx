import { FunctionComponent } from "react";
import { AiOutlineLogin, AiOutlineLogout, AiOutlineQq, AiOutlineUser, AiTwotoneBell } from "react-icons/ai";
import { Link } from "react-router-dom";
import { PlayerType } from "../interfaces";
import Profile from "./Profile";

type Props = {
    sessionPlayer: PlayerType | null
    setSessionPlayer(sessionPlayer: PlayerType | null): void,
    pollingUser: boolean;
    setPollingUser : (polling: boolean) => void
};

const Navbar: FunctionComponent<Props> = ({ sessionPlayer, setSessionPlayer, pollingUser, setPollingUser }) => {

    const handleClick = async (e: any) => {
        const { name, value } = e.target;
        console.log("handle click is called...", name);
        sessionStorage.setItem("player", "");
        setSessionPlayer(null);
    };

    if (sessionPlayer) {
        return (
            <>
                <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item dropdown no-arrow mx-1">
                            <div className="nav-item dropdown no-arrow mx-1 show">
                                <a className="nav-link dropdown-toggle" href="#" id="alertsDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                    <AiTwotoneBell />
                                    <span className="badge badge-danger badge-counter">3+</span>
                                </a>
                                <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="alertsDropdown">
                                    <h6 className="dropdown-header">
                                        Alerts Center
                                    </h6>
                                    <a className="dropdown-item d-flex align-items-center" href="#">
                                        <div className="mr-3">
                                            <div className="icon-circle bg-primary">
                                                <i className="fas fa-file-alt text-white"></i>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="small text-gray-500">December 12, 2019</div>
                                            <span className="font-weight-bold">A new monthly report is ready to download!</span>
                                        </div>
                                    </a>
                                    <a className="dropdown-item text-center small text-gray-500" href="#">Show All Alerts</a>
                                </div>
                            </div>
                        </li>
                        <div className="topbar-divider d-none d-sm-block"></div>
                        <li className="nav-item dropdown no-arrow">
                            <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span className="mr-2 d-none d-lg-inline text-gray-600 small">{sessionPlayer.userName}</span>
                                <AiOutlineQq />
                            </a>
                            <div className="text-center dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                                <Profile sessionPlayer={sessionPlayer} setSessionPlayer={setSessionPlayer} pollingUser={pollingUser} setPollingUser={setPollingUser}/>
                                <div className="dropdown-divider"></div>
                                {/* data-toggle="modal" data-target="#logoutModal" */}
                                <Link className="dropdown-item" to="#"
                                    onClick={handleClick}> 
                                    <AiOutlineLogout/>
                                    Logout
                                </Link>
                                {/* <div className="modal fade" id="logoutModal" style={{ display: 'block' }}> 
                                    <div className="modal-dialog" role="document">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
                                                <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                                                    <span aria-hidden="true">×</span>
                                                </button>
                                            </div>
                                            <div className="modal-body">Select "Logout" below if you are ready to end your current session.</div>
                                            <div className="modal-footer">
                                                <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
                                                <a className="btn btn-primary" href="login.html">Logout</a>
                                            </div>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </li>
                    </ul>
                </nav>
            </>
        )
    } else {
        return (
            <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item dropdown no-arrow mx-1">
                        <div className="nav-item dropdown no-arrow mx-1 show">
                            <a className="nav-link dropdown-toggle" href="#" id="alertsDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                <AiTwotoneBell />
                                <span className="badge badge-danger badge-counter">3+</span>
                            </a>
                            <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="alertsDropdown">
                                <h6 className="dropdown-header">
                                    Alerts Center
                                </h6>
                                <a className="dropdown-item d-flex align-items-center" href="#">
                                    <div className="mr-3">
                                        <div className="icon-circle bg-primary">
                                            <i className="fas fa-file-alt text-white"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="small text-gray-500">December 12, 2019</div>
                                        <span className="font-weight-bold">A new monthly report is ready to download!</span>
                                    </div>
                                </a>
                                <a className="dropdown-item text-center small text-gray-500" href="#">Show All Alerts</a>
                            </div>
                        </div>
                    </li>
                    <div className="topbar-divider d-none d-sm-block"></div>
                    <li className="nav-item dropdown no-arrow">
                        <Link className="nav-link" to="/login">
                            <AiOutlineUser />
                        </Link>
                    </li>
                </ul>
            </nav>
        )
    }

}

export default Navbar;



{/* <header className="nk-header nk-header-opaque">
    <nav className="nk-navbar nk-navbar-top nk-navbar-sticky nk-onscroll-show nk-navbar-fixed">
        <div className="container">
            <div className="nk-nav-table">

                <Link to="/" className="nk-nav-logo">
                    <img src="assets/images/logo.png" alt="GoodGames" width="199" />
                </Link>

                <ul className="nk-nav nk-nav-right d-none d-lg-table-cell" data-nav-mobile="#nk-nav-mobile">
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/login">Login</Link>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</header> */}