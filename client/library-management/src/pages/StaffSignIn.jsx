import { useEffect, useRef, useState } from "react"
import axios from "axios";
import useAuthStore from "../useAuthStore";
import { useNavigate } from "react-router";

export default function StaffSignIn() {
    const [ errorDisplay, setErrorDisplay ] = useState();
    const emailRef = useRef();
    const passwordRef = useRef();

    const navigate = useNavigate();
    const API_BASE = "http://localhost:3000";
    const { setAuth } = useAuthStore();
    const { token } = useAuthStore.getState();

    useEffect(() => {
        if(token) {
            navigate("/");
        }
    }, [])

    const handleStaffLogIn = async (e) => {
        e.preventDefault();
        setErrorDisplay();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        try {
            const response = await axios.post(`${API_BASE}/api/auth/staff/login`, { email, password });
            const data = response.data.data;

            if(response.data.success) {
                setAuth(data.token, {
                    id: data.staffId,
                    name: data.name,
                    email: data.email,
                    role: data.role
                }, true)
                console.log("staff log in successful");
                navigate("/");
            }
        }
        catch(error) {
            console.log(error);
            if(error.status === 400) {
                setErrorDisplay("E-mail and password are required.")
            }
            else if(error.status === 401) {
                setErrorDisplay("Invalid credentials.")
            }
            else {
                setErrorDisplay("Something went wrong. Please try again.")
            }
        }
    }

    return(
        <>
            {!token ?
                <div className="w-9/10 md:w-3/5 xl:w-1/2 p-4 md:p-6 lg:p-8 
                                absolute top-1/2 left-1/2 transform -translate-1/2
                                flex flex-col items-center gap-y-6 md:gap-y-8 lg:gap-y-10">
                    <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold">
                        Staff Sign In
                    </h1>
                    {errorDisplay ? 
                        <p className="text-delete text-center md:text-lg lg:text-xl">{errorDisplay}</p>
                        :
                        null
                    }
                    <input ref={emailRef} className="input" type="email" placeholder="E-mail" />
                    <input ref={passwordRef} className="input" type="password" placeholder="Password" />
                    <button onClick={handleStaffLogIn} className="primary-button">
                        Sign In
                    </button>
                </div>
                :
                null
            }
        </>
    )
}