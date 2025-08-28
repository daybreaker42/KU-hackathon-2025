"use client";

import { useEffect, useState } from "react";

export default function Page(){
  const SERVER_URL = '';
  const [data, setData] = useState(null);
  useEffect(() => {
    // fetch req to SERVER_URL
    fetch(SERVER_URL)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
  return (
    <div>{data ? JSON.stringify(data) : "Loading..."}</div>
  );
}