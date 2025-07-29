import { assets } from "../../assets/images/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 bg-primary/3">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-500/30 text-gray-500">
        <div>
          <img src={assets.logo} alt="logo" className="w-32 sm:w-44" />
          <p className="max-w-[410px] mt-6">
            The Quick Blog App is a user-friendly platform that enables you to
            create and publish blogs effortlessly using AI. Simply input your
            ideas, and the app generates engaging content, suggests themes, and
            optimizes writing styles. Perfect for both seasoned writers and
            beginners, it streamlines the blogging process, allowing you to
            focus on creativity while the AI takes care of the details.
          </p>
        </div>
      </div>
      <p className="py-4 text-center text-sm md:text-base text-gray-500/80">
        Copyright 2025 &copy; QuickBlog{" "}
        <Link
          to={"https://github.com/NavidZareSWE"}
          className="font-semibold text-primary/80"
        >
          @NavidZareSWE
        </Link>{" "}
        - All Right Reserved
      </p>
    </div>
  );
};

export default Footer;
