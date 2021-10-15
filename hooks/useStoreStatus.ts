import React from "react";
import { compareDesc } from "date-fns"

const time = 10000 // 1 minuto
export default function useStoreStatus ({ start, end, open }) {
  const [moment, setMoment] = React.useState(new Date())

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMoment(new Date())
    }, time);
    return () => clearInterval(interval);
  }, []);

  const arr = [
    date(start?.split(':')),
    moment,
    date(end?.split(':')),
  ].sort(compareDesc)

  function date (args) {
    if(!args?.length) return new Date()
    return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), ...args)
  }

  return (arr[1] === moment) && (!!start && !!end && !!open)
}