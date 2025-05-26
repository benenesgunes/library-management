import axios from "axios"
import useAuthStore from "../useAuthStore"
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

export default function StaffBooks() {
    const navigate = useNavigate();
    const API_BASE = "http://localhost:3000";
    const [ staffBooks, setStaffBooks ] = useState();
    const { token, isStaff } = useAuthStore.getState();
    const memberIdRef = useRef();
    const [ bookId, setBookId ] = useState();

    useEffect(() => {
        const fetchStaffBooks = async () => {
            if(!token) {
                return navigate("/signup");
            }
            if(!isStaff) {
                return navigate("/");
            }

            try {
                const response = await axios.get(`${API_BASE}/api/staff/books`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })

                if(response.data.success) {
                    setStaffBooks(response.data.data);
                    console.log("fetched staff books successfully")
                }
            }
            catch(error) {
                console.log(error);
            }
        }

        fetchStaffBooks();
    }, [])

    const handleCreateLoan = async (bookId, memberId) => {
        const { token } = useAuthStore.getState();

        try {
            const response = await axios.post(`${API_BASE}/api/staff/loans`, { bookId, memberId }, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if(response.data.success) {
                console.log("loan created successfully");
            }
        }
        catch(error) {
            console.log(error);
        }
    }

    return(
        <>
            {token ? 
                <>
                    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-y-2 md:gap-y-3 lg:gap-y-4">
                        <h1 className="font-semibold text-xl md:text-2xl lg:text-3xl">
                            Available Books
                        </h1>
                        <div className="flex flex-col gap-y-2 md:gap-y-3 lg:gap-y-4 md:gap-x-3 lg:gap-x-4 md:grid md:grid-cols-2 xl:grid-cols-3">
                            {staffBooks?.map((book) => (
                                <div key={book.Book_ID} className="bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border border-2 p-4 md:p-5 lg:p-6 rounded-2xl flex justify-between items-center">
                                    <div className="space-y-1 md:space-y-2 lg:space-y-3">
                                        <div className="flex items-end gap-x-2 md:gap-x-3 lg:gap-x-4">
                                            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">
                                                {book.Title}
                                            </h2>
                                            <p className="text-light-text/50 dark:text-dark-text/50 text-md md:text-base lg:text-lg">
                                                {book.Category_Name}
                                            </p>
                                        </div>
                                        <p className="text-md md:text-base lg:text-lg">
                                            {book.Author_Name}
                                        </p>
                                    </div>
                                    <button onClick={() => {document.getElementById("idInputDiv").classList.add("idInputDivOpen"); setBookId(book.Book_ID)}} className="primary-button">
                                        Loan
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div id="idInputDiv" className="absolute top-1/2 left-1/2 transform -translate-1/2 z-[1001]
                                    p-4 md:p-6 lg:p-8
                                    bg-light-card dark:bg-dark-card
                                    hidden flex-col items-center gap-y-4 md:gap-y-6 lg:gap-y-8
                                    shadow-2xl rounded-2xl
                                    border-2 border-light-border dark:border-dark-border
                                    w-4/5 md:w-3/5 lg:w-1/3">
                        <input ref={memberIdRef} type="number" className="input" placeholder="Member ID" />
                        <button onClick={() => {handleCreateLoan(bookId, memberIdRef.current.value); document.getElementById("idInputDiv").classList.remove("idInputDivOpen")}} className="primary-button">
                            Enter Member ID
                        </button>
                    </div>
                </>
                :
                null
            }
        </>
    )
}