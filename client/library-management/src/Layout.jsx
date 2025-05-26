import Header from "./components/Header";
import { Outlet } from "react-router";

export default function Layout() {
    return(
        <>
            <Header />
            <main className="mt-3 mb-6 md:mt-4 md:mb-8 flex-1">
                <Outlet />
            </main>
        </>
    )
}