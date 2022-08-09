import { ChangeEvent, ChangeEventHandler, useState } from "react";
import PropTypes from 'prop-types';
import { PlayerType } from "../interfaces";
import { Link } from "react-router-dom";

type SetSessionProps = {
    setSession: React.Dispatch<React.SetStateAction<any>>;
}

export default function Login() {
    const [player, setPlayer] = useState<PlayerType>({ userName: "", password: "", wallet: "", credibility: 0, balance: 0 });

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const { name, value } = e.target;
        setPlayer((prev) => (
            { ...prev, [name]: value }
        ))
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4005/player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ player: player })
            })

            const body = await res.json();

            if (res.ok) {
                const result = JSON.stringify(body.result);
                sessionStorage.setItem("player", result);
                window.location.assign("/");
            }
            else {
                console.log(body);
                alert("Wrong username or password!")
                setPlayer({ userName: "", password: "", wallet: "", credibility: 0, balance: 0 });
            }
        } catch (error) {
            console.error(error);
        }

    };

    return (
        <>
            <div className="row justify-content-center">
                <div className="col-xl-10 col-lg-12 col-md-9">
                    <div className="card o-hidden border-0 shadow-lg my-5">
                        <div className="card-body p-0">
                            <div className="row">
                                <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                                <div className="col-lg-6">
                                    <div className="p-5">
                                        <div className="text-center">
                                            <h1 className="h4 text-gray-900 mb-4">Welcome Back!</h1>
                                        </div>
                                        <form className="user">
                                            <div className="form-group">
                                                <input type="text" name="userName" className="form-control form-control-user" placeholder="Enter Username..."
                                                    onChange={handleInput}
                                                    value={player.userName} />
                                            </div>
                                            <div className="form-group">
                                                <input type="password" name="password" className="required form-control form-control-user" placeholder="Enter Password..."
                                                    onChange={handleInput}
                                                    value={player.password} />
                                            </div>
                                            <Link to="/" className="btn btn-primary btn-user btn-block"
                                                onClick={handleSubmit}>
                                                Login
                                            </Link>
                                        </form>
                                        <hr />
                                        <div className="text-center">
                                            <Link to="/register">Create an Account!</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}



