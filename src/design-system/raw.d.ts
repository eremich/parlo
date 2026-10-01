// Vite can import files as text; this declares it for the type checker.
declare module '*?raw' {
  const content: string
  export default content
}
