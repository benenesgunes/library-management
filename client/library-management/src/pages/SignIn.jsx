import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router";
import axios from "axios"
import useAuthStore from "../useAuthStore";

export default function SignIn() {
    const [ errorDisplay, setErrorDisplay ] = useState();
    const emailRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();
    
    const { token } = useAuthStore.getState();

    useEffect(() => {
        if(token) {
            navigate("/");
        }
    }, [])

    const API_BASE = "http://localhost:3000";
    const { setAuth } = useAuthStore();

    const handleLogIn = async (e) => {
        e.preventDefault();
        setErrorDisplay();

        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        try {
            const response = await axios.post(`${API_BASE}/api/auth/member/login`, { email, password });
            const data = response.data.data;
            if(response.data.success) {
                setAuth(data.token, {
                    id: data.memberId,
                    name: data.name,
                    email: data.email
                }, false)
                console.log("log in successful");
                navigate("/");
            }
            else {
                setErrorDisplay(response.data.message || "Something went wrong");
            }
        }
        catch(error) {
            console.log(error);
        }
    }

    return(
        <>
            {!token ?
                <div className="w-9/10 md:w-3/5 xl:w-1/2 p-4 md:p-6 lg:p-8 
                                absolute top-1/2 left-1/2 transform -translate-1/2
                                flex flex-col items-center gap-y-6 md:gap-y-8 lg:gap-y-10">
                    <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold">
                        Sign In
                    </h1>
                    {errorDisplay && <p className="text-center text-error-red lg:text-xl">{errorDisplay} </p>}
                    <input ref={emailRef} className="input" type="email" placeholder="E-mail" />
                    <input ref={passwordRef} className="input" type="password" placeholder="Password" />
                    <button onClick={handleLogIn} className="primary-button">
                        Sign In
                    </button>
                    <Link to="/signup" className="md:text-lg lg:text-xl border-b-2 border-transparent hover:border-light-text dark:hover:border-dark-text">
                        Don't have an account? Sign up here.
                    </Link>
                </div>
                :
                null
            }
        </>
    )
}