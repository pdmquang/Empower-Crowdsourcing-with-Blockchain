import { useState } from "react";
import { Link } from "react-router-dom";
import { PlayerType } from "../interfaces";

export default function Register() {
    const [player, setPlayer] = useState<PlayerType>({ userName: "", password: "", wallet: "", credibility: 0, balance: 0 });

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const { name, value } = e.target;
        setPlayer((prev) => (
            { ...prev, [name]: value }
        ))
    }

    const handleSubmit = async (e: any) => {
        console.log("Register is called")
        try {
            const res = await fetch('http://localhost:4005/player/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ player: player })
            })

            const body = await res.json();

            if (res.ok) {
                alert(body.message);
                setPlayer({ userName: "", password: "", wallet: "", credibility: 0, balance: 0 });
                // window.location.assign("/login");
            } else {
                alert(body.message)
            }

        } catch (error) {
            console.error(error);
        }

    };

    return (
        <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-12 col-md-9">
                <div className="card o-hidden border-0 shadow-lg my-5">
                    <div className="card-body p-0">
                        <div className="row">
                            <div className="col-lg-6 d-none d-lg-block bg-register-image"></div>
                            <div className="col-lg-6">
                                <div className="p-5">
                                    <div className="text-center">
                                        <h1 className="h4 text-gray-900 mb-4">Create an Account!</h1>
                                    </div>
                                    <form className="user">
                                        <div className="form-group">
                                            <input type="text" name="userName" className="required form-control form-control-user" placeholder="Enter Username..."
                                                onChange={handleInput}
                                                value={player.userName} />
                                        </div>
                                        <div className="form-group">
                                            <input type="password" name="password" className="required form-control form-control-user" placeholder="Enter Password..."
                                                onChange={handleInput}
                                                value={player.password} />
                                        </div>
                                        <input type="text" name="wallet" className="required form-control form-control-user" placeholder="Enter Wallet..."
                                            onChange={handleInput}
                                            value={player.wallet} />
                                        <hr />
                                        <button type="button" className="btn btn-primary btn-user btn-block"
                                            onClick={handleSubmit}>
                                            Register Account
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

