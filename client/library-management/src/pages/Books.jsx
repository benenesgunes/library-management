import axios from "axios";
import useAuthStore from "../useAuthStore";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

export default function Books() {
    const navigate = useNavigate();
    const API_BASE = "http://localhost:3000";
    const [ books, setBooks ] = useState();
    const [ authors, setAuthors ] = useState();
    const [ categories, setCategories ] = useState();
    const [ author, setAuthor ] = useState("");
    const [ category, setCategory ] = useState("");
    const { token, isStaff } = useAuthStore.getState();
    
    useEffect(() => {
        const fetchBooks = async () => {

            if(!token) {
                return navigate("/signup");
            }

            if(isStaff) {
                return navigate("/");
            }

            try {
                const response = await axios.get(`${API_BASE}/api/member/books`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                if(response.data.success) {
                    setBooks(response.data.data);
                    console.log("books fetched successfully")
                }
            }
            catch(error) {
                console.log(error);
            }
        }

        const getAuthors = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/authors`);

                if(response.data.success) {
                    setAuthors(response.data.data);
                    console.log("fetched authors successfully");
                }
            }
            catch(error) {
                console.log(error);
            }
        }

        const getCategories = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/categories`);

                if(response.data.success) {
                    setCategories(response.data.data);
                    console.log("fetched categories successfully");
                }
            }
            catch(error) {
                console.log(error);
            }
        }

        fetchBooks();
        getAuthors();
        getCategories();
    }, [])

    const filterBooks = async (a, c) => {
        try {
            const response = await axios.get(`${API_BASE}/api/member/books/filter?category=${c}&author=${a}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            console.log("author", a, "category", c)

            if(response.data.success) {
                console.log("response:", response)
                setBooks(response.data.data);
                console.log("filtered books successfully");
            }
        }
        catch(error) {
            console.log(error);
        }
    }

    return(
        <>
            {token ?
                <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-y-2 md:gap-y-3 lg:gap-y-4">
                    <div className="flex flex-col gap-y-4 md:flex-row md:justify-between md:items-center mb-2">
                        <h1 className="font-semibold text-xl md:text-2xl lg:text-3xl">
                            Available Books
                        </h1>
                        <div className="flex flex-col gap-y-4 md:flex-row md:items-center gap-x-4 md:gap-x-6 lg:gap-x-8">
                            <select name="author" id="authorSelect" onChange={(e) => setAuthor(e.target.value)}>
                                <option value="">
                                    Filter by author
                                </option>
                                {authors?.map((author, index) => (
                                    <option key={index} value={author.Author_Name}>
                                        {author.Author_Name}
                                    </option>
                                ))}
                            </select>
                            <select name="category" id="categorySelect" onChange={(e) => setCategory(e.target.value)}>
                                <option value="">
                                    Filter by category
                                </option>
                                {categories?.map((category, index) => (
                                    <option key={index} value={category.Category_Name}>
                                        {category.Category_Name}
                                    </option>
                                ))}
                            </select>
                            <button onClick={() => filterBooks(author, category)} className="primary-button w-fit">
                                Filter
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-2 md:gap-y-3 lg:gap-y-4 md:gap-x-3 lg:gap-x-4 md:grid md:grid-cols-2 xl:grid-cols-3">
                        {books?.map((book) => (
                            <div key={book.Book_ID} className="bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border border-2 p-4 md:p-5 lg:p-6 rounded-2xl space-y-1 md:space-y-2 lg:space-y-3">
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
                        ))}
                    </div>
                </div>
                :
                null
            }
        </>
    )
}