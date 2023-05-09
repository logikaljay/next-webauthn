"use client"

type RelativeStringProps = {
  date: Date
}

const DAY_MILLISECONDS = 1000 * 60 * 60 * 24;

const rtf = new Intl.RelativeTimeFormat('en', { style: 'short', numeric: 'auto' });

export function RelativeString(props: RelativeStringProps) {

  const daysDifference = Math.round(
    (props.date.getTime() - new Date().getTime()) / DAY_MILLISECONDS
  )

  return (
    <>
      {rtf.format(daysDifference, 'day')}
    </>
  )
}