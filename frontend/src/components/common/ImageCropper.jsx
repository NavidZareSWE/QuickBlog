import { useState, useRef, useEffect } from "react";
import CropBox from "./CropBox";

const ImageCropper = ({
  croppedImage,
  setCroppedImage,
  setCroppedVerified,
  thumbWidth = undefined,
  thumbHeight = undefined,
}) => {
  const [image, setImage] = useState(null);
  const [magneticThreshold] = useState(7);
  const [minDragDistance] = useState(10);
  const [snapStatus, setSnapStatus] = useState({
    isSnapped: false,
    snappedEdges: {},
  });

  const cropperRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize cropper when image changes
  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (cropperRef.current) {
            cropperRef.current.destroy();
          }

          cropperRef.current = new CropBox({
            imageBox: ".imageBox",
            thumbBox: ".thumbBox",
            spinner: ".spinner",
            imgSrc: e.target.result,
          });

          await cropperRef.current.init();
          // Apply initial magnetic settings
          cropperRef.current.setMagneticThreshold(magneticThreshold);
          cropperRef.current.setMinimumDragDistance(minDragDistance);
          updateSnapStatus();
        } catch (error) {
          console.error("Failed to initialize cropper:", error);
        }
      };
      reader.readAsDataURL(image);
    }
  }, [image, magneticThreshold, minDragDistance]);

  // Update snap status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (cropperRef.current) {
        const magneticSettings = cropperRef.current.getMagneticSettings();
        setSnapStatus({
          isSnapped: magneticSettings.isSnapped,
          snappedEdges: magneticSettings.snappedEdges,
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }
    };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setCroppedVerified(false);
      setCroppedImage(null);
    }
    e.target.value = "";
  };

  // Helper function to convert data URL to object URL
  function dataURLToObjectURL(dataURL) {
    return fetch(dataURL)
      .then((res) => res.blob())
      .then((blob) => URL.createObjectURL(blob));
  }

  const handleCrop = async (e) => {
    e.preventDefault();
    if (cropperRef.current) {
      try {
        const croppedDataURL = cropperRef.current.getDataURL();
        const objectURL = await dataURLToObjectURL(croppedDataURL);

        setCroppedImage(objectURL);

        // Optional: Store the object URL for cleanup later
        // You might want to revoke it when component unmounts or when setting a new image
        // URL.revokeObjectURL(objectURL);
      } catch (error) {
        console.error("Failed to crop image:", error);
      }
    }
  };

  const handleZoomIn = (e) => {
    e.preventDefault();
    if (cropperRef.current) {
      cropperRef.current.zoomIn();
      updateSnapStatus();
    }
  };

  const defaultZoom = (e) => {
    e.preventDefault();
    if (cropperRef.current) {
      cropperRef.current.resetZoom();
      updateSnapStatus();
    }
  };

  const handleZoomOut = (e) => {
    e.preventDefault();
    if (cropperRef.current) {
      cropperRef.current.zoomOut();
      updateSnapStatus();
    }
  };

  const fitImageToThumbBox = (e) => {
    e.preventDefault();
    if (cropperRef.current && cropperRef.current.getImageDimensions) {
      const dim = cropperRef.current.getImageDimensions();
      const thumb_w = cropperRef.current.thumbBox?.clientWidth;
      const thumb_h = cropperRef.current.thumbBox?.clientHeight;

      const scaleX = thumb_w / dim.width;
      const scaleY = thumb_h / dim.height;

      const newRatio = Math.min(scaleX, scaleY);
      cropperRef.current.setRatio(newRatio);
      updateSnapStatus();
    } else {
      console.error("Cropper is not initialized or setRatio is not a function");
    }
  };

  const updateSnapStatus = () => {
    if (cropperRef.current) {
      const magneticSettings = cropperRef.current.getMagneticSettings();
      setSnapStatus({
        isSnapped: magneticSettings.isSnapped,
        snappedEdges: magneticSettings.snappedEdges,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-5">
      <div
        className="imageBox relative w-96 h-96 border-2 border-gray-300 mx-auto my-5 cursor-move overflow-hidden"
        style={{
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
        }}
      >
        <div
          className={`${thumbHeight ? `h-[${thumbHeight}]` : `h-48`} ${thumbWidth ? `w-[${thumbWidth}]` : `w-48`} thumbBox absolute top-1/2 left-1/2 border-2 border-white z-10 cursor-move`}
          style={{
            marginTop: "-96px",
            marginLeft: "-96px",
            boxShadow: "0 0 0 1000px rgba(0, 0, 0, 0.5)",
            background: "none",
          }}
        ></div>
        <div className="spinner absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg text-gray-600 z-20 hidden">
          Loading...
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 my-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-md cursor-pointer transition-colors duration-200 inline-block"
        >
          Select Image 🖼️
        </label>

        <div
          className={` ${image ? `block` : " hidden"} flex items-center justify-between gap-1 transition-opacity duration-200 ease-in-out`}
        >
          <span className="text-sm text-gray-600">Snap Status:</span>
          <div
            className={`text-sm font-medium ${snapStatus.isSnapped ? "text-green-600" : "text-gray-400"}`}
          >
            {snapStatus.isSnapped ? "🧲 Snapped" : "🔓 Free"}
          </div>
        </div>

        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />

        <div className="flex gap-3">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            onClick={handleCrop}
            disabled={!image}
          >
            Crop
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-bold text-xl"
            onClick={handleZoomIn}
            disabled={!image}
          >
            +
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            onClick={defaultZoom}
            disabled={!image}
          >
            Default Zoom
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            onClick={fitImageToThumbBox}
            disabled={!image}
          >
            Fit
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-bold text-xl"
            onClick={handleZoomOut}
            disabled={!image}
          >
            -
          </button>
        </div>
      </div>

      {croppedImage && (
        <div className="flex justify-center mt-5">
          <img
            src={croppedImage}
            alt="Cropped"
            className="w-64 h-64 object-cover border-2 border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          />
        </div>
      )}
    </div>
  );
};

export default ImageCropper;
