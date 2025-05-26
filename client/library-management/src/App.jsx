import { BrowserRouter as Router, Routes, Route } from "react-router"
import Home from "./pages/Home"
import Layout from "./Layout"
import SignUp from "./pages/SignUp"
import SignIn from "./pages/SignIn"
import StaffSignIn from "./pages/StaffSignIn"
import Books from "./pages/Books"
import StaffBooks from "./pages/StaffBooks"
import Loans from "./pages/Loans"
import StaffLoans from "./pages/StaffLoans"

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/staffsignin" element={<StaffSignIn />} />
          <Route path="/books" element={<Books />} />
          <Route path="/staffbooks" element={<StaffBooks />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/staffloans" element={<StaffLoans />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
