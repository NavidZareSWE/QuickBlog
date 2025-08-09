import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import AddBlog from "./pages/admin/AddBlog";
import Comments from "./pages/admin/Comments";
import ListBlog from "./pages/admin/ListBlog";
import Login from "./components/module/admin/Login";
import "quill/dist/quill.snow.css";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./hooks/useAppContext";

const App = () => {
  const { token } = useAppContext();
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/admin" element={token ? <Layout /> : <Login />}>
          {/* 
  When the "/admin" URL is accessed, the Layout component will be rendered, 
  and the Dashboard component will be displayed as the default child route
  (index) within the Layout.
*/}

          <Route index element={<Dashboard />} />
          {/* /addBlog vs addBlog
              - /addBlog: This is an absolute path,
                      meaning it starts from the root of the application.
              - addBlog: This is a relative path
                       which is resolved based on the current route's path.
          */}
          <Route path="addBlog" element={<AddBlog />} />
          <Route path="listBlog" element={<ListBlog />} />
          <Route path="comments" element={<Comments />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
