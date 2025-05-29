import "./App.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import "bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedView from "./components/protected_view";
import { useLoadingBar } from "react-top-loading-bar";
import Header from "./components/header";
import React from "react";


const Lazy404Page = React.lazy(() => import("./pages/404"));
const LazyHomePage = React.lazy(() => import("./pages/home"));
const LazyLoginPage = React.lazy(() => import("./pages/login"));
const LazyLogoutPage = React.lazy(() => import("./pages/logout"));
const LazySignupPage = React.lazy(() => import("./pages/signup"));
const LazyProfilePage = React.lazy(() => import("./pages/profile"));
const LazySettingsPage = React.lazy(() => import("./pages/settings"))
const LazyMakePostPage = React.lazy(() => import("./pages/make_post"))
const LazyEditPostPage = React.lazy(() => import("./pages/edit_post"))
const LazyEditUserPage = React.lazy(() => import("./pages/edit_user"))
const LazyQuestionsPage = React.lazy(() => import("./pages/questions"));
const LazySharedPostPage = React.lazy(() => import("./pages/shared_post_page"));
const LazySocialFriendsPage = React.lazy(() => import("./pages/social_friends"));
const LazyForgetPasswordPage = React.lazy(() => import("./pages/forget_password"));
const LazySeeUserFriendsPage = React.lazy(() => import("./pages/see_user_friends"));
const LazySeeUserFriendsRequestsPage = React.lazy(() => import("./pages/see_user_friends_requests"));
const LazyChatPage = React.lazy(() => import("./pages/Chat"));
const LazyChatsPage = React.lazy(() => import("./pages/Chats"));

function App() {
  useLoadingBar({
    color: "blue",
    height: 2,
  });
  
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedView>
              <LazyHomePage />
            </ProtectedView>
          }
        />
        <Route path="/login" element={<LazyLoginPage />} />
        <Route path="/signup" element={<LazySignupPage />} />
        <Route path="/logout" element={<LazyLogoutPage />} />
        <Route path="/user/forgot-password" element={<LazyForgetPasswordPage />} />
        <Route path="/common-questions" element={<LazyQuestionsPage />} />

        <Route
          path="/make-post"
          element={
            <ProtectedView>
              <LazyMakePostPage />
            </ProtectedView>
          }
        />
        <Route
          path="/edit-post-page/:id"
          element={
            <ProtectedView>
              <LazyEditPostPage />
            </ProtectedView>
          }
        />
        <Route
          path="/post/:id"
          element={
            <ProtectedView>
              <LazySharedPostPage />
            </ProtectedView>
          }
        />
        <Route
          path="/see-user-friends"
          element={
            <ProtectedView>
              <LazySeeUserFriendsPage />
            </ProtectedView>
          }
        />
        <Route
          path="/see-friends-requests"
          element={
            <ProtectedView>
              <LazySeeUserFriendsRequestsPage />
            </ProtectedView>
          }
        />
        <Route
          path="/social-friends"
          element={
            <ProtectedView>
              <LazySocialFriendsPage />
            </ProtectedView>
          }
        />
        <Route
          path="/social-user-profile"
          element={
            <ProtectedView>
              <LazyProfilePage />
            </ProtectedView>
          }
        />
        <Route
          path="/user/edit"
          element={
            <ProtectedView>
              <LazyEditUserPage />
            </ProtectedView>
          }
        />
        <Route
          path="/user/settings"
          element={
            <ProtectedView>
              <LazySettingsPage />
            </ProtectedView>
          }
        />
        <Route
          path="/chat/:userId"
          element={
            <ProtectedView>
              <LazyChatPage />
            </ProtectedView>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedView>
              <LazyChatsPage />
            </ProtectedView>
          }
        />
        <Route path="*" element={<Lazy404Page />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
