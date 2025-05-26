import { useState } from "react"
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";
import { Link, useNavigate } from "react-router";
import useAuthStore from "../useAuthStore";

export default function Header() {
    const [ isNavbarOpen, setIsNavbarOpen ] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const { isStaff, token } = useAuthStore.getState();

    const handleLogOut = () =>{
        try {
            logout();
            navigate("/");
            console.log("logged out successfully");
            location.reload();
        }
        catch(error) {
            console.log(error);
        }
    }

    return(
        <>
            <header className="flex items-center justify-center">
                <Link to="/">
                    <h1 className="font-logo p-3 md:p-4 lg:p-5 text-2xl md:text-3xl lg:text-4xl w-fit">
                        LIBRATRACK
                    </h1>
                </Link>
                {token ?
                    <>
                        {!isNavbarOpen ?
                            <RxHamburgerMenu onClick={() => {document.getElementById("navbar").classList.toggle("navbarOpen"); setIsNavbarOpen((m) => !m)}} className="text-3xl md:text-4xl lg:text-5xl cursor-pointer fixed top-0 right-0 m-3 md:m-4 lg:m-5 z-[1001]" />
                            :
                            <IoMdClose onClick={() => {document.getElementById("navbar").classList.toggle("navbarOpen"); setIsNavbarOpen((m) => !m)}} className="text-3xl md:text-4xl lg:text-5xl cursor-pointer fixed top-0 right-0 m-3 md:m-4 lg:m-5 z-[1001]" />
                        }
                    </>
                    :
                    null
                }
            </header>


            {isNavbarOpen && <div onClick={() => {document.getElementById("navbar").classList.toggle("navbarOpen"); setIsNavbarOpen((m) => !m)}} className="fixed inset-0 z-[998]"></div>}

            {/* navbar */}
            {token ? 
                <div id="navbar" className="fixed top-[-100%] right-0 z-[1000] transition-all
                                            w-full md:w-1/2 lg:w-1/3 h-fit
                                            bg-light-card dark:bg-dark-card shadow-2xl
                                            flex flex-col rounded-b-2xl md:rounded-tl-2xl">
                    <h2 className="font-logo text-center text-2xl lg:text-3xl p-3 md:p-5 lg:p-7">
                        LIBRATRACK
                    </h2>
                    {isStaff ? 
                        <>
                            <Link className="navbarLink" to="/">
                                Home
                            </Link>
                            <Link className="navbarLink" to="/staffloans">
                                Manage Loans
                            </Link>
                            <Link className="navbarLink" to="/staffbooks">
                                Create Loan
                            </Link>
                        </>
                        :
                        <>
                            <Link className="navbarLink" to="/">
                                Home
                            </Link>
                            <Link className="navbarLink" to="/books">
                                View Books
                            </Link>
                            <Link className="navbarLink" to="/loans">
                                Loan History
                            </Link>
                        </>
                    }
                    <p className="navbarLink cursor-pointer" onClick={() => document.getElementById("html").classList.toggle("dark")}>
                        Change Theme
                    </p>
                    <button onClick={handleLogOut} className="logout-button w-fit ml-4 md:ml-5 lg:ml-6 my-4 md:my-6 lg:my-8">
                        Log Out
                    </button>
                </div>
                :
                null
            }
        </>
    )
}