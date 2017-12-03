declare module 'catsup' {
  interface FileWithContents {
    filename: string
    contents: string
  }

  interface OutputContents {
    html: FileWithContents
    js: [FileWithContents]
  }

  declare function catsup(input: FileWithContents): OutputContents
  export catsup
}
