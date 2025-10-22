/**
 * A higher-order function that wraps another function to conditionally process its arguments.
 *
 * If the wrapper is called with two or more arguments, and the second argument
 * is a string that can be parsed into a finite number, it will:
 * 1. Convert the second argument to a Number.
 * 2. Ensure the third argument is an object and add 'count' and 'n' properties
 *    to it, with the value of the parsed number. If the third argument is not
 *    an object, a new object will be created.
 *
 * @param {Function} fn The function to wrap.
 * @returns {Function} A new function that wraps the original.
 */
export function translateWrapperFunction<TFn extends (...args: any[]) => any>(fn: TFn): TFn {
  // Return a new function that will be used in place of the original.
  // We use rest parameters (...args) to capture all arguments into an array.
  return ((...args: unknown[]) => {
    // Condition 1: Check if there are at least two arguments.
    if (args.length >= 2) {
      const secondArg = args[1];
      console.log(args, typeof secondArg)


      // Condition 2: Check if the second argument is a string that can be parsed into a number.
      // We use parseFloat and isFinite for a robust check.
      if (typeof secondArg === 'number' || (typeof secondArg === 'string' && !isNaN(parseFloat(secondArg)))) {
        const numericValue = parseFloat(secondArg.toString());
        const originalThirdArg = args[2];

        // Prepare the new third argument.
        // If the original third arg is a non-array object, merge with it.
        // Otherwise, create a new object.
        const newThirdArg = (typeof originalThirdArg === 'object' && originalThirdArg !== null && !Array.isArray(originalThirdArg))
          ? {...originalThirdArg, count: numericValue, n: numericValue}
          : {count: numericValue, n: numericValue};

        // Create a new arguments array with the modified values.
        const newArgs = [
          args[0],          // First argument
          //  numericValue,     // Converted second argument
          newThirdArg      // Modified or created third argument

        ];
        console.log(newThirdArg);
        // Call the original function with the modified arguments.
        // @ts-expect-error TS cannot infer types here
        return fn.apply(this, newArgs);
      }
    }

    // If conditions are not met, call the original function with the original arguments.
    // @ts-expect-error TS cannot infer types here
    return fn.apply(this, args);
  }) as TFn;
}

export default translateWrapperFunction;
