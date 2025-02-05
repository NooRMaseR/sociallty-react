import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import SeeUserFriendsRequestsPage from "./pages/see_user_friends_requests";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SeeUserFriendsPage from "./pages/see_user_friends";
import ForgetPasswordPage from "./pages/forget_password";
import ProtectedView from "./components/protected_view";
import SocialFriendsPage from "./pages/social_friends";
import SharedPostPage from "./pages/shared_post_page";
import MakePostPage from "./pages/make_post";
import EditPostPage from "./pages/edit_post";
import EditUserPage from "./pages/edit_user";
import SettingsPage from "./pages/settings";
import ProfilePage from "./pages/profile";
import Header from "./components/header";
import Logout from "./pages/logout";
import Signup from "./pages/signup";
import Page404 from "./pages/404";
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
        <Route path="/user/forgot-password" element={<ForgetPasswordPage />} />

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
          path="/see-friends-requests"
          element={
            <ProtectedView>
              <SeeUserFriendsRequestsPage />
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
          path="/social-user-profile"
          element={
            <ProtectedView>
              <ProfilePage />
            </ProtectedView>
          }
        />
        <Route
          path="/user/edit"
          element={
            <ProtectedView>
              <EditUserPage />
            </ProtectedView>
          }
        />
        <Route
          path="/user/settings"
          element={
            <ProtectedView>
              <SettingsPage />
            </ProtectedView>
          }
        />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
