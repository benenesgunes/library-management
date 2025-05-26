import { Link } from "react-router"
import useAuthStore from "../useAuthStore";

export default function Home() {
    const { token, user, isStaff } = useAuthStore.getState();

    return(
        <>
            {!token ?
                <div className="absolute top-1/2 left-1/2 transform -translate-1/2 w-4/5 md:w-3/5 lg:w-1/2 text-center space-y-6 md:space-y-8 lg:space-y-10">
                    <h1 className="font-semibold text-xl md:text-2xl lg:text-3xl">
                        Your personalized library gateway — search, explore, and check the availability of books you can loan with ease.
                    </h1>
                    <p className="font-bold md:text-lg lg:text-xl">
                        Log in to view your borrowable collection, track loans, and discover what’s available now.
                    </p>
                    <Link to="/signup" className="block">
                        <button className="primary-button">
                            Sign Up Now
                        </button>
                    </Link>
                    <Link to="/staffsignin" className="border-b-2 border-transparent hover:border-light-text dark:hover:border-dark-text block w-fit mx-auto text-sm md:text-md lg:text-base">
                        Log in as staff
                    </Link>
                </div>
                :
                <div className="absolute top-1/2 left-1/2 transform -translate-1/2 w-4/5 md:w-3/5 lg:w-1/2 text-center space-y-6 md:space-y-8 lg:space-y-10">
                    <h1 className="font-semibold text-xl md:text-2xl lg:text-3xl">
                        Welcome back, {user.name}
                    </h1>
                    {isStaff ?
                        <p className="font-bold md:text-lg lg:text-xl">
                            Everything’s set — manage books, track loans, and keep the library running smoothly. Ready to get started?
                        </p>
                        :
                        <p className="font-bold md:text-lg lg:text-xl">
                            Browse the collection, check book availability, and manage your loans — all in one place. What would you like to read today?
                        </p>
                    }
                    {isStaff ?
                        <Link to="/staffloans" className="block">
                            <button className="primary-button">
                                Manage Loans
                            </button>
                        </Link>
                        :
                        <Link to="/books" className="block">
                            <button className="primary-button">
                                View Books
                            </button>
                        </Link>
                    }
                </div>
            }
        </>
    )
}