import { useEffect, useRef, useState } from "react";
import { assets, blogCategories } from "../../assets/images/assets";
import ImageCropper from "../../components/common/ImageCropper";
import Quill from "quill";
import { useAppContext } from "../../hooks/useAppContext";
import toast from "react-hot-toast";

const AddBlog = () => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const { axios } = useAppContext();

  const [isAdding, setIsAdding] = useState(false);

  const [image, setImage] = useState(false);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [category, setCategory] = useState("Startup");
  const [isPublished, setIsPublished] = useState(false);

  const [canUseCropper, setCanUseCropper] = useState(false);
  const [open, setOpen] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [croppedVerified, setCroppedVerified] = useState(false);
  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["clean"],

      // Text formatting options
      ["bold", "italic", "underline", "strike"],
      [{ script: "sub" }, { script: "super" }],
      [{ color: [] }, { background: [] }],

      // Block formatting options
      ["blockquote", "code-block"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],

      // Media and links
      ["link", "image", "video"],
    ],
  };

  const generateContent = async () => {};

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      setIsAdding(true);
      const blog = {
        title,
        subTitle,
        description: quillRef.current.root.innerHTML,
        category,
        isPublished,
      };
      const formData = new FormData();
      // Stringify the blog object to JSON format for transmission in FormData,
      // ensuring compatibility and preserving its structure for server processing.
      formData.append("blog", JSON.stringify(blog));
      // Convert blob URL to actual blob and append to FormData
      if (image) {
        if (canUseCropper && image.startsWith("blob:")) {
          const response = await fetch(image);
          const blob = await response.blob();
          const imageBlob = new Blob([blob], { type: "image/png" });
          formData.append("image", imageBlob);
        } else formData.append("image", image);
      } else {
        toast.error("Upload at least an image.");
        return;
      }
      const { data } = await axios.post("/api/blog/add", formData);
      if (data.success) {
        toast.success(data.message);
        setImage(false);
        setTitle("");
        setSubTitle("");
        setIsPublished(false);
        quillRef.current.root.innerHTML = "";
        setCategory("Startup");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    // Initialize Quill
    if (!quillRef.current && editorRef.current)
      quillRef.current = new Quill(editorRef.current, {
        modules,
        theme: "snow",
      });
  }, []);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex-1 bg-blue-50/50 text-gray-600 h-full overflow-scroll"
    >
      <div className="bg-white w-full max-w-3xl p-4 md:p-10 sm:m-10 shadow rounded">
        <p>Upload thumbnail</p>
        <div className="flex gap-2 mt-4">
          <p>
            Use Cropper? <b>(Beta)</b>
          </p>
          <input
            type="checkbox"
            checked={canUseCropper}
            className="scale-125 cursor-pointer"
            // Update the state based on the checkbox's current checked status for accurate state management
            onChange={(e) => setCanUseCropper(e.target.checked)}
          />
        </div>
        <label htmlFor="image" className="cursor-pointer">
          <img
            onClick={() => setOpen(true)}
            className="w-25 md:w-50"
            src={
              !image
                ? assets.upload_area
                : image instanceof File
                  ? URL.createObjectURL(image)
                  : image
            }
            alt="Upload"
          />
          {canUseCropper && open ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setOpen(false)}
              ></div>
              {/* Modal Container */}
              <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto p-6 my-8 max-h-full overflow-y-auto">
                <ImageCropper
                  croppedImage={croppedImage}
                  setCroppedImage={setCroppedImage}
                  croppedVerified={croppedVerified}
                  setCroppedVerified={setCroppedVerified}
                />
                {croppedImage && (
                  <div className="flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setCroppedVerified(true);
                        setOpen(false);
                        setImage(croppedImage);
                        setCroppedImage(null);
                      }}
                      className="mb-14 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-bold text-xl"
                    >
                      Submit ✅
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              name="image"
              id="image"
              hidden
            />
          )}
        </label>
        <p className="mt-4">Blog Title</p>
        <input
          type="text"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          placeholder="Blog Title"
          required
          className="w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded"
        />
        <p className="mt-4">Sub Title</p>
        <input
          type="text"
          onChange={(e) => setSubTitle(e.target.value)}
          value={subTitle}
          placeholder="Blog Title"
          required
          className="w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded"
        />
        <p className="mt-4">Blog Description</p>
        <div className="max-w-lg h-74 pb-16 sm:pb-10 pt-2 relative">
          <div ref={editorRef}></div>
          <button
            type="button"
            onClick={generateContent}
            className="absolute bottom-1 right-2 ml-2 text-xs text-white bg-black/70 px-4 py-1.5 rounded hover:underline cursor-pointer"
          >
            Generate with AI
          </button>
        </div>
        <p className="mt-4">Blog Category</p>
        <select
          onChange={(e) => setCategory(e.target.value)}
          name="category"
          id="category"
          className="mt-2 px-3 py-2 border text-gray-500 border-gray-300 outline-none rounded"
        >
          <option value="" hidden>
            Select Category
          </option>
          {blogCategories.map((item, index) => {
            return (
              <option value={item} key={index}>
                {item}
              </option>
            );
          })}
        </select>
        <div className="flex gap-2 mt-4">
          <p>Publish Now</p>
          <input
            type="checkbox"
            checked={isPublished}
            className="scale-125 cursor-pointer"
            // Update the state based on the checkbox's current checked status for accurate state management
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </div>
        <button
          disabled={isAdding}
          type="submit"
          className={`${isAdding ? "cursor-not-allowed bg-primary/80 " : " cursor-pointer bg-primary"} mt-8 w-40 h-10 text-white rounded  text-sm hover:scale-105`}
        >
          {isAdding ? "Adding..." : "Add Blog"}
        </button>
      </div>
    </form>
  );
};

export default AddBlog;
