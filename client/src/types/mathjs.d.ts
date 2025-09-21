/**
 * TypeScript declarations for math.js library
 * Custom declarations to handle dynamic imports and global access
 */

declare module 'mathjs' {
  // Use a more flexible type that matches the actual mathjs library
  const mathjs: any;
  export = mathjs;
  export default mathjs;
}

declare global {
  interface Window {
    math?: any;
  }
}
