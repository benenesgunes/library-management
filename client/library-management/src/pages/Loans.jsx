import axios from "axios"
import useAuthStore from "../useAuthStore"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react";

export default function Loans() {
    const navigate = useNavigate();
    const API_BASE = "http://localhost:3000";
    const [ loans, setLoans ] = useState();
    const { token, isStaff } = useAuthStore.getState();

    useEffect(() => {
        const fetchLoans = async () => {
            if(!token) {
                return navigate("/signup");
            }

            if(isStaff) {
                return navigate("/");
            }

            try {
                const response = await axios.get(`${API_BASE}/api/member/loans`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })

                if(response.data.success) {
                    setLoans(response.data.data);
                    console.log("fetched loans successfully");
                }
            }
            catch(error) {
                console.log(error);
            }
        }

        fetchLoans();
    }, [])

    return(
        <>
            {token ?
                <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-y-2 md:gap-y-3 lg:gap-y-4">
                    <h1 className="font-semibold text-xl md:text-2xl lg:text-3xl">
                        Your Loan History
                    </h1>
                    <div className="flex flex-col gap-y-2 md:gap-y-3 lg:gap-y-4 md:gap-x-3 lg:gap-x-4 md:grid md:grid-cols-2 xl:grid-cols-3">
                        {loans?.map((loan) => (
                            <div key={loan.Loan_ID} className="bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border border-2 p-4 md:p-5 lg:p-6 rounded-2xl flex justify-between items-center">
                                <div className="space-y-1 md:space-y-2 lg:space-y-3">
                                    <div className="flex items-end gap-x-2 md:gap-x-3 lg:gap-x-4">
                                        <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">
                                            {loan.Book_Title}
                                        </h2>
                                        <p className="text-light-text/50 dark:text-dark-text/50 text-md md:text-base lg:text-lg">
                                            Loan ID: {loan.Loan_ID}
                                        </p>
                                    </div>
                                    <div className="flex gap-x-2 md:gap-x-3 lg:gap-x-4">
                                        <p className="text-sm md:text-md lg:text-base">
                                            L: {new Date(loan.Borrow_Date).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm md:text-md lg:text-base">
                                            R: {loan.Return_Date ? new Date(loan.Return_Date).toLocaleDateString() : "-"}
                                        </p>
                                    </div>
                                </div>
                                {loan.Return_Status === 0 ?
                                    <p className="text-sm md:text-md lg:text-base">
                                        Not returned
                                    </p>
                                    :
                                    <p className="text-sm md:text-md lg:text-base">
                                        Returned
                                    </p>
                                }
                            </div>
                        ))}
                    </div>
                </div>
                :
                null
            }
        </>
    )
}