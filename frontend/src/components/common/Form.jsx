import { useRef, forwardRef, useImperativeHandle } from "react";

const Form = forwardRef(
  (
    { placeholder, required, buttonText = "Submit", onSubmit, ...otherProps },
    ref,
  ) => {
    const inputRef = useRef();

    const clear = () => {
      inputRef.current.value = "";
    };

    // Expose the clear method to parent component
    useImperativeHandle(ref, () => ({
      clear,
    }));

    const onSubmitHandler = async (e) => {
      e.preventDefault();
      if (onSubmit) {
        onSubmit(inputRef.current.value);
      }
    };

    return (
      <form
        onSubmit={onSubmitHandler}
        className="flex justify-between max-w-lg max-sm:scale-75 scale-90 mx-auto border border-gray-300 bg-white rounded overflow-hidden"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          required={required}
          className="w-full pl-4 outline-none"
          {...otherProps}
        />
        <button
          type="submit"
          className="bg-primary text-white px-8 py-2 m-1.5 rounded hover:scale-105 transition-all cursor-pointer"
        >
          {buttonText}
        </button>
      </form>
    );
  },
);

export default Form;

/*
forwardRef:
- Allows a component to receive a "ref" from its parent, enabling direct access 
  to child methods or elements.
- Without it, the parent cannot access the child's internal methods or elements.
- Syntax: forwardRef((props, ref) => { your component })
- The "ref" parameter is passed down from the parent.

useImperativeHandle:
- Controls what the parent can access when using the ref.
- It defines a "remote control" with specific methods/values for the parent.
- The first parameter is the ref from the parent, and the second is a function 
  returning the methods/values to expose.
- This ensures the parent can only access what you allow, enhancing security.

How it works together:
1. Parent creates a ref using useRef().
2. Parent passes the ref to the child component.
3. forwardRef receives that ref in the child.
4. useImperativeHandle defines what the parent's ref contains.
5. The parent can now call exposed methods on the child.

Real-world analogy:
- forwardRef is like giving someone a remote control to your TV.
- useImperativeHandle is like programming that remote with specific buttons 
  for changing channels or adjusting the volume.
- The parent is the person using the remote to control the TV, accessing only 
  the functions you’ve made available.

In the parent component:
- A ref is created and passed to the child.
- This establishes a two-way communication: 
  - Parent to Child via props.
  - Child to Parent via exposed methods through the ref.
*/
