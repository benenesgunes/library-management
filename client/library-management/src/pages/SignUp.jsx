import { useRef, useState, useEffect } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import useAuthStore from "../useAuthStore";
import axios from "axios";

export default function SignUp() {
    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const phoneNumberRef = useRef();
    const addressRef = useRef();

    const [ errorDisplay, setErrorDisplay ] = useState();
    const API_BASE = "http://localhost:3000";
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const { token } = useAuthStore.getState();

    useEffect(() => {
        if(token) {
            navigate("/");
        }
    }, [])

    const handleRegister = async (e) => {
        e.preventDefault();

        const firstName = firstNameRef.current.value;
        const lastName = lastNameRef.current.value;
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        const passwordConfirm = passwordConfirmRef.current.value;
        const phoneNumber = phoneNumberRef.current.value;
        const address = addressRef.current.value;

        if(password !== passwordConfirm) {
            return setErrorDisplay("Make sure both passwords are the same!");
        }

        try {
            const response = await axios.post(`${API_BASE}/api/auth/member/register`, { firstName, lastName, email, password, phoneNumber, address });
            const data = response.data.data;
            if(response.data.success) {
                setAuth(data.token, {
                    id: data.memberId, 
                    name: `${data.firstName} ${data.lastName}`,
                    email
                }, false) // isStaff false
                console.log("registiration successful");
                navigate("/")
            }
        }
        catch(error) {
            console.log(error);
            if(error.status === 400) {
                setErrorDisplay("E-mail already registered.")
            }
            else {
                setErrorDisplay("Something went wrong. Please try again.")
            }
        }
    }

    return(
        <>
            {!token ? 
                <div className="w-9/10 md:w-4/5 xl:w-1/2 p-4 md:p-6 lg:p-8 
                                absolute top-1/2 left-1/2 transform -translate-1/2
                                flex flex-col items-center md:grid md:grid-cols-2 md:justify-items-center gap-y-6 md:gap-y-8 md:gap-x-8 lg:gap-y-10 lg:gap-x-10">
                    <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold md:col-start-1 md:col-end-3">
                        Sign Up
                    </h1>
                    {errorDisplay ? 
                        <p className="text-delete md:col-start-1 md:col-end-3 text-center md:text-lg lg:text-xl">{errorDisplay}</p>
                        :
                        null
                    }
                    <input ref={emailRef} className="input md:col-start-1 md:col-end-3" type="email" placeholder="E-mail" />
                    <input ref={firstNameRef} className="input" type="text" placeholder="First name" />
                    <input ref={lastNameRef} className="input" type="text" placeholder="Last name" />
                    <input ref={phoneNumberRef} maxLength={10} className="input" type="number" placeholder="Phone number (not required)" />
                    <input ref={addressRef} className="input" type="email" placeholder="Address (not required)" />
                    <input ref={passwordRef} className="input" type="password" placeholder="Password" />
                    <input ref={passwordConfirmRef} className="input" type="password" placeholder="Confirm password" />
                    <button onClick={handleRegister} className="primary-button md:col-start-1 md:col-end-3">
                        Sign Up
                    </button>
                    <Link to="/signin" className="md:text-lg lg:text-xl md:col-start-1 md:col-end-3 border-b-2 border-transparent hover:border-light-text dark:hover:border-dark-text">
                        Already have an account? Sign in here.
                    </Link>
                </div>
                :
                null
            }
        </>
    )
}