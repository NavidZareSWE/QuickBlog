import Navbar from "../components/module/Navbar";
import Header from "../components/templates/Header";
import BlogList from "../components/templates/BlogList";
import Newsletter from "../components/module/Newsletter";
import Footer from "../components/module/Footer";

const Home = () => {
  return (
    <>
      <Navbar />
      <Header />
      <BlogList />
      <Newsletter />
      <Footer />
    </>
  );
};

export default Home;
