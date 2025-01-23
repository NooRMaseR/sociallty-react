import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import SeeUserFriendsPage from "./pages/see_user_friends";
import ProtectedView from "./components/protected_view";
import SocialFriendsPage from "./pages/social_friends";
import SharedPostPage from "./pages/shared_post_page";
import MakePostPage from "./pages/make_post";
import EditPostPage from "./pages/edit_post";
import ProfilePage from "./pages/profile";
import Header from "./components/header";
import Logout from "./pages/logout";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Home from "./pages/home";

function App() {
  
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedView>
              <Home />
            </ProtectedView>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />

        <Route
          path="/make-post"
          element={
            <ProtectedView>
              <MakePostPage />
            </ProtectedView>
          }
        />
        <Route
          path="/edit-post-page/:id"
          element={
            <ProtectedView>
              <EditPostPage />
            </ProtectedView>
          }
        />
        <Route
          path="/post/:id"
          element={
            <ProtectedView>
              <SharedPostPage />
            </ProtectedView>
          }
        />
        <Route
          path="/see-user-friends"
          element={
            <ProtectedView>
              <SeeUserFriendsPage />
            </ProtectedView>
          }
        />
        <Route
          path="/social-friends"
          element={
            <ProtectedView>
              <SocialFriendsPage />
            </ProtectedView>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedView>
              <ProfilePage />
            </ProtectedView>
          }
        />
        <Route
          path="/profile/social-user"
          element={
            <ProtectedView>
              <ProfilePage />
            </ProtectedView>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
