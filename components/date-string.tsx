"use client"

type DateStringProps = {
  date: Date
}

export function DateString(props: DateStringProps) {
  return (
    <>
      {props.date.toLocaleDateString('en-NZ')}
    </>
  )
}