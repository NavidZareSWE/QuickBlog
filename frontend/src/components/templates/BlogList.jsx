import List from "../common/List";
import {  blogCategories } from "../../assets/images/assets";

const BlogList = () => {
  return (
    <div>
      <List list={blogCategories} />

    </div>
  );
};

export default BlogList;
