import { useEffect, useState } from "react";
import { blog_data } from "../../assets/images/assets";
import BlogTableItem from "../../components/module/admin/BlogTableItem";

const ListBlog = () => {
  const [blogs, setBlogs] = useState([]);

  const fetchBlogs = async () => {
    setBlogs(blog_data);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return <div className="flex-1 pt-5 px-5 sm:pt-12 sm:pl-16 bg-blue-50/50">
    <h1>All Blogs</h1>
        <div className="relative mt-4 h-4/5 max-w-4xl overflow-x-auto shadow rounded-lg scrollbar-hide bg-white">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-xs text-gray-600 text-left uppercase">
              <tr>
                {/* 
                  If the scope attribute is not specified (e.g., scope="col"), 
                  the browser may not correctly interpret the relationship 
                  between the header and the associated data cells. This can 
                  affect accessibility, as screen readers may not provide 
                  the necessary context for users. It is recommended to 
                  always specify the scope for clarity and improved 
                  accessibility in table structures.
                */}

                <th scope="col" className="px-2 py-3 xl:px-6">
                  #
                </th>
                <th scope="col" className="px-2 py-3">
                  Blog Title
                </th>
                <th scope="col" className="px-2 py-3 max-sm:hidden">
                  Date
                </th>
                <th scope="col" className="px-2 py-3 max-sm:hidden">
                  Status
                </th>
                <th scope="col" className="px-2 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog, index) => {
                return (
                  <BlogTableItem
                    key={blog._id}
                    blog={blog}
                    fetchBlogs={fetchBlogs}
                    index={index + 1}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
  </div>;
};

export default ListBlog;
