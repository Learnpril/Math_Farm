/**
 * TypeScript declarations for nerdamer library
 * Custom declarations since @types/nerdamer doesn't exist
 */

declare module 'nerdamer' {
  // Use a more flexible type that matches the actual nerdamer library
  const nerdamer: any;
  export = nerdamer;
  export default nerdamer;
}

declare global {
  interface Window {
    nerdamer?: any;
  }
}
