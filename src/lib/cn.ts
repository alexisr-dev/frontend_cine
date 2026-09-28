export const cn = (...clases: (string | false | null | undefined)[]) =>
  clases.filter(Boolean).join(' ')
