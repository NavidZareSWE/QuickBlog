import { useRef } from "react";
import { assets } from "../../assets/images/assets";
import { useAppContext } from "../../hooks/useAppContext";
import Form from "../common/Form";

const Header = () => {
  const { setInput, input } = useAppContext();
  const fromRef = useRef();

  const onClear = () => {
    setInput('')
    fromRef.current.clear();
  }
  return (
    <div className="mx-8 sm:mx-16 xl:mx-24 relative">
      <div className="text-center mt-20 mb-8">
        <div className="inline-flex items-center justify-center gap-4 px-6 py-1.5 mb-4 border border-primary/40 bg-primary/10 rounded-full text-sm text-primary">
          <p>New: AI feature integrated</p>
          <img src={assets.star_icon} className="w-2.5" alt="star" />
        </div>
        <h1 className="text-3xl sm:text-6xl font-semibold sm:leading-16 text-gray-700">
          Your own <span className="text-primary">blogging</span> <br />{" "}
          platform.{" "}
        </h1>
        {/* 
            'max-sm:text-xs' applies 'text-xs' on screens below the 'sm' breakpoint, 
                            @media (width < 40rem * 640px *) {
            while 'sm:text-xs' applies it on 'sm' screens and larger.
                            @media (width >= 40rem * 640px *) {
            */}
        <p className="my-6 sm:my-8 max-w-2xl m-auto text-base sm:text-sm text-gray-500">
          This is your space to think out loud, to share what matters, and to
          write without filters. Whether it's one word or a thousand, your story
          starts right here.
        </p>
        <Form
          placeholder={"Search for blogs"}
          required={true}
          onSubmit={(value) => setInput(value)}
          ref={fromRef}
        />
      </div>

      <div className="text-center">
        {input && (
          <button onClick={onClear} className="border font-light text-xs py-1 px-3 rounded-sm shadow-custom-sm cursor-pointer">
            Clear Search
          </button>
        )}
      </div>
      <img
        src={assets.gradientBackground}
        alt=""
        className="absolute -top-50 -z-1 opacity-50"
      />
    </div>
  );
};

export default Header;
